import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data: resort, error } = await adminSupabase
		.from('resorts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (error || !resort) {
		throw redirect(303, '/admin');
	}

	// Generate signed URLs for existing gallery images
	let galleryUrls: { path: string; url: string }[] = [];
	if (resort.gallery?.length) {
		const results = await Promise.all(
			resort.gallery.map(async (path: string) => {
				const { data } = await adminSupabase.storage
					.from('resort-photos')
					.createSignedUrl(path, 3600);
				return { path, url: data?.signedUrl ?? '' };
			})
		);
		galleryUrls = results.filter((r) => r.url);
	}

	return { resort, galleryUrls };
};

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export const actions: Actions = {
	update: async ({ params, request }) => {
		const formData = await request.formData();

		const name = (formData.get('name') as string)?.trim();
		const location = (formData.get('location') as string)?.trim();
		const contact = (formData.get('contact') as string) || '';
		const rate_12h = (formData.get('rate_12h') as string) || '';
		const rate_22h = (formData.get('rate_22h') as string) || '';
		const pax = (formData.get('pax') as string) || '';
		const add_pax_rate = (formData.get('add_pax_rate') as string) || '';
		const rooms = (formData.get('rooms') as string) || '';
		const pool = (formData.get('pool') as string) || '';
		const inclusions = (formData.get('inclusions') as string)
			?.split(',')
			.map((s) => s.trim())
			.filter(Boolean) || [];
		const amenities = (formData.get('amenities') as string)
			?.split(',')
			.map((s) => s.trim())
			.filter(Boolean) || [];

		const latRaw = (formData.get('latitude') as string)?.trim();
		const lngRaw = (formData.get('longitude') as string)?.trim();
		const latitude = latRaw ? parseFloat(latRaw) : null;
		const longitude = lngRaw ? parseFloat(lngRaw) : null;

		if (!name || !location) {
			return fail(400, { error: 'Resort name and location are required.' });
		}

		const slug = generateSlug(name);

		const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false }
		});

		// Check if another resort uses the same slug/name
		const { data: existing } = await adminSupabase
			.from('resorts')
			.select('id, name')
			.neq('id', params.id)
			.or(`slug.eq.${slug},name.ilike.${name}`)
			.maybeSingle();

		if (existing) {
			return fail(400, { error: `Another resort named "${name}" already exists in the archive.` });
		}

		// Get current gallery from DB (for reference)
		const { data: current } = await adminSupabase
			.from('resorts')
			.select('gallery')
			.eq('id', params.id)
			.single();

		// Handle photo removals: delete from storage
		const removePaths = formData.getAll('remove_photo') as string[];
		if (removePaths.length > 0) {
			await adminSupabase.storage
				.from('resort-photos')
				.remove(removePaths);
		}

		// Build gallery from the submitted order (what the user dragged), excluding removed ones
		const galleryOrderSubmitted = formData.getAll('gallery_order') as string[];
		let gallery: string[] = galleryOrderSubmitted.length > 0
			? galleryOrderSubmitted.filter((p) => !removePaths.includes(p))
			: (current?.gallery ?? []).filter((p: string) => !removePaths.includes(p));

		// Handle new photo uploads — append after the ordered existing photos
		const files = formData.getAll('photos') as File[];
		for (const file of files) {
			if (!file || file.size === 0) continue;

			const ext = file.name.split('.').pop();
			const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
			const path = `${params.id}/${filename}`;

			const { error: uploadError } = await adminSupabase.storage
				.from('resort-photos')
				.upload(path, file);

			if (!uploadError) {
				gallery.push(path);
			}
		}

		// Update resort
		const updatePayload: Record<string, any> = {
			name,
			slug,
			location,
			contact,
			rate_12h,
			rate_22h,
			pax,
			add_pax_rate,
			rooms,
			pool,
			inclusions,
			amenities,
			gallery,
			updated_at: new Date().toISOString()
		};

		if (latitude != null) updatePayload.latitude = latitude;
		if (longitude != null) updatePayload.longitude = longitude;

		let { error } = await adminSupabase
			.from('resorts')
			.update(updatePayload)
			.eq('id', params.id);

		// If latitude column does not exist in schema cache, retry without coordinates
		if (error && (error.message?.includes('latitude') || error.code === 'PGRST204' || error.code === '42703')) {
			console.warn('Latitude column not found in Supabase schema, retrying update without coordinates.');
			delete updatePayload.latitude;
			delete updatePayload.longitude;
			const retry = await adminSupabase
				.from('resorts')
				.update(updatePayload)
				.eq('id', params.id);
			error = retry.error;
		}

		if (error) {
			return fail(500, { error: error.message });
		}

		throw redirect(303, '/admin');
	}
};

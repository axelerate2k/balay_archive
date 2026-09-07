import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

export const actions: Actions = {
	default: async ({ request }) => {
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

		if (!name || !location) {
			return fail(400, { error: 'Resort name and location are required.' });
		}

		const slug = generateSlug(name);

		const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false }
		});

		// Check if a resort with the same slug or name already exists
		const { data: existing } = await adminSupabase
			.from('resorts')
			.select('id, name')
			.or(`slug.eq.${slug},name.ilike.${name}`)
			.maybeSingle();

		if (existing) {
			return fail(400, { error: `A resort named "${name}" already exists in the archive.` });
		}

		// Insert resort
		const { data: resort, error } = await adminSupabase
			.from('resorts')
			.insert({
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
				gallery: []
			})
			.select()
			.single();

		if (error) {
			console.error('Insert error:', error);
			if (error.code === '23505') {
				return fail(400, { error: `A resort named "${name}" already exists in the archive.` });
			}
			return fail(500, { error: error.message });
		}

		// Upload gallery images
		const files = formData.getAll('photos') as File[];
		const galleryPaths: string[] = [];

		for (const file of files) {
			if (!file || file.size === 0) continue;

			const ext = file.name.split('.').pop();
			const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
			const path = `${resort.id}/${filename}`;

			const { error: uploadError } = await adminSupabase.storage
				.from('resort-photos')
				.upload(path, file);

			if (!uploadError) {
				galleryPaths.push(path);
			} else {
				console.error('Upload error:', uploadError);
			}
		}

		// Update gallery paths if any photos were uploaded
		if (galleryPaths.length > 0) {
			await adminSupabase
				.from('resorts')
				.update({ gallery: galleryPaths })
				.eq('id', resort.id);
		}

		throw redirect(303, '/admin');
	}
};

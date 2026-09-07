import type { PageServerLoad } from './$types';
import type { Resort } from '$lib/types/resort';
import { resorts as mockResorts, getPhotoUrl } from '$lib/data/resorts';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = locals;

	// If no session, return empty — the layout gate will handle redirect
	if (!session) {
		return { resorts: [] as Resort[] };
	}

	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	// Try to load from Supabase
	const { data: dbResorts, error } = await adminSupabase
		.from('resorts')
		.select('*')
		.order('created_at');

	// If Supabase returns data, map it to our Resort shape and generate signed gallery URLs
	if (dbResorts && dbResorts.length > 0) {
		const resorts: Resort[] = await Promise.all(
			dbResorts.map(async (r) => {
				// Generate signed URLs for gallery images
				let galleryUrls: string[] = [];
				if (r.gallery && r.gallery.length > 0) {
					const signedResults = await Promise.all(
						r.gallery.map((path: string) =>
							adminSupabase.storage
								.from('resort-photos')
								.createSignedUrl(path, 3600)
						)
					);
					galleryUrls = signedResults
						.map((result) => result.data?.signedUrl)
						.filter((url): url is string => !!url);
				}

				return {
					id: r.id,
					slug: r.slug,
					name: r.name,
					location: r.location,
					contact: r.contact ?? '',
					rate12: r.rate_12h ?? '',
					rate22: r.rate_22h ?? '',
					pax: r.pax ?? '',
					addPax: r.add_pax_rate ?? '',
					rooms: r.rooms ?? '',
					pool: r.pool ?? '',
					inclusions: r.inclusions ?? [],
					amenities: r.amenities ?? [],
					gallery: galleryUrls,
					image_seed: r.slug,
					created_at: r.created_at,
					updated_at: r.updated_at
				} satisfies Resort;
			})
		);

		return { resorts };
	}

	// Fallback to mock data if Supabase is empty or errored
	return {
		resorts: mockResorts.map((r) => ({
			...r,
			slug: r.id,
			gallery: Array.from({ length: 7 }, (_, i) =>
				getPhotoUrl(`${r.image_seed}-${i}`, 700, 900)
			)
		}))
	};
};

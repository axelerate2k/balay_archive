import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Resort } from '$lib/types/resort';
import { resorts as mockResorts, getPhotoUrl } from '$lib/data/resorts';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { slug } = params;

	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	// Attempt to query Supabase
	const { data: r, error: dbError } = await adminSupabase
		.from('resorts')
		.select('*')
		.eq('slug', slug)
		.maybeSingle();

	if (r) {
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

		// If no gallery photos uploaded yet, provide placeholder set
		if (galleryUrls.length === 0) {
			galleryUrls = Array.from({ length: 7 }, (_, i) =>
				getPhotoUrl(`${r.slug}-${i + 1}`, 800, 1100)
			);
		}

		const mockMatch = mockResorts.find(
			(m) => m.slug === r.slug || m.id === r.slug || m.name.toLowerCase() === r.name.toLowerCase()
		);
		const latitude = r.latitude != null ? Number(r.latitude) : (mockMatch?.latitude ?? null);
		const longitude = r.longitude != null ? Number(r.longitude) : (mockMatch?.longitude ?? null);

		const resort: Resort = {
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
			latitude,
			longitude,
			created_at: r.created_at,
			updated_at: r.updated_at
		};

		return { resort };
	}

	// Fallback to mock data
	const mock = mockResorts.find((m) => m.slug === slug || m.id === slug);
	if (mock) {
		const resort: Resort = {
			...mock,
			slug: mock.id,
			gallery: Array.from({ length: 7 }, (_, i) =>
				getPhotoUrl(`${mock.image_seed}-${i + 1}`, 800, 1100)
			)
		};
		return { resort };
	}

	throw error(404, `Resort "${slug}" was not found in the archive.`);
};

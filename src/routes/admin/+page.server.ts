import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: PageServerLoad = async () => {
	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data: resorts, error } = await adminSupabase
		.from('resorts')
		.select('id, slug, name, location, created_at')
		.order('created_at', { ascending: false });

	if (error) {
		console.error('Admin load error:', error);
	}

	return {
		resorts: resorts ?? []
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'Missing resort ID' });
		}

		const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: { persistSession: false }
		});

		// Delete associated storage files first
		const { data: resort } = await adminSupabase
			.from('resorts')
			.select('gallery')
			.eq('id', id)
			.single();

		if (resort?.gallery?.length) {
			await adminSupabase.storage
				.from('resort-photos')
				.remove(resort.gallery);
		}

		const { error } = await adminSupabase
			.from('resorts')
			.delete()
			.eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};

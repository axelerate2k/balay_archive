import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = locals;

	if (!session || !user) {
		throw redirect(303, '/auth/login');
	}

	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	// Check for admin role
	const { data: allowedUser } = await adminSupabase
		.from('allowed_users')
		.select('role')
		.eq('email', user.email)
		.maybeSingle();

	if (!allowedUser || allowedUser.role !== 'admin') {
		throw redirect(303, '/');
	}

	return {
		user
	};
};

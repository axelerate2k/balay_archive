import type { LayoutServerLoad } from './$types';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, user } = locals;

	// Not authenticated — let the client render the login UI
	if (!session || !user) {
		return {
			session: null,
			user: null,
			allowed: false,
			isAdmin: false
		};
	}

	// Use service role client to check allowed_users to avoid Postgres RLS recursion stack depth error
	const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		auth: { persistSession: false }
	});

	const { data: allowedUser, error } = await adminSupabase
		.from('allowed_users')
		.select('role')
		.eq('email', user.email)
		.maybeSingle();

	if (error) {
		console.error('Error querying allowed_users:', error);
	}

	if (!allowedUser) {
		// User exists in auth but not in the allow-list — keep session & user so UI displays "Access Restricted"
		return {
			session,
			user,
			allowed: false,
			isAdmin: false
		};
	}

	return {
		session,
		user,
		allowed: true,
		isAdmin: allowedUser.role === 'admin'
	};
};

<script lang="ts">
	import "./layout.css";
	import { page } from "$app/stores";
	import { supabase } from "$lib/supabaseClient";

	let { data, children } = $props();

	let email = $state("");
	let password = $state("");
	let errorMsg = $state("");
	let status = $state("");

	async function signInWithPassword(e: SubmitEvent) {
		e.preventDefault();
		if (!email || !password) return;
		status = "Signing in…";
		errorMsg = "";
		try {
			const { data: authData, error } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});
			if (error) {
				errorMsg = error.message;
				status = "error";
			} else if (authData.session) {
				status = "redirecting…";
				window.location.href = "/";
			}
		} catch (err: any) {
			errorMsg = err?.message || "An error occurred";
			status = "error";
		}
	}

	async function signInWithGoogle() {
		status = "starting…";
		errorMsg = "";
		try {
			const { data: authData, error } =
				await supabase.auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: `${window.location.origin}/auth/callback`,
						queryParams: { prompt: "select_account" },
					},
				});
			if (error) {
				errorMsg = error.message;
				status = "error";
				console.error("Sign-in error:", error);
			} else if (authData?.url) {
				status = "redirecting…";
				window.location.href = authData.url;
			} else {
				errorMsg = "No OAuth URL returned.";
				status = "error";
			}
		} catch (err: any) {
			errorMsg = err?.message || "An unexpected error occurred";
			status = "error";
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		window.location.href = "/auth/login";
	}
</script>

<svelte:head>
	<title>HAVEN ARCHIVE — Private Resort Repository</title>
	<meta
		name="description"
		content="Browse curated private resorts with rates, amenities, and availability."
	/>
</svelte:head>

{#if $page.url.pathname.startsWith("/auth/login")}
	{@render children()}
{:else if !data.session}
	<!-- Not authenticated — show login redirect -->
	<div class="gate-page">
		<div class="gate-card">
			<div class="gate-brand">
				<span class="gate-brand-text">balay <sup>®</sup> archive</span>
			</div>
			<h1 class="gate-title">Private Archive</h1>
			<p class="gate-subtitle">
				This archive is restricted to authorized users. Please sign in
				to continue.
			</p>

			{#if errorMsg}
				<div class="error">{errorMsg}</div>
			{/if}

			{#if status}
				<div class="status">{status}</div>
			{/if}

			<form class="auth-form" onsubmit={signInWithPassword}>
				<div class="form-group">
					<input
						type="email"
						placeholder="Email address"
						bind:value={email}
						required
						class="form-input"
					/>
				</div>
				<div class="form-group">
					<input
						type="password"
						placeholder="Password"
						bind:value={password}
						required
						class="form-input"
					/>
				</div>
				<button type="submit" class="submit-btn">
					Sign In with Password
				</button>
			</form>

			<div class="divider">
				<span>OR</span>
			</div>

			<button
				type="button"
				class="gate-google-btn"
				onclick={signInWithGoogle}
			>
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
					<path
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
						fill="#4285F4"
					/>
					<path
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						fill="#34A853"
					/>
					<path
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						fill="#FBBC05"
					/>
					<path
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						fill="#EA4335"
					/>
				</svg>
				Continue with Google
			</button>
		</div>
	</div>
{:else if !data.allowed}
	<!-- Authenticated but not in allow-list -->
	<div class="gate-page">
		<div class="gate-card">
			<div class="gate-brand">
				<span class="gate-brand-text">balay <sup>®</sup> archive</span>
			</div>
			<h1 class="gate-title">Access Restricted</h1>
			<p class="gate-subtitle">
				Your account ({data.user?.email}) is not authorized to access
				this archive. Contact an administrator to request access.
			</p>
			<button class="gate-signout" onclick={signOut}>Sign Out</button>
		</div>
	</div>
{:else}
	{#if data.isAdmin && !$page.url.pathname.startsWith("/admin")}
		<div style="position: fixed; top: 16px; right: 20px; z-index: 50;">
			<a
				href="/admin"
				style="display: inline-block; padding: 7px 14px; border: 1px solid var(--color-line); background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); font-family: var(--font-body); font-size: 11px; font-weight: 500; letter-spacing: 0.04em; color: var(--color-ink); text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s ease;"
			>
				Admin Panel →
			</a>
		</div>
	{/if}
	{@render children()}
{/if}

<style>
	.gate-page {
		position: fixed;
		inset: 0;
		display: grid;
		place-items: center;
		background: var(--color-bg);
		font-family: var(--font-body);
		padding: 24px;
	}

	.gate-card {
		max-width: 420px;
		width: 100%;
		text-align: center;
	}

	.gate-brand {
		margin-bottom: 40px;
	}

	.gate-brand-text {
		display: inline-block;
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(8px);
		padding: 10px 16px;
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 1.5px;
	}

	.gate-brand-text :global(sup) {
		font-size: 8px;
	}

	.gate-title {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0 0 8px;
		color: var(--color-ink);
	}

	.gate-subtitle {
		font-size: 13px;
		color: var(--color-muted);
		line-height: 1.6;
		margin: 0 0 28px;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 20px;
	}

	.form-group {
		width: 100%;
	}

	.form-input {
		width: 100%;
		padding: 12px 14px;
		border: 1px solid var(--color-line);
		background: white;
		font-family: var(--font-body);
		font-size: 13px;
		color: var(--color-ink);
		box-sizing: border-box;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.form-input:focus {
		border-color: var(--color-ink);
	}

	.submit-btn {
		width: 100%;
		padding: 12px;
		border: 1px solid var(--color-ink);
		background: var(--color-ink);
		color: white;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.submit-btn:hover {
		opacity: 0.9;
	}

	.divider {
		position: relative;
		text-align: center;
		margin: 20px 0;
	}

	.divider::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--color-line);
	}

	.divider span {
		position: relative;
		background: var(--color-bg);
		padding: 0 12px;
		font-size: 11px;
		color: var(--color-muted);
		letter-spacing: 0.05em;
	}

	.gate-google-btn {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 12px 28px;
		border: 1px solid var(--color-line);
		background: white;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--color-ink);
		cursor: pointer;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.gate-google-btn:hover {
		background: var(--color-bg);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.error {
		margin-bottom: 16px;
		padding: 10px 12px;
		background: #fbe9e7;
		color: #c62828;
		font-size: 12px;
		border: 1px solid #ffcdd2;
	}

	.status {
		margin-bottom: 16px;
		padding: 10px 12px;
		background: #e3f2fd;
		color: #0d47a1;
		font-size: 12px;
		border: 1px solid #90caf9;
	}

	.gate-signout {
		padding: 12px 28px;
		border: 1px solid var(--color-line);
		background: white;
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--color-ink);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.gate-signout:hover {
		background: var(--color-bg);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}
</style>

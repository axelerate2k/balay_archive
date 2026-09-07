<script lang="ts">
	let { children } = $props();
</script>

<div class="admin-shell">
	<header class="admin-header">
		<a href="/" class="admin-brand">
			<span class="admin-brand-text">balay <sup>®</sup></span>
			<span class="admin-label">ADMIN</span>
		</a>

		<nav class="admin-nav">
			<a href="/admin" class="admin-nav-link">Resorts</a>
			<a href="/" class="admin-nav-link back-link">← Back to Archive</a>
		</nav>
	</header>

	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	.admin-shell {
		min-height: 100vh;
		background: var(--color-bg);
		font-family: var(--font-body);
		overflow-y: auto;
	}

	.admin-header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 28px;
		border-bottom: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(12px);
	}

	.admin-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		text-decoration: none;
	}

	.admin-brand-text {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 1.5px;
		color: var(--color-ink);
	}

	.admin-brand-text :global(sup) {
		font-size: 8px;
	}

	.admin-label {
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 2px;
		color: var(--color-accent);
		border: 1px solid currentColor;
		padding: 3px 7px;
		border-radius: 2px;
	}

	.admin-nav {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.admin-nav-link {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.5px;
		color: var(--color-muted);
		text-decoration: none;
		padding: 8px 14px;
		transition: color 0.15s ease;
	}

	.admin-nav-link:hover {
		color: var(--color-ink);
	}

	.back-link {
		margin-left: 8px;
		border-left: 1px solid var(--color-line);
		padding-left: 18px;
	}

	.admin-main {
		max-width: 1100px;
		margin: 0 auto;
		padding: 36px 28px 80px;
	}
</style>

<script lang="ts">
	import { activeView } from '$lib/stores/app';

	const modes: { label: string; value: 'overview' | 'index' | 'map' }[] = [
		{ label: 'OVERVIEW', value: 'overview' },
		{ label: 'INDEX', value: 'index' },
		{ label: 'MAP', value: 'map' }
	];
</script>

<footer class="corner-nav">
	{#each modes as mode, i}
		<button
			class="nav-btn {i > 0 ? 'nav-btn-bordered' : ''} {$activeView === mode.value ? 'nav-btn-active' : ''}"
			onclick={() => activeView.set(mode.value)}
		>
			{mode.label}
		</button>
	{/each}
</footer>

<style>
	.corner-nav {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 40;
		display: flex;
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.nav-btn {
		appearance: none;
		border: none;
		background: transparent;
		padding: 12px 18px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		font-family: var(--font-body);
		cursor: pointer;
		transition: color 0.2s ease;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.nav-btn:hover {
		color: var(--color-ink);
	}

	.nav-btn-active {
		color: var(--color-ink);
	}

	.nav-btn-bordered {
		border-left: 1px solid var(--color-line);
	}

	@media (max-width: 768px) {
		.corner-nav {
			bottom: max(16px, env(safe-area-inset-bottom, 16px));
			right: 16px;
		}

		.nav-btn {
			padding: 14px 20px;
			font-size: 10px;
		}
	}
</style>

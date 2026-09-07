<script lang="ts">
	import { hoveredResort } from '$lib/stores/app';
	import type { Resort } from '$lib/types/resort';

	let resort: Resort | null = $state(null);
	let visible = $state(false);

	hoveredResort.subscribe((r) => {
		resort = r;
		visible = r !== null;
	});
</script>

<div
	class="info-panel {visible ? 'info-panel-visible' : ''}"
>
	{#if resort}
		<div class="space-y-3">
			<h2 class="resort-name">
				{resort.name}
			</h2>

			<div class="rate-list">
				<div class="rate-row">
					<span class="rate-label">12H</span>
					<span class="rate-value">{resort.rate12}</span>
				</div>
				<div class="rate-row">
					<span class="rate-label">22H</span>
					<span class="rate-value">{resort.rate22}</span>
				</div>
			</div>

			<div class="rate-row">
				<span class="rate-label">PAX</span>
				<span class="rate-value">{resort.pax}</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.info-panel {
		position: fixed;
		top: 96px;
		left: 24px;
		z-index: 30;
		max-width: 280px;
		pointer-events: none;
		transition: opacity 0.4s ease, transform 0.4s ease;
		opacity: 0;
		transform: translateY(-8px);
	}

	.info-panel.info-panel-visible {
		opacity: 1;
		transform: translateY(0);
	}

	.resort-name {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--color-ink);
		line-height: 1.2;
		margin: 0;
	}

	.rate-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.rate-row {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}

	.rate-label {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-muted);
		min-width: 28px;
	}

	.rate-value {
		font-family: var(--font-body);
		font-size: 14px;
		font-weight: 500;
		color: var(--color-ink);
	}

	/* Hide on touch/tablet devices — hover isn't available */
	@media (max-width: 1024px) {
		.info-panel {
			display: none;
		}
	}
</style>

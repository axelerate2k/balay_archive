<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { selectedResort, transitionOrigin } from '$lib/stores/app';
	import { getPhotoUrl } from '$lib/data/resorts';
	import type { Resort } from '$lib/types/resort';
	import CylinderCarousel from './CylinderCarousel.svelte';

	let resort = $state<Resort | null>(null);
	let origin: { rect: DOMRect; transform: string } | null = $state(null);
	let visible = $state(false);
	let phase = $state<'entering' | 'open' | 'leaving' | 'closed'>('closed');
	let wrapperEl: HTMLDivElement;
	let contentEl: HTMLDivElement;

	selectedResort.subscribe((r) => {
		if (r) {
			resort = r;
			transitionOrigin.subscribe((o) => {
				origin = o;
			})();
			visible = true;
			phase = 'entering';
		}
	});

	// Build gallery URLs for the carousel
	const carouselImages = $derived.by(() => {
		if (!resort) return [];
		if (resort.gallery && resort.gallery.length > 0) {
			return resort.gallery;
		}
		// Fallback: generate placeholder URLs
		return Array.from({ length: 7 }, (_, i) =>
			getPhotoUrl(`${resort!.image_seed}-${i}`, 700, 900)
		);
	});

	const heroImage = $derived(
		resort
			? resort.gallery?.[0] || getPhotoUrl(resort.image_seed, 900, 500)
			: ''
	);

	$effect(() => {
		if (phase === 'entering' && visible && wrapperEl) {
			// Step 2: Pin to captured origin rect+transform
			if (origin) {
				const { rect, transform } = origin;
				wrapperEl.style.transition = 'none';
				wrapperEl.style.position = 'fixed';
				wrapperEl.style.top = `${rect.top}px`;
				wrapperEl.style.left = `${rect.left}px`;
				wrapperEl.style.width = `${rect.width}px`;
				wrapperEl.style.height = `${rect.height}px`;
				wrapperEl.style.transform = transform;
				wrapperEl.style.borderRadius = '0px';
				wrapperEl.style.overflow = 'hidden';

				// Force layout flush
				wrapperEl.getBoundingClientRect();

				// Step 3: Animate to full screen
				requestAnimationFrame(() => {
					wrapperEl.style.transition =
						'all 0.6s cubic-bezier(0.22, 0.8, 0.25, 1)';
					wrapperEl.style.top = '0px';
					wrapperEl.style.left = '0px';
					wrapperEl.style.width = '100vw';
					wrapperEl.style.height = '100vh';
					wrapperEl.style.transform = 'none';
				});
			} else {
				// No origin — just open directly
				phase = 'open';
			}
		}
	});

	function handleTransitionEnd(e: TransitionEvent) {
		if (e.target !== wrapperEl) return;

		if (phase === 'entering') {
			phase = 'open';
		} else if (phase === 'leaving') {
			visible = false;
			phase = 'closed';
			resort = null;
			origin = null;
			selectedResort.set(null);
			transitionOrigin.set(null);
		}
	}

	function close() {
		if (phase !== 'open') return;
		phase = 'leaving';

		// Fade out content first
		if (contentEl) {
			contentEl.style.transition = 'opacity 0.2s ease';
			contentEl.style.opacity = '0';
		}

		// After content fades, animate wrapper back to origin
		setTimeout(() => {
			if (origin && wrapperEl) {
				const { rect, transform } = origin;
				wrapperEl.style.transition =
					'all 0.5s cubic-bezier(0.22, 0.8, 0.25, 1)';
				wrapperEl.style.top = `${rect.top}px`;
				wrapperEl.style.left = `${rect.left}px`;
				wrapperEl.style.width = `${rect.width}px`;
				wrapperEl.style.height = `${rect.height}px`;
				wrapperEl.style.transform = transform;
			} else {
				// No origin — just close directly
				visible = false;
				phase = 'closed';
				resort = null;
				selectedResort.set(null);
				transitionOrigin.set(null);
			}
		}, 220);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function handleOverlayClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('detail-overlay')) {
			close();
		}
	}

	function pillList(items: string[]): string {
		return items
			.map(
				(t) =>
					`<span class="pill">${t}</span>`
			)
			.join('');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible && resort}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="detail-overlay" onclick={handleOverlayClick}>
		<div
			class="detail-wrapper"
			bind:this={wrapperEl}
			ontransitionend={handleTransitionEnd}
		>
			<!-- Hero image fills the wrapper during transition -->
			<img class="hero-bg" src={heroImage} alt="" draggable="false" />

			<!-- Content: only visible when phase is 'open' -->
			<div
				class="detail-content"
				bind:this={contentEl}
				class:content-visible={phase === 'open'}
			>
				<div class="detail-scroll">
					<!-- Close button -->
					<button class="close-btn" onclick={close} aria-label="Close details">✕</button>

					<!-- Hero section -->
					<div class="detail-hero">
						<img src={heroImage} alt={resort.name} class="hero-image" />
						<div class="hero-overlay">
							<h1 class="hero-title">{resort.name}</h1>
							<p class="hero-location">{resort.location}</p>
						</div>
					</div>

					<!-- Info grid -->
					<div class="detail-body">
						<div class="info-section">
							<p class="contact-line">{resort.contact}</p>

							<div class="info-grid">
								<div class="info-item">
									<span class="info-label">Rate (12h)</span>
									<span class="info-value">{resort.rate12}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Rate (22h)</span>
									<span class="info-value">{resort.rate22}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Pax</span>
									<span class="info-value">{resort.pax}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Add'l Pax</span>
									<span class="info-value">{resort.addPax}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Rooms</span>
									<span class="info-value">{resort.rooms}</span>
								</div>
								<div class="info-item">
									<span class="info-label">Pool</span>
									<span class="info-value">{resort.pool}</span>
								</div>
							</div>

							<div class="tag-section">
								<span class="tag-label">Inclusions</span>
								<div class="tag-list">{@html pillList(resort.inclusions)}</div>
							</div>

							<div class="tag-section">
								<span class="tag-label">Amenities</span>
								<div class="tag-list">{@html pillList(resort.amenities)}</div>
							</div>
						</div>

						<!-- Carousel -->
						{#if carouselImages.length > 0}
							<div class="carousel-section">
								<span class="carousel-label">Gallery</span>
								<CylinderCarousel images={carouselImages} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.detail-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(19, 19, 19, 0.4);
		backdrop-filter: blur(4px);
	}

	.detail-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: var(--color-bg);
		overflow: hidden;
		will-change: transform, top, left, width, height;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}

	.detail-content {
		position: absolute;
		inset: 0;
		z-index: 1;
		background: var(--color-bg);
		opacity: 0;
		transform: translateY(12px);
		transition: opacity 0.3s ease, transform 0.3s ease;
		pointer-events: none;
	}

	.detail-content.content-visible {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.detail-scroll {
		width: 100%;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.close-btn {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 70;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(8px);
		cursor: pointer;
		font-size: 14px;
		color: var(--color-ink);
		transition: all 0.15s ease;
	}

	.close-btn:hover {
		background: white;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
	}

	.detail-hero {
		position: relative;
		width: 100%;
		height: 50vh;
		min-height: 300px;
		overflow: hidden;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hero-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 40px 48px;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: 32px;
		font-weight: 600;
		color: white;
		margin: 0 0 6px;
		letter-spacing: -0.02em;
	}

	.hero-location {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 400;
		color: rgba(255, 255, 255, 0.8);
		letter-spacing: 0.03em;
		margin: 0;
	}

	.detail-body {
		padding: 36px 48px 80px;
	}

	.info-section {
		max-width: 900px;
	}

	.contact-line {
		font-size: 13px;
		color: var(--color-muted);
		margin: 0 0 24px;
		font-family: var(--font-body);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 20px;
		margin-bottom: 28px;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.info-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
		font-family: var(--font-body);
	}

	.info-value {
		font-size: 14px;
		color: var(--color-ink);
		font-family: var(--font-body);
	}

	.tag-section {
		margin-bottom: 20px;
	}

	.tag-label {
		display: block;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
		font-family: var(--font-body);
		margin-bottom: 8px;
	}

	.tag-list :global(.pill) {
		display: inline-block;
		font-size: 11px;
		letter-spacing: 0.03em;
		border: 1px solid var(--color-line);
		padding: 4px 10px;
		margin: 0 4px 4px 0;
		color: var(--color-ink);
		font-family: var(--font-body);
	}

	.carousel-section {
		margin-top: 36px;
	}

	.carousel-label {
		display: block;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
		font-family: var(--font-body);
		margin-bottom: 16px;
	}

	@media (max-width: 768px) {
		.detail-body {
			padding: 24px 20px 60px;
		}

		.hero-overlay {
			padding: 24px 20px;
		}

		.hero-title {
			font-size: 24px;
		}

		.detail-hero {
			height: 35vh;
			min-height: 200px;
		}
	}
</style>

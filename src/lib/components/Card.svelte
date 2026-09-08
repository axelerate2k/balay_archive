<script lang="ts">
	import type { Resort } from "$lib/types/resort";
	import { getResortCoverUrl } from "$lib/data/resorts";
	import { hoveredResort } from "$lib/stores/app";
	import { goto } from "$app/navigation";

	interface Props {
		resort: Resort;
		index: number;
	}

	let { resort, index }: Props = $props();

	let cardWidth = $state<number | null>(null);
	let cardHeight = $state<number | null>(null);
	let imgElement: HTMLImageElement | null = null;

	const tag = $derived(`balay | ${String(index + 1).padStart(2, "0")}`);

	// Use first gallery photo if available, else fall back to varied placeholder
	const imgSrc = $derived(
		resort.gallery && resort.gallery.length > 0
			? resort.gallery[0]
			: getResortCoverUrl(resort.image_seed)
	);

	function handleMouseEnter() {
		hoveredResort.set(resort);
	}

	function handleMouseLeave() {
		hoveredResort.set(null);
	}

	function computeDimensions() {
		if (!imgElement || !imgElement.naturalWidth || !imgElement.naturalHeight) return;

		const nw = imgElement.naturalWidth;
		const nh = imgElement.naturalHeight;
		const ar = nw / nh;

		const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
		let scale = 1.0;
		if (winW <= 480) {
			scale = 0.55;
		} else if (winW <= 768) {
			scale = 0.65;
		} else if (winW <= 1024) {
			scale = 0.8;
		}

		let w: number;
		let h: number;

		if (ar >= 1.25) {
			// Landscape (wide card)
			w = Math.round(Math.min(460, Math.max(380, 340 * Math.sqrt(ar))) * scale);
			h = Math.round(w / ar);
			h = Math.round(Math.min(320 * scale, Math.max(250 * scale, h)));
		} else if (ar <= 0.85) {
			// Portrait (tall card)
			h = Math.round(Math.min(500, Math.max(420, 420 / Math.sqrt(ar))) * scale);
			w = Math.round(h * ar);
			w = Math.round(Math.min(350 * scale, Math.max(280 * scale, w)));
		} else {
			// Square / balanced
			w = Math.round(360 * scale);
			h = Math.round(w / ar);
			h = Math.round(Math.min(400 * scale, Math.max(330 * scale, h)));
		}

		cardWidth = w;
		cardHeight = h;
	}

	function handleImageLoad(e: Event) {
		imgElement = e.currentTarget as HTMLImageElement;
		computeDimensions();
	}

	function handleClick(e: MouseEvent) {
		// Normal navigation
		if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
			e.preventDefault();
			goto(`/${resort.slug}`);
		}
	}
</script>

<svelte:window onresize={computeDimensions} />

<a
	href="/{resort.slug}"
	class="card group"
	style={cardWidth && cardHeight
		? `--c-w: ${cardWidth}px; --c-h: ${cardHeight}px;`
		: ''}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclick={handleClick}
>
	<div class="card-inner">
		<img
			src={imgSrc}
			alt={resort.name}
			loading="lazy"
			draggable="false"
			onload={handleImageLoad}
		/>

		<!-- glass sheen overlay -->
		<div class="card-sheen"></div>

		<!-- glass border overlay -->
		<div class="card-border"></div>

		<!-- always-visible tag -->
		<div class="card-tag font-body">
			{tag}
		</div>
	</div>
</a>

<style>
	.card {
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--c-w, var(--card-w));
		height: var(--c-h, var(--card-h));
		margin: calc(var(--c-h, var(--card-h)) / -2) 0 0 calc(var(--c-w, var(--card-w)) / -2);
		transform-style: preserve-3d;
		will-change: transform;
		cursor: grab;
		display: block;
		text-decoration: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-user-drag: none;
		touch-action: none;
	}

	.card-inner {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: #dcdad4;
		box-shadow:
			0 30px 60px -20px rgba(0, 0, 0, 0.35),
			0 2px 0 rgba(255, 255, 255, 0.4) inset;
		transition:
			transform 0.55s cubic-bezier(0.22, 0.8, 0.25, 1),
			filter 0.55s ease;
	}

	/* Slide RIGHT on hover (PC) OR when is-center (mobile/tablet) */
	.card:hover .card-inner,
	:global(.card.is-center) .card-inner {
		transform: translateX(160px);
		filter: brightness(1.04);
	}

	.card-inner img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.card-sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			115deg,
			rgba(255, 255, 255, 0.55) 0%,
			rgba(255, 255, 255, 0) 28%,
			rgba(255, 255, 255, 0) 72%,
			rgba(255, 255, 255, 0.28) 100%
		);
		mix-blend-mode: overlay;
		pointer-events: none;
	}

	.card-border {
		position: absolute;
		inset: 0;
		border: 1px solid rgba(255, 255, 255, 0.5);
		box-shadow: inset 0 0 40px rgba(255, 255, 255, 0.08);
		pointer-events: none;
	}

	.card-tag {
		position: absolute;
		top: 14px;
		left: 16px;
		font-size: 9.5px;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.85);
		padding: 5px 8px;
		background: rgba(0, 0, 0, 0.28);
		backdrop-filter: blur(3px);
	}

	@media (max-width: 1024px) {
		.card:hover .card-inner {
			/* Disable hover slide-out on touch devices in favor of is-center */
			transform: none;
		}

		:global(.card.is-center) .card-inner {
			transform: translateX(100px);
			filter: brightness(1.04);
		}
	}

	@media (max-width: 768px) {
		.card:hover .card-inner {
			transform: none;
		}

		:global(.card.is-center) .card-inner {
			transform: translateX(80px);
			filter: brightness(1.04);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-inner {
			transition: none;
		}
	}
</style>

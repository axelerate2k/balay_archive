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

	function handleImageLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img || !img.naturalWidth || !img.naturalHeight) return;

		const nw = img.naturalWidth;
		const nh = img.naturalHeight;
		const ar = nw / nh;

		let w: number;
		let h: number;

		if (ar >= 1.25) {
			// Landscape (wide card)
			w = Math.min(470, Math.max(390, Math.round(340 * Math.sqrt(ar))));
			h = Math.round(w / ar);
			// Clamp landscape height
			h = Math.min(330, Math.max(260, h));
		} else if (ar <= 0.85) {
			// Portrait (tall card)
			h = Math.min(510, Math.max(430, Math.round(420 / Math.sqrt(ar))));
			w = Math.round(h * ar);
			// Clamp portrait width
			w = Math.min(360, Math.max(290, w));
		} else {
			// Square / balanced
			w = 370;
			h = Math.round(370 / ar);
			h = Math.min(410, Math.max(340, h));
		}

		cardWidth = w;
		cardHeight = h;
	}

	function handleClick(e: MouseEvent) {
		// Normal navigation
		if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
			e.preventDefault();
			goto(`/${resort.slug}`);
		}
	}
</script>

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
		-webkit-user-drag: none;
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

	/* Slide RIGHT on hover — reveal full card without overlapping neighbors */
	.card:hover .card-inner {
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
			/* Disable hover slide-out on touch devices */
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card-inner {
			transition: none;
		}
	}
</style>

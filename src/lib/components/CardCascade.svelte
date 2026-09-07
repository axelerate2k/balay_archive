<script lang="ts">
	import { onMount } from 'svelte';
	import type { Resort } from '$lib/types/resort';
	import Card from './Card.svelte';

	interface Props {
		resorts: Resort[];
	}

	let { resorts }: Props = $props();

	let stageEl: HTMLElement;
	let cascadeEl: HTMLElement;

	// Duplicate list for seamless looping
	const cascadeItems = $derived([...resorts, ...resorts]);
	const total = $derived(cascadeItems.length);

	// Diagonal direction vector
	const stepLen = Math.hypot(132, 96);
	const dirX = -132 / stepLen;
	const dirY = 96 / stepLen;

	let scrollTarget = 0;
	let scrollCurrent = 0;
	let cardEls: HTMLElement[] = [];

	// Touch tracking
	let touchStartX: number | null = null;
	let touchStartY: number | null = null;

	// Mouse drag tracking
	let isDragging = $state(false);
	let hasDragged = false;
	let dragStartX = 0;
	let dragStartY = 0;
	let lastMouseX = 0;
	let lastMouseY = 0;

	function wrapPosition(raw: number): number {
		const span = total * stepLen;
		let v = raw % span;
		if (v < 0) v += span;
		return v - span / 2;
	}

	function renderCascade() {
		cardEls.forEach((card, i) => {
			if (!card) return;
			const raw = i * stepLen + scrollCurrent;
			const pos = wrapPosition(raw);
			const x = pos * dirX;
			const y = pos * dirY;
			card.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotateX(7deg) rotateY(-20deg)`;
			card.style.zIndex = String(Math.round(1000 - Math.abs(pos)));
		});
	}

	function tick() {
		scrollCurrent += (scrollTarget - scrollCurrent) * 0.09;
		renderCascade();
		requestAnimationFrame(tick);
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		scrollTarget += (e.deltaY + e.deltaX) * 1.1;
	}

	// Touch interaction
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (touchStartY === null || touchStartX === null) return;
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;
		scrollTarget += (dx * dirX + dy * dirY) * 1.8;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchEnd() {
		touchStartX = null;
		touchStartY = null;
	}

	// Mouse drag interaction
	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		isDragging = true;
		hasDragged = false;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const dx = e.clientX - lastMouseX;
		const dy = e.clientY - lastMouseY;

		const totalDist = Math.hypot(e.clientX - dragStartX, e.clientY - dragStartY);
		if (totalDist > 5) {
			hasDragged = true;
		}

		scrollTarget += (dx * dirX + dy * dirY) * 1.8;
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;
	}

	// Prevent card click navigation if dragged
	function handleClickCapture(e: MouseEvent) {
		if (hasDragged) {
			e.preventDefault();
			e.stopPropagation();
			hasDragged = false;
		}
	}

	onMount(() => {
		cardEls = Array.from(cascadeEl.querySelectorAll('.card')) as HTMLElement[];
		requestAnimationFrame(tick);

		stageEl.addEventListener('wheel', handleWheel, { passive: false });
		stageEl.addEventListener('touchstart', handleTouchStart, { passive: true });
		stageEl.addEventListener('touchmove', handleTouchMove, { passive: true });
		stageEl.addEventListener('touchend', handleTouchEnd, { passive: true });

		stageEl.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		stageEl.addEventListener('click', handleClickCapture, { capture: true });

		return () => {
			stageEl.removeEventListener('wheel', handleWheel);
			stageEl.removeEventListener('touchstart', handleTouchStart);
			stageEl.removeEventListener('touchmove', handleTouchMove);
			stageEl.removeEventListener('touchend', handleTouchEnd);

			stageEl.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			stageEl.removeEventListener('click', handleClickCapture, { capture: true });
		};
	});
</script>

<main
	bind:this={stageEl}
	class="stage-wrap {isDragging ? 'is-dragging' : ''}"
	style="perspective: 2400px;"
>
	<div bind:this={cascadeEl} class="absolute inset-0" style="transform-style: preserve-3d;">
		{#each cascadeItems as resort, i}
			<Card {resort} index={i % resorts.length} />
		{/each}
	</div>
</main>

<div class="cascade-hint">
	<span class="hint-dot"></span>
	<span class="hint-text">drag or scroll to browse · hover to preview · click for full details</span>
	<span class="hint-text hint-touch">drag or swipe to browse · tap for full details</span>
</div>

<style>
	.stage-wrap {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
	}

	.stage-wrap.is-dragging,
	.stage-wrap.is-dragging :global(.card) {
		cursor: grabbing !important;
	}

	.cascade-hint {
		position: fixed;
		left: 24px;
		bottom: 24px;
		z-index: 35;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 10.5px;
		letter-spacing: 0.06em;
		color: var(--color-muted);
		font-family: var(--font-body);
		pointer-events: none;
	}

	.hint-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(19,19,19,0.7);
		flex-shrink: 0;
	}

	.hint-touch {
		display: none;
	}

	@media (max-width: 768px) {
		.cascade-hint {
			left: 16px;
			bottom: 72px; /* above the CornerNav */
			font-size: 10px;
		}
		.hint-text:not(.hint-touch) {
			display: none;
		}
		.hint-touch {
			display: inline;
		}
	}
</style>

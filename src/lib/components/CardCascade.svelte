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

	// Diagonal direction vector & responsive step
	let stepLen = $state(Math.hypot(132, 96));
	let dirX = $state(-132 / Math.hypot(132, 96));
	let dirY = $state(96 / Math.hypot(132, 96));

	function updateStepVector() {
		const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
		let sx = -132;
		let sy = 96;
		if (winW <= 480) {
			sx = -76;
			sy = 56;
		} else if (winW <= 768) {
			sx = -88;
			sy = 64;
		} else if (winW <= 1024) {
			sx = -108;
			sy = 78;
		}
		const len = Math.hypot(sx, sy);
		stepLen = len;
		dirX = sx / len;
		dirY = sy / len;
	}

	let scrollTarget = 0;
	let scrollCurrent = 0;
	let cardEls: HTMLElement[] = [];

	// Touch tracking
	let touchStartX: number | null = null;
	let touchStartY: number | null = null;
	let touchMoved = false;

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
		if (e.touches.length === 1) {
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
			touchMoved = false;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (touchStartY === null || touchStartX === null || e.touches.length !== 1) return;
		
		const currentX = e.touches[0].clientX;
		const currentY = e.touches[0].clientY;
		const dx = currentX - touchStartX;
		const dy = currentY - touchStartY;

		const dist = Math.hypot(dx, dy);
		if (dist > 5) {
			touchMoved = true;
			hasDragged = true;
		}

		if (e.cancelable) {
			e.preventDefault();
		}

		scrollTarget += (dx * dirX + dy * dirY) * 1.8;
		touchStartX = currentX;
		touchStartY = currentY;
	}

	function handleTouchEnd() {
		touchStartX = null;
		touchStartY = null;
		if (touchMoved) {
			setTimeout(() => {
				hasDragged = false;
				touchMoved = false;
			}, 50);
		}
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
		if (hasDragged) {
			setTimeout(() => {
				hasDragged = false;
			}, 50);
		}
	}

	// Prevent card click navigation if dragged
	function handleClickCapture(e: MouseEvent) {
		if (hasDragged || touchMoved) {
			e.preventDefault();
			e.stopPropagation();
		}
	}

	onMount(() => {
		updateStepVector();
		cardEls = Array.from(cascadeEl.querySelectorAll('.card')) as HTMLElement[];
		requestAnimationFrame(tick);

		stageEl.addEventListener('wheel', handleWheel, { passive: false });
		stageEl.addEventListener('touchstart', handleTouchStart, { passive: true });
		stageEl.addEventListener('touchmove', handleTouchMove, { passive: false });
		stageEl.addEventListener('touchend', handleTouchEnd, { passive: true });
		stageEl.addEventListener('touchcancel', handleTouchEnd, { passive: true });

		stageEl.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		stageEl.addEventListener('click', handleClickCapture, { capture: true });

		return () => {
			stageEl.removeEventListener('wheel', handleWheel);
			stageEl.removeEventListener('touchstart', handleTouchStart);
			stageEl.removeEventListener('touchmove', handleTouchMove);
			stageEl.removeEventListener('touchend', handleTouchEnd);
			stageEl.removeEventListener('touchcancel', handleTouchEnd);

			stageEl.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
			stageEl.removeEventListener('click', handleClickCapture, { capture: true });
		};
	});
</script>

<svelte:window onresize={updateStepVector} />

<main
	bind:this={stageEl}
	class="stage-wrap {isDragging ? 'is-dragging' : ''}"
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
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		height: 100dvh;
		overflow: hidden;
		cursor: grab;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		overscroll-behavior: none;
		perspective: clamp(1400px, 180vw, 2400px);
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

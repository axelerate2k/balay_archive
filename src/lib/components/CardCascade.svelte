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
	let touchStartY: number | null = null;

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

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchMove(e: TouchEvent) {
		if (touchStartY === null) return;
		const dy = touchStartY - e.touches[0].clientY;
		scrollTarget += dy * 2.2;
		touchStartY = e.touches[0].clientY;
	}

	onMount(() => {
		cardEls = Array.from(cascadeEl.querySelectorAll('.card')) as HTMLElement[];
		requestAnimationFrame(tick);

		stageEl.addEventListener('wheel', handleWheel, { passive: false });
		stageEl.addEventListener('touchstart', handleTouchStart, { passive: true });
		stageEl.addEventListener('touchmove', handleTouchMove, { passive: true });

		return () => {
			stageEl.removeEventListener('wheel', handleWheel);
			stageEl.removeEventListener('touchstart', handleTouchStart);
			stageEl.removeEventListener('touchmove', handleTouchMove);
		};
	});
</script>

<main bind:this={stageEl} class="relative w-full h-screen overflow-hidden" style="perspective: 2400px;">
	<div bind:this={cascadeEl} class="absolute inset-0" style="transform-style: preserve-3d;">
		{#each cascadeItems as resort, i}
			<Card {resort} index={i % resorts.length} />
		{/each}
	</div>
</main>

<div class="fixed left-6 bottom-6 z-[35] flex items-center gap-2 text-[10.5px] tracking-wider text-muted font-body">
	<span class="w-1.5 h-1.5 rounded-full bg-ink/70"></span>
	scroll to browse · hover to preview · click for full details
</div>

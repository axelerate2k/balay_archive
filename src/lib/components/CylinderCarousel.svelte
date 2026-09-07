<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		images: string[];
		caption?: string;
	}

	let { images, caption }: Props = $props();

	// Ensure there are at least 6-8 panels for a rich cylindrical depth curve
	const displayImages = $derived.by(() => {
		if (images.length === 0) return [];
		if (images.length >= 6) return images;
		// Duplicate small image sets to create a complete cylinder
		let result = [...images];
		while (result.length < 6) {
			result = [...result, ...images];
		}
		return result;
	});

	const n = $derived(displayImages.length);
	let targetRotation = $state(0);
	let currentRotation = $state(0);
	let a3dEl = $state<HTMLDivElement>();
	let sceneEl = $state<HTMLDivElement>();

	// Drag state
	let isDragging = $state(false);
	let dragStartX = 0;
	let dragStartRotation = 0;
	let velocity = 0;
	let lastX = 0;
	let lastTime = 0;
	let animFrame: number;

	// Active card index derived from targetRotation
	const activeIndex = $derived.by(() => {
		if (n === 0) return 0;
		const step = 360 / n;
		const rawIdx = Math.round(-targetRotation / step) % n;
		return (rawIdx + n) % n;
	});

	function snapAngle(val: number): number {
		if (n === 0) return 0;
		const step = 360 / n;
		return Math.round(val / step) * step;
	}

	function animate() {
		if (!isDragging) {
			// Smooth ease toward target rotation
			const diff = targetRotation - currentRotation;
			if (Math.abs(diff) > 0.01) {
				currentRotation += diff * 0.085;
			} else {
				currentRotation = targetRotation;
			}
		}
		animFrame = requestAnimationFrame(animate);
	}

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		dragStartX = e.clientX;
		dragStartRotation = currentRotation;
		targetRotation = currentRotation;
		lastX = e.clientX;
		lastTime = performance.now();
		velocity = 0;
		if (sceneEl) sceneEl.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const dx = e.clientX - dragStartX;
		const now = performance.now();
		const dt = now - lastTime;

		if (dt > 0) {
			velocity = (e.clientX - lastX) / dt;
		}

		lastX = e.clientX;
		lastTime = now;

		// Map pixel drag directly to rotation degrees
		currentRotation = dragStartRotation + dx * 0.28;
		targetRotation = currentRotation;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		if (sceneEl) {
			try {
				sceneEl.releasePointerCapture(e.pointerId);
			} catch (_) {}
		}

		// Apply momentum and snap to nearest card angle
		const projected = currentRotation + velocity * 35;
		targetRotation = snapAngle(projected);
	}

	function stepPrev() {
		if (n === 0) return;
		const step = 360 / n;
		targetRotation = snapAngle(targetRotation) + step;
	}

	function stepNext() {
		if (n === 0) return;
		const step = 360 / n;
		targetRotation = snapAngle(targetRotation) - step;
	}

	function goToIndex(i: number) {
		if (n === 0) return;
		const step = 360 / n;
		targetRotation = -i * step;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			stepPrev();
		} else if (e.key === 'ArrowRight') {
			stepNext();
		}
	}

	onMount(() => {
		animFrame = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animFrame);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if n > 0}
	<div class="carousel-container">
		<div
			class="scene"
			bind:this={sceneEl}
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			role="region"
			aria-label="Concave photo carousel"
		>
			<div
				class="a3d"
				bind:this={a3dEl}
				style="--n: {n}; transform: rotateY({currentRotation}deg);"
			>
				{#each displayImages as src, i}
					<div
						class="card-wrapper"
						style="--i: {i};"
					>
						<img
							class="card"
							{src}
							alt="Resort gallery photo {i + 1}"
							loading="lazy"
							draggable="false"
						/>
						<div class="card-glass-sheen"></div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Carousel Controls & Meta -->
		<div class="carousel-nav-bar">
			<button
				type="button"
				class="nav-arrow"
				onclick={stepPrev}
				aria-label="Previous image"
			>
				←
			</button>

			<div class="carousel-meta font-body">
				<span class="meta-counter">{activeIndex + 1} / {n}</span>
				{#if caption}
					<span class="meta-sep">·</span>
					<span class="meta-caption">{caption}</span>
				{/if}
			</div>

			<button
				type="button"
				class="nav-arrow"
				onclick={stepNext}
				aria-label="Next image"
			>
				→
			</button>
		</div>

		<!-- Dots indicator -->
		<div class="dots-wrapper">
			{#each displayImages as _, i}
				<button
					type="button"
					class="dot-btn"
					class:dot-active={i === activeIndex}
					onclick={() => goToIndex(i)}
					aria-label="Go to photo {i + 1}"
				></button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.carousel-container {
		position: relative;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		user-select: none;
	}

	.scene, .a3d {
		display: grid;
	}

	.scene {
		width: 100%;
		height: clamp(380px, 58vh, 620px);
		overflow: hidden;
		perspective: clamp(32em, 45vw, 65em);
		perspective-origin: 50% 50%;
		mask: linear-gradient(90deg, transparent 0%, #000 16% 84%, transparent 100%);
		-webkit-mask: linear-gradient(90deg, transparent 0%, #000 16% 84%, transparent 100%);
		touch-action: none;
		cursor: grab;
	}

	.scene:active {
		cursor: grabbing;
	}

	.a3d {
		place-self: center;
		transform-style: preserve-3d;
		will-change: transform;
	}

	.card-wrapper {
		--w: clamp(15em, 23vw, 25em);
		--ba: calc(1turn / var(--n));
		grid-area: 1 / 1;
		width: var(--w);
		aspect-ratio: 7 / 10;
		border-radius: 1.25em;
		backface-visibility: hidden;
		transform-style: preserve-3d;
		/* Negative translateZ curves cards inward toward center (concave amphitheater) */
		transform:
			rotateY(calc(var(--i) * var(--ba)))
			translateZ(calc(-1 * (0.5 * var(--w) + 0.6em) / tan(0.5 * var(--ba))));
		box-shadow:
			0 24px 45px -12px rgba(0, 0, 0, 0.28),
			0 2px 0 rgba(255, 255, 255, 0.4) inset;
		overflow: hidden;
		position: relative;
		background: #dcdad4;
	}

	.card {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
	}

	.card-glass-sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			120deg,
			rgba(255, 255, 255, 0.35) 0%,
			rgba(255, 255, 255, 0) 30%,
			rgba(255, 255, 255, 0.15) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 1.25em;
		pointer-events: none;
	}

	.carousel-nav-bar {
		display: inline-flex;
		align-items: center;
		gap: 16px;
		margin-top: 18px;
		padding: 6px 14px;
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
		z-index: 10;
	}

	.nav-arrow {
		width: 26px;
		height: 26px;
		border: 1px solid var(--color-line);
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 13px;
		color: var(--color-ink);
		transition: all 0.15s ease;
	}

	.nav-arrow:hover {
		background: var(--color-ink);
		color: white;
		border-color: var(--color-ink);
	}

	.carousel-meta {
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink);
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.meta-counter {
		font-weight: 600;
		color: var(--color-ink);
	}

	.meta-sep {
		color: var(--color-muted);
	}

	.meta-caption {
		color: var(--color-muted);
		font-weight: 500;
	}

	.dots-wrapper {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 10px;
	}

	.dot-btn {
		width: 10px;
		height: 2px;
		border: none;
		background: var(--color-line);
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dot-btn.dot-active {
		width: 22px;
		background: var(--color-ink);
	}

	@media (max-width: 768px) {
		.card-wrapper {
			--w: 13em;
		}

		.scene {
			perspective: 26em;
			height: clamp(300px, 48vh, 420px);
		}
	}
</style>

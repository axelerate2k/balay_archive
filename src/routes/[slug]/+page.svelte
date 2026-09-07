<script lang="ts">
	import CylinderCarousel from '$lib/components/CylinderCarousel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const resort = $derived(data.resort);

	let copiedContact = $state(false);

	function copyContact() {
		if (!resort?.contact) return;
		navigator.clipboard.writeText(resort.contact);
		copiedContact = true;
		setTimeout(() => {
			copiedContact = false;
		}, 2000);
	}
</script>

<svelte:head>
	<title>{resort.name} — BALAY ARCHIVE</title>
	<meta
		name="description"
		content="Archive specifications for {resort.name} in {resort.location}. Rates, capacity, pool specifications, and amenities."
	/>
</svelte:head>

<div class="slug-page">
	<!-- Top Navigation -->
	<header class="slug-header">
		<a href="/" class="back-link font-body">
			<span class="back-arrow">←</span>
			<span>Archive</span>
		</a>

		<div class="brand-badge">
			<span>balay <sup>®</sup></span>
			<span class="badge-sub">archive</span>
		</div>

		<!-- Spacer for top-right admin button if present -->
		<div class="header-spacer"></div>
	</header>

	<main class="slug-main">
		<!-- Hero Title Header -->
		<section class="hero-header">
			<div class="location-pill font-body">
				<span class="dot"></span>
				{resort.location}
			</div>
			<h1 class="hero-name font-display">{resort.name}</h1>
			{#if resort.contact}
				<div class="hero-contact-row">
					<span class="contact-text font-body">{resort.contact}</span>
					<button
						type="button"
						class="copy-btn font-body"
						onclick={copyContact}
						aria-label="Copy contact information"
					>
						{copiedContact ? '✓ Copied' : 'Copy'}
					</button>
				</div>
			{/if}
		</section>

		<!-- Concave Cylindrical Carousel Showcase -->
		<section class="carousel-section">
			<div class="carousel-hint-row font-body">
				<span class="hint-dot"></span>
				<span class="hint-text">drag to explore gallery</span>
			</div>

			<CylinderCarousel
				images={resort.gallery}
				caption={resort.name}
			/>
		</section>

		<!-- Minimalist Specification Grid -->
		<section class="details-section">
			<div class="details-grid">
				<!-- Rates & Capacity -->
				<div class="detail-block">
					<h2 class="section-title font-display">Rates & Capacity</h2>
					<div class="specs-table font-body">
						<div class="spec-item">
							<span class="spec-label">12-Hour Stay</span>
							<span class="spec-val font-semibold">{resort.rate12 || '—'}</span>
						</div>
						<div class="spec-item">
							<span class="spec-label">22-Hour Overnight</span>
							<span class="spec-val font-semibold">{resort.rate22 || '—'}</span>
						</div>
						<div class="spec-item">
							<span class="spec-label">Capacity</span>
							<span class="spec-val">{resort.pax || '—'}</span>
						</div>
						<div class="spec-item">
							<span class="spec-label">Additional Guest</span>
							<span class="spec-val">{resort.addPax || '—'}</span>
						</div>
					</div>
				</div>

				<!-- Facilities -->
				<div class="detail-block">
					<h2 class="section-title font-display">Facilities</h2>
					<div class="specs-table font-body">
						<div class="spec-item">
							<span class="spec-label">Bedrooms</span>
							<span class="spec-val">{resort.rooms || '—'}</span>
						</div>
						<div class="spec-item">
							<span class="spec-label">Pool Setup</span>
							<span class="spec-val">{resort.pool || '—'}</span>
						</div>
						<div class="spec-item">
							<span class="spec-label">Location</span>
							<span class="spec-val">{resort.location || '—'}</span>
						</div>
					</div>
				</div>

				<!-- Inclusions -->
				<div class="detail-block">
					<h2 class="section-title font-display">Inclusions</h2>
					{#if resort.inclusions && resort.inclusions.length > 0}
						<div class="tag-wrap font-body">
							{#each resort.inclusions as inc}
								<span class="clean-tag">{inc}</span>
							{/each}
						</div>
					{:else}
						<p class="empty-note font-body">No specific inclusions recorded.</p>
					{/if}
				</div>

				<!-- Amenities -->
				<div class="detail-block">
					<h2 class="section-title font-display">Amenities</h2>
					{#if resort.amenities && resort.amenities.length > 0}
						<div class="tag-wrap font-body">
							{#each resort.amenities as amen}
								<span class="clean-tag">{amen}</span>
							{/each}
						</div>
					{:else}
						<p class="empty-note font-body">No specific amenities recorded.</p>
					{/if}
				</div>
			</div>
		</section>
	</main>

	<!-- Minimal Footer -->
	<footer class="slug-footer font-body">
		<div class="footer-inner">
			<span>balay <sup>®</sup> archive · {resort.name}</span>
			<a href="/" class="footer-back">Return to archive ↑</a>
		</div>
	</footer>
</div>

<style>
	.slug-page {
		min-height: 100vh;
		background: var(--color-bg);
		color: var(--color-ink);
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
	}

	/* Top Navigation */
	.slug-header {
		position: sticky;
		top: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 28px;
		background: rgba(246, 245, 243, 0.9);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-line);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-ink);
		text-decoration: none;
		padding: 6px 14px;
		border: 1px solid var(--color-line);
		background: white;
		border-radius: 0;
		transition: all 0.2s ease;
	}

	.back-link:hover {
		background: var(--color-ink);
		color: white;
		border-color: var(--color-ink);
	}

	.back-arrow {
		font-size: 13px;
		transition: transform 0.2s ease;
	}

	.back-link:hover .back-arrow {
		transform: translateX(-2px);
	}

	.brand-badge {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: lowercase;
		display: flex;
		align-items: baseline;
		gap: 4px;
	}

	.brand-badge sup {
		font-size: 8px;
	}

	.badge-sub {
		font-family: var(--font-body);
		font-size: 10px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.header-spacer {
		min-width: 110px;
	}

	/* Main Content */
	.slug-main {
		flex: 1;
		width: 100%;
		max-width: 1100px;
		margin: 0 auto;
		padding: 40px 24px 80px;
	}

	/* Hero Header */
	.hero-header {
		text-align: center;
		max-width: 780px;
		margin: 0 auto 24px;
	}

	.location-pill {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 10.5px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--color-muted);
		padding: 4px 12px;
		border: 1px solid var(--color-line);
		border-radius: 0;
		background: var(--color-glass-strong);
		margin-bottom: 14px;
	}

	.dot {
		width: 4px;
		height: 4px;
		background: var(--color-ink);
		opacity: 0.5;
	}

	.hero-name {
		font-size: clamp(30px, 4vw, 48px);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.15;
		margin: 0 0 16px;
		color: var(--color-ink);
	}

	.hero-contact-row {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: white;
		border: 1px solid var(--color-line);
		padding: 5px 14px;
		border-radius: 0;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
	}

	.contact-text {
		font-size: 11.5px;
		color: var(--color-muted);
		letter-spacing: 0.02em;
	}

	.copy-btn {
		background: none;
		border: 1px solid var(--color-line);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-ink);
		cursor: pointer;
		padding: 2px 7px;
		border-radius: 0;
		transition: all 0.15s ease;
	}

	.copy-btn:hover {
		background: var(--color-ink);
		color: white;
		border-color: var(--color-ink);
	}

	/* Carousel Section */
	.carousel-section {
		margin: 10px 0 54px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.carousel-hint-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 12px;
		font-size: 10px;
		letter-spacing: 1.5px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.hint-dot {
		width: 4px;
		height: 4px;
		background: var(--color-ink);
		opacity: 0.4;
	}

	/* Minimalist Details Grid */
	.details-section {
		margin-top: 20px;
		border-top: 1px solid var(--color-line);
		padding-top: 44px;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 40px 48px;
	}

	.detail-block {
		display: flex;
		flex-direction: column;
	}

	.section-title {
		font-size: 19px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--color-ink);
		margin: 0 0 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--color-line);
	}

	.specs-table {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.spec-item {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		font-size: 12.5px;
	}

	.spec-label {
		color: var(--color-muted);
	}

	.spec-val {
		color: var(--color-ink);
		text-align: right;
	}

	.tag-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.clean-tag {
		display: inline-block;
		font-size: 11px;
		letter-spacing: 0.03em;
		padding: 5px 12px;
		background: white;
		border: 1px solid var(--color-line);
		color: var(--color-ink);
		border-radius: 0;
	}

	.empty-note {
		font-size: 12px;
		color: var(--color-muted);
		font-style: italic;
		margin: 0;
	}

	/* Footer */
	.slug-footer {
		border-top: 1px solid var(--color-line);
		padding: 24px 28px;
		background: transparent;
	}

	.footer-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		color: var(--color-muted);
		letter-spacing: 0.04em;
	}

	.footer-back {
		color: var(--color-ink);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.15s ease;
	}

	.footer-back:hover {
		opacity: 0.65;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.details-grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}

		.slug-header {
			padding: 12px 18px;
		}

		.slug-main {
			padding: 24px 18px 60px;
		}
	}
</style>

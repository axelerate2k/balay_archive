<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import type { Resort } from "$lib/types/resort";
	import {
		filterResorts,
		getResortPrice,
		formatPrice,
	} from "$lib/data/priceUtils";
	import { getResortCoverUrl } from "$lib/data/resorts";
	import obleIcon from "$lib/assets/oble.png";

	interface Props {
		resorts: Resort[];
	}

	let { resorts }: Props = $props();

	// ── Filter state ──────────────────────────────────────────────────────────
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let minPax = $state<number | null>(null);
	let minRooms = $state<number | null>(null);
	let rateType = $state<"12h" | "22h">("22h");

	function handleMinPriceInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, "");
		const val = parseInt(clean, 10);
		minPrice = isNaN(val) || val <= 0 ? null : val;
	}

	function handleMaxPriceInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, "");
		const val = parseInt(clean, 10);
		maxPrice = isNaN(val) || val <= 0 ? null : val;
	}

	function handlePaxInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, "");
		const val = parseInt(clean, 10);
		minPax = isNaN(val) || val <= 0 ? null : val;
	}

	function handleRoomsInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, "");
		const val = parseInt(clean, 10);
		minRooms = isNaN(val) || val <= 0 ? null : val;
	}

	function resetFilter() {
		minPrice = null;
		maxPrice = null;
		minPax = null;
		minRooms = null;
	}

	const isFiltered = $derived(
		minPrice != null ||
			maxPrice != null ||
			minPax != null ||
			minRooms != null,
	);

	const filteredResorts = $derived.by(() => {
		return filterResorts(resorts, {
			minPrice,
			maxPrice,
			rateType,
			minPax,
			minRooms,
		});
	});

	const pinnedResorts = $derived(
		filteredResorts.filter(
			(r) => r.latitude != null && r.longitude != null,
		),
	);

	const unpinnedCount = $derived(resorts.length - pinnedResorts.length);

	// ── Map setup ─────────────────────────────────────────────────────────────
	const BOUNDS: [[number, number], [number, number]] = [
		[14.12, 121.12], // SW — Makiling base / Calamba outskirts
		[14.23, 121.27], // NE — Laguna de Bay shore / Los Baños boundary
	];
	const DEFAULT_CENTER: [number, number] = [14.172, 121.192]; // Pansol/Los Baños belt
	const DEFAULT_ZOOM = 14;
	const OBLATION_ASPECT = 375 / 666;

	// UPLB Oblation landmark — precisely centered in Oblation Park
	const OBLATION_LATLNG: [number, number] = [
		14.16494234999896, 121.24153860169206,
	];

	let mapContainer: HTMLElement;
	let leafletMap: any = null;
	let L: any = null;
	let clusterGroup: any = null;
	let oblationMarker: any = null;
	let currentZoom = $state(DEFAULT_ZOOM);

	// ── Zoom-responsive sizing ────────────────────────────────────────────────
	function getAvatarSize(zoom: number): number {
		if (zoom >= 17) return 52;
		if (zoom >= 15) return 38;
		return 28;
	}

	// ── Marker HTML builders ──────────────────────────────────────────────────
	function buildResortPin(resort: Resort, zoom: number): string {
		const size = getAvatarSize(zoom);
		const imgSrc =
			resort.gallery && resort.gallery.length > 0
				? resort.gallery[0]
				: getResortCoverUrl(resort.image_seed);
		const price = getResortPrice(resort, rateType);
		const priceLabel = price ? formatPrice(price) : "";
		const showPrice = zoom >= 14;

		return `
			<div class="bly-pin" style="--sz:${size}px;">
				<div class="bly-avatar">
					<img src="${imgSrc}" alt="${resort.name}" draggable="false" />
				</div>
				${showPrice && priceLabel ? `<div class="bly-price">${priceLabel}</div>` : ""}
			</div>
		`;
	}

	function buildOblationPin(zoom: number): string {
		const height = Math.round(getAvatarSize(zoom) * 1.1);
		const width = Math.round(height * OBLATION_ASPECT);
		return `
        <div class="bly-landmark" style="--w:${width}px; --h:${height}px;">
            <div class="bly-landmark-icon">
                <img src="${obleIcon}" alt="UPLB Oblation" draggable="false" />
            </div>
            ${zoom >= 14 ? `<div class="bly-landmark-label">UPLB Oblation</div>` : ""}
        </div>
    `;
	}

	function getOblationIcon(zoom: number) {
		const height = Math.round(getAvatarSize(zoom) * 1.1);
		const totalWidth = 100;
		const totalHeight = height + (zoom >= 14 ? 22 : 2);
		return L.divIcon({
			className: "bly-landmark-wrap",
			html: buildOblationPin(zoom),
			iconSize: [totalWidth, totalHeight],
			iconAnchor: [totalWidth / 2, height],
		});
	}

	// ── Create / refresh all resort markers ──────────────────────────────────
	function rebuildMarkers(zoom: number) {
		if (!leafletMap || !L || !clusterGroup) return;

		clusterGroup.clearLayers();

		for (const resort of pinnedResorts) {
			const lat = resort.latitude!;
			const lng = resort.longitude!;
			const size = getAvatarSize(zoom);
			const anchor = Math.round(size / 2);

			const icon = L.divIcon({
				className: "bly-pin-wrap",
				html: buildResortPin(resort, zoom),
				iconSize: [size + 40, size + 28],
				iconAnchor: [anchor + 20, size],
			});

			const marker = L.marker([lat, lng], { icon });

			const tooltipHtml = `
				<div class="bly-tooltip">
					<strong>${resort.name}</strong>
					<span>${resort.location}</span>
					${resort.pax ? `<span>${resort.pax}</span>` : ""}
				</div>
			`;
			marker.bindTooltip(tooltipHtml, {
				direction: "top",
				offset: [0, -(size + 8)],
				className: "bly-leaflet-tooltip",
				permanent: false,
			});

			marker.on("click", () => goto(`/${resort.slug}`));
			clusterGroup.addLayer(marker);
		}
	}

	// ── Update Oblation marker on zoom ────────────────────────────────────────
	function updateOblation(zoom: number) {
		if (!oblationMarker || !L) return;
		oblationMarker.setIcon(getOblationIcon(zoom));
	}

	// ── Mount Leaflet ─────────────────────────────────────────────────────────
	onMount(() => {
		if (typeof window === "undefined") return;

		let mapInstance: any = null;

		(async () => {
			const leafletModule = await import("leaflet");
			L = leafletModule.default || leafletModule;

			await import("leaflet.markercluster");

			leafletMap = L.map(mapContainer, {
				center: DEFAULT_CENTER,
				zoom: DEFAULT_ZOOM,
				minZoom: 13,
				maxZoom: 18,
				maxBounds: BOUNDS,
				maxBoundsViscosity: 0.85,
				zoomControl: false, // Removed zoom buttons from top-left
				attributionControl: false,
			});
			mapInstance = leafletMap;

			// OpenStreetMap raster tiles — clean, zero API key, no watermark
			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			}).addTo(leafletMap);

			// Cluster group with Balay-branded bubbles
			clusterGroup = (L as any).markerClusterGroup({
				maxClusterRadius: 60,
				iconCreateFunction: (cluster: any) => {
					const count = cluster.getChildCount();
					return L.divIcon({
						html: `<div class="bly-cluster"><span>${count}</span></div>`,
						className: "bly-cluster-wrap",
						iconSize: [48, 48],
						iconAnchor: [24, 24],
					});
				},
				animateAddingMarkers: true,
				spiderfyOnMaxZoom: true,
			});
			leafletMap.addLayer(clusterGroup);

			// UPLB Oblation landmark marker centered in Oblation Park
			oblationMarker = L.marker(OBLATION_LATLNG, {
				icon: getOblationIcon(DEFAULT_ZOOM),
				zIndexOffset: -100,
			});
			oblationMarker.bindTooltip(
				`<div class="bly-tooltip"><strong>UPLB Oblation</strong><span>Oblation Park, University of the Philippines Los Baños</span></div>`,
				{
					direction: "top",
					className: "bly-leaflet-tooltip",
					permanent: false,
				},
			);
			oblationMarker.addTo(leafletMap);

			// Initial markers
			rebuildMarkers(DEFAULT_ZOOM);

			// Zoom handler: scale everything
			leafletMap.on("zoomend", () => {
				const z = leafletMap.getZoom();
				currentZoom = z;
				rebuildMarkers(z);
				updateOblation(z);
			});
		})();

		return () => {
			if (mapInstance) mapInstance.remove();
		};
	});

	// Reactively refresh markers when filter changes
	$effect(() => {
		const _list = pinnedResorts;
		const _rate = rateType;
		if (leafletMap && clusterGroup) {
			rebuildMarkers(currentZoom);
		}
	});
</script>

<!-- Map container -->
<div class="map-view">
	<div class="map-canvas" bind:this={mapContainer}></div>

	<!-- Floating filter bar -->
	<div class="map-filter-bar">
		<div class="map-filter-inner">
			<!-- Price Min / Max -->
			<div class="map-filter-group">
				<span class="map-filter-label">PRICE</span>
				<div class="compact-input-wrap" title="Minimum Price">
					<span class="input-curr">₱</span>
					<input
						type="text"
						inputmode="numeric"
						placeholder="Min"
						value={minPrice ? minPrice.toLocaleString() : ""}
						oninput={(e) =>
							handleMinPriceInput(e.currentTarget.value)}
						class="compact-price-input"
					/>
				</div>
				<span class="input-sep">–</span>
				<div class="compact-input-wrap" title="Maximum Price">
					<span class="input-curr">₱</span>
					<input
						type="text"
						inputmode="numeric"
						placeholder="Max"
						value={maxPrice ? maxPrice.toLocaleString() : ""}
						oninput={(e) =>
							handleMaxPriceInput(e.currentTarget.value)}
						class="compact-price-input"
					/>
				</div>
			</div>

			<div class="map-filter-divider"></div>

			<!-- Pax filter -->
			<div class="map-filter-group">
				<span class="map-filter-label">PAX</span>
				<div
					class="compact-input-wrap compact-num-wrap"
					title="Minimum Pax Capacity"
				>
					<input
						type="text"
						inputmode="numeric"
						placeholder="Min"
						value={minPax ? String(minPax) : ""}
						oninput={(e) => handlePaxInput(e.currentTarget.value)}
						class="compact-price-input"
					/>
				</div>
			</div>

			<div class="map-filter-divider"></div>

			<!-- Rooms filter -->
			<div class="map-filter-group">
				<span class="map-filter-label">ROOMS</span>
				<div
					class="compact-input-wrap compact-num-wrap"
					title="Minimum Room Count"
				>
					<input
						type="text"
						inputmode="numeric"
						placeholder="Min"
						value={minRooms ? String(minRooms) : ""}
						oninput={(e) => handleRoomsInput(e.currentTarget.value)}
						class="compact-price-input"
					/>
				</div>
			</div>

			<div class="map-filter-divider"></div>

			<!-- Rate toggle -->
			<div class="map-filter-group">
				<span class="map-filter-label">RATE</span>
				<div class="map-pill-row">
					<button
						class="map-pill {rateType === '22h'
							? 'map-pill-active'
							: ''}"
						onclick={() => (rateType = "22h")}
					>
						22H
					</button>
					<button
						class="map-pill {rateType === '12h'
							? 'map-pill-active'
							: ''}"
						onclick={() => (rateType = "12h")}
					>
						12H
					</button>
				</div>
			</div>

			{#if isFiltered}
				<button
					class="map-reset-btn"
					onclick={resetFilter}
					title="Reset all filters"
				>
					CLEAR
				</button>
			{/if}

			<div class="map-filter-divider"></div>

			<!-- Status indicator -->
			<div class="map-status">
				<span class="map-status-count">
					{pinnedResorts.length} of {resorts.length} resorts
				</span>
				{#if unpinnedCount > 0}
					<span class="map-status-note"
						>{unpinnedCount} not yet pinned</span
					>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* ── Layout ────────────────────────────────────────────────────────────── */
	.map-view {
		position: fixed;
		inset: 0;
		z-index: 20;
		background: #f0ede6;
	}

	.map-canvas {
		position: absolute;
		inset: 0;
	}

	/* ── Tile styling (clean, warm, watermark-free OSM) ──────────────────────── */
	:global(.map-canvas .leaflet-tile-pane) {
		filter: saturate(0.65) brightness(1.02) contrast(0.96);
	}

	/* ── Floating filter bar ────────────────────────────────────────────────── */
	.map-filter-bar {
		position: absolute;
		bottom: 72px; /* above CornerNav */
		left: 50%;
		transform: translateX(-50%);
		z-index: 500;
		pointer-events: auto;
	}

	.map-filter-inner {
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(246, 245, 243, 0.94);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(19, 19, 19, 0.12);
		padding: 9px 16px;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.12),
			0 2px 0 rgba(255, 255, 255, 0.5) inset;
		white-space: nowrap;
	}

	.map-filter-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.map-filter-label {
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: var(--color-muted);
	}

	.compact-input-wrap {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.75);
		border: 1px solid rgba(19, 19, 19, 0.14);
		padding: 3px 6px;
		width: 68px;
		transition:
			border-color 0.15s ease,
			background 0.15s ease;
	}

	.compact-num-wrap {
		width: 48px;
	}

	.compact-input-wrap:focus-within {
		border-color: var(--color-ink);
		background: #ffffff;
	}

	.input-curr {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 600;
		color: var(--color-muted);
		margin-right: 2px;
	}

	.compact-price-input {
		width: 100%;
		border: none;
		background: transparent;
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 600;
		color: var(--color-ink);
		outline: none;
		padding: 0;
	}

	.compact-price-input::placeholder {
		color: rgba(19, 19, 19, 0.32);
		font-weight: 400;
	}

	.input-sep {
		font-size: 11px;
		color: var(--color-muted);
	}

	.map-reset-btn {
		appearance: none;
		border: 1px solid rgba(19, 19, 19, 0.18);
		background: transparent;
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		padding: 3px 6px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.map-reset-btn:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
		background: rgba(19, 19, 19, 0.05);
	}

	.map-pill-row {
		display: flex;
		gap: 3px;
	}

	.map-pill {
		appearance: none;
		border: 1px solid var(--color-line);
		background: transparent;
		padding: 4px 10px;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.04em;
		font-family: var(--font-body);
		color: var(--color-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.map-pill:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
	}

	.map-pill-active {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: #ffffff;
	}

	.map-filter-divider {
		width: 1px;
		height: 22px;
		background: var(--color-line);
		flex-shrink: 0;
	}

	.map-status {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.map-status-count {
		font-family: var(--font-body);
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--color-ink);
	}

	.map-status-note {
		font-family: var(--font-body);
		font-size: 9px;
		color: var(--color-muted);
	}

	/* ── Leaflet z-index fix ─────────────────────────────────────────────── */
	:global(.leaflet-pane) {
		z-index: 1;
	}
	:global(.leaflet-top),
	:global(.leaflet-bottom) {
		z-index: 400;
	}

	/* ── Resort pin ─────────────────────────────────────────────────────────── */
	:global(.bly-pin-wrap) {
		background: transparent !important;
		border: none !important;
	}

	:global(.bly-pin) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 3px;
		cursor: pointer;
	}

	:global(.bly-avatar) {
		width: var(--sz, 38px);
		height: var(--sz, 38px);
		border-radius: 50%;
		overflow: hidden;
		border: 2.5px solid #ffffff;
		box-shadow:
			0 4px 14px rgba(19, 19, 19, 0.3),
			0 0 0 1px rgba(19, 19, 19, 0.1);
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	:global(.bly-avatar img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		pointer-events: none;
	}

	:global(.bly-pin:hover .bly-avatar) {
		transform: scale(1.1);
	}

	:global(.bly-price) {
		font-family: "Inter", sans-serif;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #131313;
		background: rgba(246, 245, 243, 0.94);
		backdrop-filter: blur(8px);
		padding: 2px 7px;
		border-radius: 9999px;
		border: 1px solid rgba(19, 19, 19, 0.12);
		white-space: nowrap;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		pointer-events: none;
	}

	/* ── Marker Cluster styling ─────────────────────────────────────────────── */
	:global(.bly-cluster-wrap) {
		background: transparent !important;
		border: none !important;
	}

	:global(.bly-cluster) {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgba(246, 245, 243, 0.95);
		border: 2px solid #131313;
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.22),
			0 2px 0 rgba(255, 255, 255, 0.8) inset;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		backdrop-filter: blur(8px);
		transition: transform 0.15s ease;
	}

	:global(.bly-cluster:hover) {
		transform: scale(1.08);
	}

	:global(.bly-cluster span) {
		font-family: "Inter", sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: #131313;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	/* ── UPLB Oblation landmark ─────────────────────────────────────────────── */
	:global(.bly-landmark-wrap) {
		background: transparent !important;
		border: none !important;
	}

	:global(.bly-landmark) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		pointer-events: none;
	}

	:global(.bly-landmark-icon) {
		width: var(--w, 21px);
		height: var(--h, 38px);
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.bly-landmark-icon img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		pointer-events: none;
		display: block;
	}

	:global(.bly-landmark-icon svg) {
		width: 100%;
		height: 100%;
	}

	:global(.bly-landmark-label) {
		font-family: "Inter", sans-serif;
		font-size: 9px;
		font-weight: 600;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: #6b5b42;
		background: rgba(246, 245, 243, 0.92);
		padding: 2px 6px;
		border-radius: 2px;
		white-space: nowrap;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
	}

	/* ── Custom tooltip ────────────────────────────────────────────────────── */
	:global(.bly-leaflet-tooltip) {
		background: rgba(19, 19, 19, 0.92) !important;
		border: none !important;
		border-radius: 3px !important;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
		padding: 0 !important;
	}

	:global(.bly-leaflet-tooltip::before) {
		border-top-color: rgba(19, 19, 19, 0.92) !important;
	}

	:global(.bly-tooltip) {
		padding: 8px 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	:global(.bly-tooltip strong) {
		font-family: "Inter", sans-serif;
		font-size: 11px;
		font-weight: 600;
		color: #ffffff;
		letter-spacing: -0.01em;
	}

	:global(.bly-tooltip span) {
		font-family: "Inter", sans-serif;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.65);
		letter-spacing: 0.02em;
	}

	/* ── Mobile ────────────────────────────────────────────────────────────── */
	@media (max-width: 768px) {
		.map-filter-bar {
			bottom: 80px;
			left: 12px;
			right: 12px;
			transform: none;
		}

		.map-filter-inner {
			flex-wrap: wrap;
			gap: 10px;
			padding: 10px 14px;
		}

		.map-filter-divider {
			display: none;
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		latitude?: number | null;
		longitude?: number | null;
	}

	let { latitude = null, longitude = null }: Props = $props();

	let currentLat = $state<number | null>(latitude);
	let currentLng = $state<number | null>(longitude);

	let mapContainer: HTMLElement;
	let leafletMap: any = null;
	let marker: any = null;
	let L: any = null;

	// Calamba–Pansol–Los Baños bounding box
	const BOUNDS: [[number, number], [number, number]] = [
		[14.1200, 121.1200], // Southwest (Makiling base / Calamba outskirts)
		[14.2300, 121.2700]  // Northeast (Laguna de Bay shore / Los Baños boundary)
	];
	const DEFAULT_CENTER: [number, number] = [14.1750, 121.1900]; // Pansol hot spring belt

	function createPinIcon() {
		return L.divIcon({
			className: 'admin-map-pin-wrap',
			html: `
				<div class="admin-pin-outer">
					<div class="admin-pin-dot"></div>
				</div>
			`,
			iconSize: [28, 28],
			iconAnchor: [14, 28]
		});
	}

	function setCoordinates(lat: number, lng: number) {
		currentLat = Math.round(lat * 1000000) / 1000000;
		currentLng = Math.round(lng * 1000000) / 1000000;

		if (!leafletMap || !L) return;

		if (!marker) {
			marker = L.marker([currentLat, currentLng], {
				draggable: true,
				icon: createPinIcon()
			}).addTo(leafletMap);

			marker.on('dragend', (e: any) => {
				const pos = e.target.getLatLng();
				currentLat = Math.round(pos.lat * 1000000) / 1000000;
				currentLng = Math.round(pos.lng * 1000000) / 1000000;
			});
		} else {
			marker.setLatLng([currentLat, currentLng]);
		}
	}

	function clearPin() {
		currentLat = null;
		currentLng = null;
		if (marker && leafletMap) {
			leafletMap.removeLayer(marker);
			marker = null;
		}
	}

	onMount(() => {
		if (typeof window === 'undefined') return;

		let mapInstance: any = null;

		(async () => {
			const leafletModule = await import('leaflet');
			L = leafletModule.default || leafletModule;

			// Initialize Leaflet map
			leafletMap = L.map(mapContainer, {
				center: currentLat && currentLng ? [currentLat, currentLng] : DEFAULT_CENTER,
				zoom: currentLat && currentLng ? 16 : 14,
				minZoom: 12,
				maxZoom: 18,
				maxBounds: BOUNDS,
				maxBoundsViscosity: 0.9,
				zoomControl: false,
				attributionControl: false
			});
			mapInstance = leafletMap;

			// OpenStreetMap raster tiles (free, zero API key, no watermark)
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(leafletMap);

			// If initial coordinates exist, place pin
			if (currentLat && currentLng) {
				setCoordinates(currentLat, currentLng);
			}

			// Click to drop or move pin
			leafletMap.on('click', (e: any) => {
				setCoordinates(e.latlng.lat, e.latlng.lng);
			});
		})();

		return () => {
			if (mapInstance) mapInstance.remove();
		};
	});
</script>

<div class="map-picker-container">
	<div class="map-picker-header">
		<span class="picker-label">Map Location (Zero-API Pin Picker)</span>
		<div class="picker-status">
			{#if currentLat && currentLng}
				<span class="coords-badge">📍 {currentLat.toFixed(5)}, {currentLng.toFixed(5)}</span>
				<button type="button" class="btn-clear" onclick={clearPin}>Remove Pin</button>
			{:else}
				<span class="coords-placeholder">Click anywhere on the map to pin resort location</span>
			{/if}
		</div>
	</div>

	<!-- Hidden inputs passed directly into form action -->
	<input type="hidden" name="latitude" value={currentLat ?? ''} />
	<input type="hidden" name="longitude" value={currentLng ?? ''} />

	<div class="map-canvas-wrap" bind:this={mapContainer}></div>

	<div class="map-picker-hint">
		<span>ℹ️ Bounded to Calamba, Pansol, and Los Baños. Click anywhere or drag the pin to reposition.</span>
	</div>
</div>

<style>
	.map-picker-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.map-picker-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}

	.picker-label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	.picker-status {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.coords-badge {
		font-family: monospace;
		font-size: 11px;
		background: rgba(19, 19, 19, 0.06);
		padding: 3px 8px;
		border-radius: 4px;
		color: var(--color-ink);
		font-weight: 600;
	}

	.coords-placeholder {
		font-size: 11px;
		color: var(--color-muted);
		font-style: italic;
	}

	.btn-clear {
		border: 1px solid var(--color-line);
		background: white;
		font-size: 11px;
		padding: 3px 8px;
		border-radius: 3px;
		cursor: pointer;
		color: #c62828;
		transition: all 0.15s ease;
	}

	.btn-clear:hover {
		background: #ffebee;
	}

	.map-canvas-wrap {
		width: 100%;
		height: 260px;
		border: 1px solid var(--color-line);
		background: #f0ede6;
		border-radius: 2px;
		overflow: hidden;
		position: relative;
		z-index: 1;
	}

	:global(.map-canvas-wrap .leaflet-tile-pane) {
		filter: saturate(0.65) brightness(1.02) contrast(0.96);
	}

	.map-picker-hint {
		font-size: 10.5px;
		color: var(--color-muted);
		line-height: 1.4;
	}

	/* Global custom pin style for Leaflet */
	:global(.admin-map-pin-wrap) {
		background: transparent;
		border: none;
	}

	:global(.admin-pin-outer) {
		width: 26px;
		height: 26px;
		background: #131313;
		border: 2.5px solid #ffffff;
		border-radius: 50% 50% 50% 0;
		transform: rotate(-45deg);
		box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
		display: grid;
		place-items: center;
		cursor: grab;
		transition: transform 0.15s ease;
	}

	:global(.admin-pin-outer:hover) {
		transform: rotate(-45deg) scale(1.15);
	}

	:global(.admin-pin-dot) {
		width: 8px;
		height: 8px;
		background: #ffffff;
		border-radius: 50%;
	}
</style>

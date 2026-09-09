# Balay Archive — Technical Implementation Blueprint

Comprehensive architectural specification and implementation roadmap for the **Balay Resort Archive** upgrades:
1. **Auto-Slide Center Card Details** (Synching resort preview details on cascade motion)
2. **Zero-API Map Pinning System** (Admin click-to-pin coordinate picker)
3. **Interactive Bounded Map View** (Calamba–Pansol–Los Baños region with custom tile layer)
4. **Kubo-Style Cluster Bubble & Dynamic Zoom-Scaled Markers** (Circular feature photos, price tags, and UP Oblation landmark)
5. **Unified Price Filter System** (Reactive dual-rate price filtering across Map and Index views)

---

## 1. Feature Specifications

### 1.1 Auto-Sliding Card Details Reveal (Cascade Mode)
* **Current Behavior**: When hovering over a card on desktop, `hoveredResort` is set in `$lib/stores/app`, revealing the floating `InfoPanel` at top-left (`name`, `rate12`, `rate22`, `pax`). Meanwhile, `.is-center` shifts the active card rightwards via `transform: translateX(...)`. On touch devices or auto-scroll, the card shifts right, but the info is not synchronized.
* **New Behavior**:
  * As the cascade scrolls and determines the `is-center` card (closest card to viewport focal point), the center card automatically updates the active preview state.
  * In addition to updating the floating `InfoPanel`, an inline glassmorphic reveal tag or smooth card info badge reveals the resort's **Name**, **Pax capacity**, and **Price rates** right as the card slides right.
  * Ensures seamless parity between mouse hover, manual drag, mouse wheel, and mobile snap-centering.

---

### 1.2 Zero-API Admin Map Pinning System
* **Goal**: Enable admins to pinpoint the exact location of a resort during creation (`/admin/resorts/new`) and editing (`/admin/resorts/[id]/edit`) without geocoding APIs, billing, or external rate limits.
* **Mechanics**:
  * Integrated interactive Leaflet mini-map directly in the admin form.
  * Default viewport centered over the Pansol/Los Baños resort belt (`14.1750° N, 121.1900° E`).
  * Admin simply clicks anywhere within the bounded region to drop/drag a pin.
  * Form inputs `latitude` and `longitude` (hidden or readonly inputs with quick reset button) are populated automatically on click.
  * On edit, if coordinates exist, the pin is initialized at that exact position with pan-to animation.

---

### 1.3 Interactive Map View (`MAP` Tab)
* **Navigation**:
  * `CornerNav.svelte` expanded from `OVERVIEW | INDEX` to `OVERVIEW | INDEX | MAP`.
  * Keyboard shortcut or URL state synchronization (`activeView` store supports `'overview' | 'index' | 'map'`).
* **Map Engine & Tile Layer**:
  * Built using **Leaflet** with **CartoDB Positron** or **OpenStreetMap** raster tiles (zero-cost, no API key).
  * Styled to match Balay’s warm minimalist aesthetic (`#f6f5f3` background, muted typography).
* **Cropped Geographical Boundaries (`maxBounds`)**:
  * Restricted strictly to the Calamba–Pansol–Los Baños resort corridor.
  * `maxBounds`:
    * Southwest: `[14.1200, 121.1200]` (Mt. Makiling base / Calamba outskirts)
    * Northeast: `[14.2300, 121.2700]` (Laguna de Bay shore / Los Baños boundary)
  * Users cannot pan or zoom out into the rest of the Philippines or open ocean.
  * Min zoom: `13`, Max zoom: `18`, Default initial zoom: `14.5`.

---

### 1.4 Kubo-Style Bubble Clustering & Dynamic Zoom Pins
Referencing the campus dorm platform UI:
* **Cluster Bubbles**:
  * Powered by `leaflet.markercluster` with custom CSS styling to match Balay branding.
  * When pins overlap at lower zoom levels, they coalesce into an elegant circular bubble with resort count (e.g. `2`, `5`).
  * Clicking a cluster smoothly zooms in and expands (`spiderfies` or decomposes) into individual pins.
* **Individual Resort Pins**:
  * Custom Leaflet `divIcon`:
    * Circular avatar featuring the resort's primary cover image (`gallery[0]` or fallback seed image).
    * Attached sleek price pill badge (e.g., `₱6,500` or `₱12,000`).
    * Drop shadow and subtle glass border (`rgba(19, 19, 19, 0.15)`).
  * **Hover Interaction**: Hovering displays a minimalist tooltip with the resort name, location, and pax.
  * **Click Interaction**: Clicking transitions smoothly into the resort's dedicated page (`/{slug}`).
* **Dynamic Zoom Scaling**:
  * Both resort pins and the Oblation landmark dynamically scale their CSS transform size based on `map.getZoom()`.
  * High zoom (e.g. zoom 17–18): Full size (52px avatar + expanded label).
  * Mid zoom (e.g. zoom 14–15): Medium size (38px avatar + compact badge).
  * Low zoom (e.g. zoom 13): Compact dot avatar (28px).
* **UP Oblation Landmark Marker**:
  * Dedicated anchor point at UPLB Oblation Park (`14.1656° N, 121.2414° E`).
  * Displays a stylized silhouette / graphic of the UP Oblation with label "UPLB Oblation".
  * Acts as the primary regional anchor orientation point for visitors viewing Los Baños vs Pansol/Calamba.

---

### 1.5 Price Range Filtering (Map & Index Views)
* **Price Parsing Engine**:
  * Resorts store rates as free-form strings (`rate_12h`: "₱6,500", `rate_22h`: "₱12,000 - ₱14,000").
  * Robust numerical parser extracts the numeric values (`parsePrice(resort.rate12)` and `parsePrice(resort.rate22)`).
* **Index View Controls**:
  * Integrated alongside the existing text search bar:
    * Price bracket dropdown or min/max slider (e.g., "All Prices", "Under ₱8,000", "₱8,000 – ₱15,000", "₱15,000+").
    * Rate toggle: Filter by **12h Rate** or **22h (Overnight) Rate**.
  * Matches the table filter in real time with active resort counter.
* **Map View Controls**:
  * Floating glassmorphic control bar on top/bottom of the map.
  * Filtering dynamically adds/removes markers from the marker cluster group with animated transitions.
  * Live status indicator: `"Showing X of Y resorts in area"`.

---

## 2. Database Schema & Data Modeling

### 2.1 Postgres / Supabase Schema Update
Add `latitude` and `longitude` fields to the `resorts` table:

```sql
-- Migration: Add geolocation coordinates to resorts table
alter table resorts
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Optional spatial index for coordinate querying
create index if not exists idx_resorts_lat_lng on resorts(latitude, longitude);
```

### 2.2 TypeScript Model Update (`src/lib/types/resort.ts`)
```ts
export interface Resort {
	id: string;
	slug: string;
	name: string;
	location: string;
	contact: string;
	rate12: string;
	rate22: string;
	pax: string;
	addPax: string;
	rooms: string;
	pool: string;
	inclusions: string[];
	amenities: string[];
	gallery: string[];
	image_seed: string;
	latitude?: number | null;
	longitude?: number | null;
	created_at?: string;
	updated_at?: string;
}
```

---

## 3. Architecture & Component Blueprint

```
src/
├── lib/
│   ├── components/
│   │   ├── Card.svelte               <- Add center-reveal details badge
│   │   ├── CardCascade.svelte        <- Update center-index change dispatching
│   │   ├── CornerNav.svelte          <- Add MAP tab button
│   │   ├── IndexView.svelte          <- Add Price Range Filter UI
│   │   ├── InfoPanel.svelte          <- Reactive to center & hover triggers
│   │   ├── MapPinPicker.svelte       <- Admin click-to-pin Leaflet component
│   │   ├── MapView.svelte            <- Public interactive clustered map
│   │   └── TopNav.svelte
│   ├── data/
│   │   └── priceUtils.ts             <- Price parsing & filtering helpers
│   ├── stores/
│   │   └── app.ts                    <- activeView: 'overview' | 'index' | 'map'
│   └── types/
│       └── resort.ts                 <- latitude & longitude properties
└── routes/
    ├── +page.svelte                  <- Render MapView when activeView === 'map'
    ├── +page.server.ts               <- Fetch & pass lat/lng
    └── admin/
        └── resorts/
            ├── new/+page.svelte      <- Include MapPinPicker
            ├── new/+page.server.ts   <- Insert latitude, longitude
            ├── [id]/edit/+page.svelte<- Include MapPinPicker with initial coords
            └── [id]/edit/+page.server.ts <- Update latitude, longitude
```

---

## 4. Implementation Step-by-Step Plan

### Phase 1: Card Slide Details & Price Utilities
1. **`src/lib/data/priceUtils.ts`**:
   * Implement `parsePrice(str: string): number | null` (strips `₱`, `,`, extra characters; extracts lowest numeric integer).
   * Implement `filterResortsByPrice(resorts, minPrice, maxPrice, rateType)`.
2. **`src/lib/components/CardCascade.svelte` & `Card.svelte`**:
   * On center index change, update active resort in store.
   * Add slide details overlay on `.card-inner`: when shifted right (`is-center` or `:hover`), render sleek glass info tag displaying resort name, rate, and pax.
3. **`src/lib/components/InfoPanel.svelte`**:
   * Ensure mobile and desktop properly display information when sliding triggers.

### Phase 2: Geolocation Schema & Admin Pin Picker
1. **Supabase Schema**:
   * Execute migration adding `latitude` and `longitude` to `resorts`.
2. **`src/lib/components/MapPinPicker.svelte`**:
   * Leaflet map with Pansol/Calamba/Los Baños bounds.
   * Click listener that moves a custom Balay marker and emits `[lat, lng]`.
3. **Admin Forms Integration**:
   * Integrate `MapPinPicker` in `/admin/resorts/new` and `/admin/resorts/[id]/edit`.
   * Bind to form submission payloads in `+page.server.ts`.

### Phase 3: Public Map View with Clustering & Zoom Sizing
1. **Dependencies**:
   * Install `leaflet`, `@types/leaflet`, and `leaflet.markercluster`.
   * Add required Leaflet and Cluster CSS in `app.html` or scoped imports.
2. **`src/lib/components/MapView.svelte`**:
   * Initialize Leaflet map with bounded view:
     * Center: Pansol/Los Baños (`[14.1720, 121.1920]`).
     * `maxBounds`: strictly Calamba to Los Baños.
   * Add **UP Oblation Landmark Marker** at Oblation Park (`[14.1656, 121.2414]`) with dynamic zoom scaling.
   * Add **MarkerClusterGroup** with customized circular count bubbles.
   * Construct circular resort pins using `L.divIcon` displaying the cover photo, resort name tooltip, and price pill.
   * Listen to `zoomend` to scale pin dimensions accordingly.
   * Pin click triggers navigation to `/{resort.slug}`.

### Phase 4: Price Filter Integration & Tab Switching
1. **`src/lib/stores/app.ts`**:
   * Update `activeView` to `'overview' | 'index' | 'map'`.
2. **`src/lib/components/CornerNav.svelte`**:
   * Add the `MAP` mode switch button.
3. **`src/lib/components/IndexView.svelte`**:
   * Add price filter inputs / quick-filter pills (e.g., `Any`, `≤ ₱8k`, `₱8k-₱12k`, `≥ ₱12k`).
4. **`src/lib/components/MapView.svelte`**:
   * Add floating map filter bar allowing live rate filtering (updating visible map markers and cluster counts).

---

## 5. Verification & Testing Matrix

| Feature | Test Case | Success Criteria |
| :--- | :--- | :--- |
| **Card Slide Info** | Drag/scroll cascade on desktop & mobile | As card slides right, name, pax, and price details become clearly visible without overlapping. |
| **Admin Pin Picker**| Create / Edit resort in `/admin` | Clicking mini-map sets coordinates; submitting saves lat/lng to Supabase and reloads properly on edit. |
| **Map Boundaries**  | Pan to edge of map in `MAP` view | Map stops panning outside Calamba, Pansol, and Los Baños boundaries. |
| **Marker Clustering**| Zoom in/out on multiple nearby resorts | Overlapping pins combine into clean numbered bubbles; zooming in dissolves clusters into individual photo pins. |
| **UP Oblation Marker**| Inspect UPLB campus area | Oblation icon clearly visible with label; scales smoothly when zooming in/out. |
| **Price Filtering** | Adjust price filter in Map and Index | List and map pins filter in real time; cluster counts recalculate instantly. |
| **Navigation**      | Click pin on map | Smoothly routes to `/{slug}` full resort view. |
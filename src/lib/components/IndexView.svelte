<script lang="ts">
	import type { Resort } from '$lib/types/resort';
	import { goto } from '$app/navigation';
	import { filterResorts, formatPrice } from '$lib/data/priceUtils';

	interface Props {
		resorts: Resort[];
	}

	let { resorts }: Props = $props();
	let searchQuery = $state('');
	let rateType = $state<'12h' | '22h'>('22h');

	// ── Filter state ──────────────────────────────────────────────────────────
	let minPrice = $state<number | null>(null);
	let maxPrice = $state<number | null>(null);
	let minPax = $state<number | null>(null);
	let minRooms = $state<number | null>(null);

	function handleMinPriceInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, '');
		const val = parseInt(clean, 10);
		minPrice = isNaN(val) || val <= 0 ? null : val;
	}

	function handleMaxPriceInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, '');
		const val = parseInt(clean, 10);
		maxPrice = isNaN(val) || val <= 0 ? null : val;
	}

	function handlePaxInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, '');
		const val = parseInt(clean, 10);
		minPax = isNaN(val) || val <= 0 ? null : val;
	}

	function handleRoomsInput(valStr: string) {
		const clean = valStr.replace(/[^0-9]/g, '');
		const val = parseInt(clean, 10);
		minRooms = isNaN(val) || val <= 0 ? null : val;
	}

	function resetPriceFilter() {
		minPrice = null;
		maxPrice = null;
		minPax = null;
		minRooms = null;
	}

	const isFiltered = $derived(
		minPrice != null || maxPrice != null || minPax != null || minRooms != null
	);

	const filtered = $derived.by(() => {
		const textFiltered = resorts.filter(
			(r) =>
				r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.location.toLowerCase().includes(searchQuery.toLowerCase())
		);
		return filterResorts(textFiltered, {
			minPrice,
			maxPrice,
			rateType,
			minPax,
			minRooms
		});
	});

	function pillList(items: string[]): string {
		return items
			.map(
				(t) =>
					`<span class="inline-block text-[10px] tracking-wide border border-ink/12 px-1.5 py-0.5 mr-1 mt-0.5 rounded-sm">${t}</span>`
			)
			.join('');
	}
</script>

<section class="index-view">
	<!-- Controls -->
	<div class="controls-row">
		<input
			type="text"
			placeholder="SEARCH RESORT NAME OR LOCATION..."
			bind:value={searchQuery}
			class="search-input"
		/>
		<div class="resort-count">
			{filtered.length} RESORT{filtered.length === 1 ? '' : 'S'}
		</div>
	</div>

	<!-- Filter row -->
	<div class="filter-row">
		<!-- Price Min / Max -->
		<div class="filter-group">
			<span class="filter-label">PRICE</span>
			<div class="compact-input-wrap" title="Minimum Price">
				<span class="input-curr">₱</span>
				<input
					type="text"
					inputmode="numeric"
					placeholder="Min"
					value={minPrice ? minPrice.toLocaleString() : ''}
					oninput={(e) => handleMinPriceInput(e.currentTarget.value)}
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
					value={maxPrice ? maxPrice.toLocaleString() : ''}
					oninput={(e) => handleMaxPriceInput(e.currentTarget.value)}
					class="compact-price-input"
				/>
			</div>
		</div>

		<div class="filter-divider"></div>

		<!-- Pax filter -->
		<div class="filter-group">
			<span class="filter-label">PAX</span>
			<div class="compact-input-wrap compact-num-wrap" title="Minimum Pax Capacity">
				<input
					type="text"
					inputmode="numeric"
					placeholder="Min"
					value={minPax ? String(minPax) : ''}
					oninput={(e) => handlePaxInput(e.currentTarget.value)}
					class="compact-price-input"
				/>
			</div>
		</div>

		<div class="filter-divider"></div>

		<!-- Rooms filter -->
		<div class="filter-group">
			<span class="filter-label">ROOMS</span>
			<div class="compact-input-wrap compact-num-wrap" title="Minimum Room Count">
				<input
					type="text"
					inputmode="numeric"
					placeholder="Min"
					value={minRooms ? String(minRooms) : ''}
					oninput={(e) => handleRoomsInput(e.currentTarget.value)}
					class="compact-price-input"
				/>
			</div>
		</div>

		<div class="filter-divider"></div>

		<!-- Rate toggle -->
		<div class="filter-group">
			<span class="filter-label">RATE</span>
			<div class="pill-group">
				<button
					class="filter-pill {rateType === '22h' ? 'filter-pill-active' : ''}"
					onclick={() => (rateType = '22h')}
				>
					22H
				</button>
				<button
					class="filter-pill {rateType === '12h' ? 'filter-pill-active' : ''}"
					onclick={() => (rateType = '12h')}
				>
					12H
				</button>
			</div>
		</div>

		{#if isFiltered}
			<button class="filter-reset-btn" onclick={resetPriceFilter} title="Reset all filters">
				CLEAR
			</button>
		{/if}
	</div>

	<!-- Table -->
	<div class="table-wrap">
		<table class="data-table">
			<thead>
				<tr>
					<th class="table-th">Resort Name</th>
					<th class="table-th">Contact / Facebook</th>
					<th class="table-th">Rate 12h</th>
					<th class="table-th">Rate 22h</th>
					<th class="table-th">Pax</th>
					<th class="table-th">Add'l Pax</th>
					<th class="table-th">Rooms</th>
					<th class="table-th">Pool</th>
					<th class="table-th">Inclusions</th>
					<th class="table-th">Amenities</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as resort}
					<tr
						class="table-row"
						onclick={() => goto(`/${resort.slug}`)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && goto(`/${resort.slug}`)}
					>
						<td class="table-td font-semibold">
							{resort.name}
							<span class="resort-location">{resort.location}</span>
						</td>
						<td class="table-td">{resort.contact}</td>
						<td class="table-td">{resort.rate12}</td>
						<td class="table-td">{resort.rate22}</td>
						<td class="table-td">{resort.pax}</td>
						<td class="table-td">{resort.addPax}</td>
						<td class="table-td">{resort.rooms}</td>
						<td class="table-td">{resort.pool}</td>
						<td class="table-td">{@html pillList(resort.inclusions)}</td>
						<td class="table-td">{@html pillList(resort.amenities)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	.index-view {
		position: fixed;
		inset: 0;
		z-index: 20;
		background: var(--color-bg);
		padding-top: 96px;
		padding-bottom: 96px;
		padding-left: 28px;
		padding-right: 28px;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.controls-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
		gap: 12px;
		flex-wrap: wrap;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		max-width: 420px;
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		padding: 10px 14px;
		font-size: 11px;
		letter-spacing: 0.05em;
		color: var(--color-ink);
		outline: none;
		font-family: var(--font-body);
	}

	.search-input::placeholder {
		color: var(--color-muted);
	}

	.resort-count {
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--color-muted);
		font-family: var(--font-body);
		white-space: nowrap;
	}

	/* Price filter row */
	.filter-row {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-bottom: 16px;
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.filter-label {
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: var(--color-muted);
		white-space: nowrap;
	}

	.compact-input-wrap {
		display: flex;
		align-items: center;
		background: rgba(255, 255, 255, 0.85);
		border: 1px solid var(--color-line);
		padding: 4px 7px;
		width: 72px;
		transition: border-color 0.15s ease;
	}

	.compact-num-wrap {
		width: 50px;
	}

	.compact-input-wrap:focus-within {
		border-color: var(--color-ink);
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

	.filter-reset-btn {
		appearance: none;
		border: 1px solid var(--color-line);
		background: transparent;
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--color-muted);
		padding: 4px 8px;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.filter-reset-btn:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
		background: rgba(19, 19, 19, 0.05);
	}

	.filter-divider {
		width: 1px;
		height: 22px;
		background: var(--color-line);
		flex-shrink: 0;
	}

	.pill-group {
		display: flex;
		gap: 4px;
	}

	.filter-pill {
		appearance: none;
		border: 1px solid var(--color-line);
		background: transparent;
		padding: 5px 11px;
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.04em;
		font-family: var(--font-body);
		color: var(--color-muted);
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.filter-pill:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
	}

	.filter-pill-active {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: #ffffff;
	}

	.table-wrap {
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(12px);
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		min-width: 1180px;
		font-size: 12px;
		font-family: var(--font-body);
	}

	.table-th {
		text-align: left;
		font-size: 10px;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
		font-weight: 600;
		padding: 12px 14px;
		border-bottom: 1px solid var(--color-line);
		position: sticky;
		top: 0;
		background: var(--color-glass-strong);
		white-space: nowrap;
	}

	.table-td {
		padding: 14px;
		border-bottom: 1px solid var(--color-line);
		vertical-align: top;
		line-height: 1.45;
	}

	.table-row {
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.table-row:hover {
		background: rgba(0, 0, 0, 0.03);
	}

	.resort-location {
		display: block;
		font-weight: 400;
		color: var(--color-muted);
		font-size: 11px;
		margin-top: 2px;
	}

	@media (max-width: 768px) {
		.index-view {
			padding-top: 80px;
			padding-bottom: 80px;
			padding-left: 16px;
			padding-right: 16px;
		}

		.search-input {
			min-width: 0;
			width: 100%;
			max-width: 100%;
		}

		.filter-row {
			gap: 12px;
		}
	}
</style>

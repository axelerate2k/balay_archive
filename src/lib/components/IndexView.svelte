<script lang="ts">
	import type { Resort } from '$lib/types/resort';
	import { goto } from '$app/navigation';

	interface Props {
		resorts: Resort[];
	}

	let { resorts }: Props = $props();
	let searchQuery = $state('');

	const filtered = $derived(
		resorts.filter(
			(r) =>
				r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				r.location.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

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
		margin-bottom: 16px;
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
	}
</style>

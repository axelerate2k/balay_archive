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

<section class="fixed inset-0 z-20 bg-bg pt-24 pb-24 px-7 overflow-y-auto">
	<!-- Controls -->
	<div class="flex justify-between items-center mb-4 gap-3 flex-wrap">
		<input
			type="text"
			placeholder="SEARCH RESORT NAME OR LOCATION..."
			bind:value={searchQuery}
			class="flex-1 min-w-[220px] max-w-[420px] border border-ink/12 bg-glass-strong px-3.5 py-2.5 text-xs tracking-wide text-ink outline-none font-body placeholder:text-muted"
		/>
		<div class="text-[11px] tracking-widest text-muted font-body">
			{filtered.length} RESORT{filtered.length === 1 ? '' : 'S'}
		</div>
	</div>

	<!-- Table -->
	<div class="border border-ink/12 bg-glass-strong backdrop-blur-md overflow-x-auto">
		<table class="w-full border-collapse min-w-[1180px] text-xs font-body">
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
						class="cursor-pointer transition-colors duration-200 hover:bg-black/[.03]"
						onclick={() => goto(`/${resort.slug}`)}
						role="button"
						tabindex="0"
						onkeydown={(e) => e.key === 'Enter' && goto(`/${resort.slug}`)}
					>
						<td class="table-td font-semibold">
							{resort.name}
							<span class="block font-normal text-muted text-[11px] mt-0.5">{resort.location}</span>
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
	}

	.table-td {
		padding: 14px;
		border-bottom: 1px solid var(--color-line);
		vertical-align: top;
		line-height: 1.45;
	}
</style>

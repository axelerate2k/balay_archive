<script lang="ts">
	import { selectedResort } from '$lib/stores/app';
	import { getPhotoUrl } from '$lib/data/resorts';
	import type { Resort } from '$lib/types/resort';

	let resort: Resort | null = $state(null);
	let visible = $state(false);

	selectedResort.subscribe((r) => {
		resort = r;
		visible = r !== null;
	});

	function close() {
		selectedResort.set(null);
	}

	function handleOverlayClick(e: MouseEvent) {
		if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
			close();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	function pillList(items: string[]): string {
		return items
			.map(
				(t) =>
					`<span class="inline-block text-[10px] tracking-wide border border-ink/12 px-1.5 py-0.5 mr-1 mt-0.5 rounded-sm">${t}</span>`
			)
			.join('');
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible && resort}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="modal-overlay fixed inset-0 z-60 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6"
		onclick={handleOverlayClick}
	>
		<div class="bg-white border border-ink/12 shadow-2xl w-full max-w-[760px] max-h-[88vh] overflow-y-auto">
			<!-- Photo -->
			<div class="relative">
				<img
					src={getPhotoUrl(resort.image_seed, 900, 500)}
					alt={resort.name}
					class="w-full h-64 object-cover block"
				/>
				<button
					class="absolute top-3.5 right-3.5 border border-ink/12 bg-white/90 w-7 h-7 flex items-center justify-center cursor-pointer text-sm hover:bg-white transition-colors"
					onclick={close}
					aria-label="Close modal"
				>
					✕
				</button>
			</div>

			<!-- Body -->
			<div class="px-7 pt-6 pb-7">
				<h2 class="font-display text-xl font-semibold tracking-tight mb-1">{resort.name}</h2>
				<p class="text-xs text-muted mb-5 font-body">
					{resort.location} · {resort.contact}
				</p>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-5">
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Rate (12h)</span>
						<div class="text-sm font-body">{resort.rate12}</div>
					</div>
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Rate (22h)</span>
						<div class="text-sm font-body">{resort.rate22}</div>
					</div>
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Pax</span>
						<div class="text-sm font-body">{resort.pax}</div>
					</div>
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Additional Pax Rate</span>
						<div class="text-sm font-body">{resort.addPax}</div>
					</div>
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Rooms</span>
						<div class="text-sm font-body">{resort.rooms}</div>
					</div>
					<div>
						<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Pool</span>
						<div class="text-sm font-body">{resort.pool}</div>
					</div>
				</div>

				<div class="mb-4">
					<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Inclusions</span>
					<div>{@html pillList(resort.inclusions)}</div>
				</div>

				<div>
					<span class="block text-[10px] tracking-widest uppercase text-muted font-semibold mb-1 font-body">Amenities</span>
					<div>{@html pillList(resort.amenities)}</div>
				</div>
			</div>
		</div>
	</div>
{/if}
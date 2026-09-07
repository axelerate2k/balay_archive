<script lang="ts">
	import { hoveredResort } from '$lib/stores/app';
	import type { Resort } from '$lib/types/resort';

	let resort: Resort | null = $state(null);
	let visible = $state(false);

	hoveredResort.subscribe((r) => {
		resort = r;
		visible = r !== null;
	});
</script>

<div
	class="fixed top-24 left-6 z-30 max-w-xs transition-all duration-400 ease-out pointer-events-none
		{visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}"
>
	{#if resort}
		<div class="space-y-3">
			<h2 class="font-display text-2xl font-semibold tracking-tight text-ink leading-tight">
				{resort.name}
			</h2>

			<div class="flex flex-col gap-1.5">
				<div class="flex items-baseline gap-3">
					<span class="font-body text-[10px] font-medium tracking-widest text-muted uppercase">12H</span>
					<span class="font-body text-sm font-medium text-ink">{resort.rate12}</span>
				</div>
				<div class="flex items-baseline gap-3">
					<span class="font-body text-[10px] font-medium tracking-widest text-muted uppercase">22H</span>
					<span class="font-body text-sm font-medium text-ink">{resort.rate22}</span>
				</div>
			</div>

			<div class="flex items-baseline gap-3">
				<span class="font-body text-[10px] font-medium tracking-widest text-muted uppercase">PAX</span>
				<span class="font-body text-sm font-medium text-ink">{resort.pax}</span>
			</div>
		</div>
	{/if}
</div>

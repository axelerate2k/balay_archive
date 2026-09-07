<script lang="ts">
	import { activeView } from '$lib/stores/app';

	const modes: { label: string; value: 'overview' | 'index' }[] = [
		{ label: 'OVERVIEW', value: 'overview' },
		{ label: 'INDEX', value: 'index' }
	];
</script>

<footer
	class="fixed bottom-5 right-5 z-40 flex border border-ink/12 bg-glass-strong backdrop-blur-md"
>
	{#each modes as mode, i}
		<button
			class="appearance-none border-none bg-transparent px-4 py-3 text-[11px] font-semibold tracking-widest cursor-pointer transition-colors duration-200
				{i > 0 ? 'border-l border-ink/12' : ''}
				{$activeView === mode.value ? 'text-ink' : 'text-muted hover:text-ink'}"
			onclick={() => activeView.set(mode.value)}
		>
			{mode.label}
		</button>
	{/each}
</footer>

<script lang="ts">
	import { activeView } from '$lib/stores/app';
	import TopNav from '$lib/components/TopNav.svelte';
	import CornerNav from '$lib/components/CornerNav.svelte';
	import CardCascade from '$lib/components/CardCascade.svelte';
	import InfoPanel from '$lib/components/InfoPanel.svelte';
	import IndexView from '$lib/components/IndexView.svelte';
	import MapView from '$lib/components/MapView.svelte';

	let { data } = $props();
</script>

<TopNav />

{#if data.resorts.length === 0}
	<div style="position:fixed;inset:0;display:grid;place-items:center;font-family:var(--font-body);color:var(--color-muted);font-size:13px;letter-spacing:0.04em;text-align:center;line-height:2;">
		<div>
			<p style="margin:0 0 4px;font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--color-ink);">Archive is Empty</p>
			<p style="margin:0;">No resorts have been added yet. Visit the Admin Panel to add resorts.</p>
		</div>
	</div>
{:else if $activeView === 'overview'}
	<CardCascade resorts={data.resorts} />
	<InfoPanel />
{:else if $activeView === 'index'}
	<IndexView resorts={data.resorts} />
{:else if $activeView === 'map'}
	<MapView resorts={data.resorts} />
{/if}

<CornerNav />


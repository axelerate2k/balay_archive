<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();
	let deleting = $state<string | null>(null);
</script>

<svelte:head>
	<title>Admin — Resorts — HAVEN Archive</title>
</svelte:head>

<div class="admin-page">
	<div class="page-header">
		<h1>Resorts</h1>
		<a href="/admin/resorts/new" class="btn-primary">+ Add Resort</a>
	</div>

	{#if data.resorts.length === 0}
		<div class="empty-state">
			<p>No resorts in archive.</p>
		</div>
	{:else}
		<div class="resort-table-wrap">
			<table class="resort-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Location</th>
						<th>Slug</th>
						<th>Created</th>
						<th class="actions-col">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.resorts as resort}
						<tr>
							<td class="name-cell">{resort.name}</td>
							<td>{resort.location}</td>
							<td class="slug-cell">{resort.slug}</td>
							<td class="date-cell">{new Date(resort.created_at).toLocaleDateString()}</td>
							<td class="actions-cell">
								<a href="/admin/resorts/{resort.id}/edit" class="btn-sm">Edit</a>
								{#if deleting === resort.id}
									<form method="POST" action="?/delete" use:enhance={() => {
										return async ({ update }) => {
											deleting = null;
											await update();
										};
									}}>
										<input type="hidden" name="id" value={resort.id} />
										<button type="submit" class="btn-sm btn-danger">Confirm</button>
										<button type="button" class="btn-sm" onclick={() => deleting = null}>Cancel</button>
									</form>
								{:else}
									<button class="btn-sm btn-danger-outline" onclick={() => deleting = resort.id}>Delete</button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.admin-page {
		color: var(--color-ink);
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 28px;
	}

	.page-header h1 {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0;
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 20px;
		background: var(--color-ink);
		color: white;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.03em;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.btn-primary:hover {
		opacity: 0.85;
	}

	.empty-state {
		text-align: center;
		padding: 60px 20px;
		color: var(--color-muted);
		font-size: 14px;
	}

	.empty-state p {
		margin: 0;
	}

	.resort-table-wrap {
		border: 1px solid var(--color-line);
		background: white;
		overflow-x: auto;
	}

	.resort-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 13px;
	}

	.resort-table th {
		text-align: left;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-line);
		background: var(--color-bg);
	}

	.resort-table td {
		padding: 14px 16px;
		border-bottom: 1px solid var(--color-line);
		vertical-align: middle;
	}

	.resort-table tr:last-child td {
		border-bottom: none;
	}

	.name-cell {
		font-weight: 600;
	}

	.slug-cell {
		font-family: monospace;
		font-size: 11px;
		color: var(--color-muted);
	}

	.date-cell {
		font-size: 12px;
		color: var(--color-muted);
	}

	.actions-col {
		text-align: right;
	}

	.actions-cell {
		text-align: right;
		white-space: nowrap;
	}

	.actions-cell form {
		display: inline-flex;
		gap: 4px;
		align-items: center;
	}

	.btn-sm {
		display: inline-block;
		padding: 6px 12px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.02em;
		border: 1px solid var(--color-line);
		background: white;
		color: var(--color-ink);
		cursor: pointer;
		text-decoration: none;
		transition: all 0.15s ease;
	}

	.btn-sm:hover {
		background: var(--color-bg);
	}

	.btn-danger {
		background: #d32f2f;
		color: white;
		border-color: #d32f2f;
	}

	.btn-danger:hover {
		background: #b71c1c;
	}

	.btn-danger-outline {
		color: #d32f2f;
		border-color: #d32f2f40;
	}

	.btn-danger-outline:hover {
		background: #fbe9e7;
	}
</style>

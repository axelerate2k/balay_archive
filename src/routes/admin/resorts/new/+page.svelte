<script lang="ts">
	import { enhance } from "$app/forms";
	import PhotoUploadDropzone from "$lib/components/PhotoUploadDropzone.svelte";

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>New Resort — Admin — HAVEN Archive</title>
</svelte:head>

<div class="form-page">
	<h1>New Resort</h1>

	{#if form?.error}
		<div class="error-banner">{form.error}</div>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				submitting = false;
				await update();
			};
		}}
	>
		<div class="form-grid">
			<div class="field full">
				<label for="name">Resort Name *</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					placeholder="e.g. Villa Judela"
				/>
			</div>

			<div class="field">
				<label for="location">Location *</label>
				<input
					id="location"
					name="location"
					type="text"
					required
					placeholder="e.g. Lakewood, Los Baños"
				/>
			</div>

			<div class="field">
				<label for="contact">Contact</label>
				<input
					id="contact"
					name="contact"
					type="text"
					placeholder="e.g. 0917-123-4567 | fb.com/villajudela"
				/>
			</div>

			<div class="field">
				<label for="rate_12h">Rate (12h)</label>
				<input
					id="rate_12h"
					name="rate_12h"
					type="text"
					placeholder="e.g. ₱6,500"
				/>
			</div>

			<div class="field">
				<label for="rate_22h">Rate (22h)</label>
				<input
					id="rate_22h"
					name="rate_22h"
					type="text"
					placeholder="e.g. ₱9,800"
				/>
			</div>

			<div class="field">
				<label for="pax">Pax</label>
				<input
					id="pax"
					name="pax"
					type="text"
					placeholder="e.g. 25 pax"
				/>
			</div>

			<div class="field">
				<label for="add_pax_rate">Additional Pax Rate</label>
				<input
					id="add_pax_rate"
					name="add_pax_rate"
					type="text"
					placeholder="₱150 / head"
				/>
			</div>

			<div class="field">
				<label for="rooms">Number of Rooms</label>
				<input
					id="rooms"
					name="rooms"
					type="text"
					placeholder="e.g. 5"
				/>
			</div>

			<div class="field">
				<label for="pool">Pool</label>
				<input
					id="pool"
					name="pool"
					type="text"
					placeholder="e.g. 5.5 ft depth, dimensions: 16 x 32 ft"
				/>
			</div>

			<div class="field full">
				<label for="inclusions">Inclusions</label>
				<input
					id="inclusions"
					name="inclusions"
					type="text"
					placeholder="Parking , Water Dispenser, Function Hall etc."
				/>
				<span class="hint">Comma-separated list</span>
			</div>

			<div class="field full">
				<label for="amenities">Amenities</label>
				<input
					id="amenities"
					name="amenities"
					type="text"
					placeholder="Videoke, Billiards, Basketball hoop"
				/>
				<span class="hint">Comma-separated list</span>
			</div>

			<div class="field full">
				<label for="photos">Gallery Photos</label>
				<PhotoUploadDropzone id="photos" name="photos" multiple={true} />
			</div>
		</div>

		<div class="form-actions">
			<a href="/admin" class="btn-cancel">Cancel</a>
			<button type="submit" class="btn-submit" disabled={submitting}>
				{submitting ? "Creating…" : "Create Resort"}
			</button>
		</div>
	</form>
</div>

<style>
	.form-page {
		color: var(--color-ink);
	}

	h1 {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 600;
		margin: 0 0 28px;
	}

	.error-banner {
		background: #fbe9e7;
		color: #c62828;
		padding: 12px 16px;
		font-size: 13px;
		margin-bottom: 20px;
		border: 1px solid #ffcdd2;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field.full {
		grid-column: 1 / -1;
	}

	label {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 1px;
		text-transform: uppercase;
		color: var(--color-muted);
	}

	input[type="text"] {
		padding: 10px 14px;
		border: 1px solid var(--color-line);
		background: white;
		font-family: var(--font-body);
		font-size: 13px;
		color: var(--color-ink);
		outline: none;
		transition: border-color 0.15s ease;
	}

	input[type="text"]:focus {
		border-color: var(--color-ink);
	}

	.hint {
		font-size: 11px;
		color: var(--color-muted);
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid var(--color-line);
	}

	.btn-cancel {
		padding: 10px 20px;
		border: 1px solid var(--color-line);
		background: white;
		font-size: 12px;
		font-weight: 500;
		color: var(--color-muted);
		text-decoration: none;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.btn-cancel:hover {
		color: var(--color-ink);
	}

	.btn-submit {
		padding: 10px 24px;
		background: var(--color-ink);
		color: white;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.03em;
		border: none;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}

	.btn-submit:hover {
		opacity: 0.85;
	}

	.btn-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

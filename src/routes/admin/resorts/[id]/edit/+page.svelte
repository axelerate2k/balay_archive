<script lang="ts">
	import { enhance } from '$app/forms';
	import PhotoUploadDropzone from '$lib/components/PhotoUploadDropzone.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
	let removedPhotos = $state<string[]>([]);

	// Ordered list of gallery items (path + signed URL)
	let galleryOrder = $state<{ path: string; url: string }[]>(data.galleryUrls ?? []);

	// Drag state
	let dragIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	function toggleRemovePhoto(path: string) {
		if (removedPhotos.includes(path)) {
			removedPhotos = removedPhotos.filter((p) => p !== path);
		} else {
			removedPhotos = [...removedPhotos, path];
		}
	}

	function handleDragStart(i: number) {
		dragIndex = i;
	}

	function handleDragOver(e: DragEvent, i: number) {
		e.preventDefault();
		dragOverIndex = i;
	}

	function handleDrop(i: number) {
		if (dragIndex === null || dragIndex === i) {
			dragIndex = null;
			dragOverIndex = null;
			return;
		}
		const updated = [...galleryOrder];
		const [moved] = updated.splice(dragIndex, 1);
		updated.splice(i, 0, moved);
		galleryOrder = updated;
		dragIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		dragIndex = null;
		dragOverIndex = null;
	}

	const r = data.resort;
</script>

<svelte:head>
	<title>Edit {r.name} — Admin — HAVEN Archive</title>
</svelte:head>

<div class="form-page">
	<h1>Edit Resort</h1>

	{#if form?.error}
		<div class="error-banner">{form.error}</div>
	{/if}

	<form method="POST" action="?/update" enctype="multipart/form-data" use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			await update();
		};
	}}>
		<div class="form-grid">
			<div class="field full">
				<label for="name">Resort Name *</label>
				<input id="name" name="name" type="text" required value={r.name} />
			</div>

			<div class="field">
				<label for="location">Location *</label>
				<input id="location" name="location" type="text" required value={r.location} />
			</div>

			<div class="field">
				<label for="contact">Contact</label>
				<input id="contact" name="contact" type="text" value={r.contact ?? ''} />
			</div>

			<div class="field">
				<label for="rate_12h">Rate (12h)</label>
				<input id="rate_12h" name="rate_12h" type="text" value={r.rate_12h ?? ''} />
			</div>

			<div class="field">
				<label for="rate_22h">Rate (22h)</label>
				<input id="rate_22h" name="rate_22h" type="text" value={r.rate_22h ?? ''} />
			</div>

			<div class="field">
				<label for="pax">Pax</label>
				<input id="pax" name="pax" type="text" value={r.pax ?? ''} />
			</div>

			<div class="field">
				<label for="add_pax_rate">Additional Pax Rate</label>
				<input id="add_pax_rate" name="add_pax_rate" type="text" value={r.add_pax_rate ?? ''} />
			</div>

			<div class="field">
				<label for="rooms">Rooms</label>
				<input id="rooms" name="rooms" type="text" value={r.rooms ?? ''} />
			</div>

			<div class="field">
				<label for="pool">Pool</label>
				<input id="pool" name="pool" type="text" value={r.pool ?? ''} />
			</div>

			<div class="field full">
				<label for="inclusions">Inclusions</label>
				<input id="inclusions" name="inclusions" type="text"
					value={(r.inclusions ?? []).join(', ')} />
				<span class="hint">Comma-separated list</span>
			</div>

			<div class="field full">
				<label for="amenities">Amenities</label>
				<input id="amenities" name="amenities" type="text"
					value={(r.amenities ?? []).join(', ')} />
				<span class="hint">Comma-separated list</span>
			</div>

			<!-- Existing gallery with drag-to-reorder -->
			{#if galleryOrder.length > 0}
				<div class="field full">
					<div class="gallery-label-row">
						<label>Current Photos</label>
						<span class="gallery-hint">⠿ Drag to reorder · First photo is the feature image on the archive card</span>
					</div>
					<div class="gallery-grid">
						{#each galleryOrder as photo, i}
							<!-- Hidden input to track gallery order -->
							{#if !removedPhotos.includes(photo.path)}
								<input type="hidden" name="gallery_order" value={photo.path} />
							{/if}
							<div
								class="gallery-item"
								class:marked={removedPhotos.includes(photo.path)}
								class:dragging={dragIndex === i}
								class:drag-over={dragOverIndex === i && dragIndex !== i}
								draggable="true"
								ondragstart={() => handleDragStart(i)}
								ondragover={(e) => handleDragOver(e, i)}
								ondrop={() => handleDrop(i)}
								ondragend={handleDragEnd}
								role="button"
								tabindex="0"
							>
								{#if i === 0}
									<div class="feature-badge">★ Feature</div>
								{/if}
								<img src={photo.url} alt="Gallery photo {i + 1}" />
								<div class="drag-handle">⠿</div>
								<button type="button" class="gallery-remove"
									onclick={() => toggleRemovePhoto(photo.path)}>
									{removedPhotos.includes(photo.path) ? 'Undo' : '✕'}
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Hidden inputs for removed photos -->
			{#each removedPhotos as path}
				<input type="hidden" name="remove_photo" value={path} />
			{/each}

			<div class="field full">
				<label for="photos">Add Photos</label>
				<PhotoUploadDropzone id="photos" name="photos" multiple={true} />
			</div>
		</div>

		<div class="form-actions">
			<a href="/admin" class="btn-cancel">Cancel</a>
			<button type="submit" class="btn-submit" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save Changes'}
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

	input[type='text'] {
		padding: 10px 14px;
		border: 1px solid var(--color-line);
		background: white;
		font-family: var(--font-body);
		font-size: 13px;
		color: var(--color-ink);
		outline: none;
		transition: border-color 0.15s ease;
	}

	input[type='text']:focus {
		border-color: var(--color-ink);
	}

	.hint {
		font-size: 11px;
		color: var(--color-muted);
	}

	.gallery-label-row {
		display: flex;
		align-items: baseline;
		gap: 12px;
		margin-bottom: 2px;
	}

	.gallery-hint {
		font-size: 10px;
		color: var(--color-muted);
		font-weight: 400;
		letter-spacing: 0.3px;
		text-transform: none;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
	}

	.gallery-item {
		position: relative;
		aspect-ratio: 7 / 10;
		overflow: hidden;
		border: 1px solid var(--color-line);
		cursor: grab;
		transition: opacity 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
	}

	.gallery-item:active {
		cursor: grabbing;
	}

	.gallery-item.dragging {
		opacity: 0.4;
		transform: scale(0.97);
	}

	.gallery-item.drag-over {
		box-shadow: inset 0 0 0 2px var(--color-ink);
	}

	.gallery-item.marked {
		opacity: 0.35;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.gallery-remove {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 22px;
		height: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		font-size: 10px;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.gallery-remove:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.feature-badge {
		position: absolute;
		bottom: 6px;
		left: 6px;
		background: var(--color-ink);
		color: white;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 3px 7px;
		text-transform: uppercase;
		z-index: 2;
		pointer-events: none;
	}

	.drag-handle {
		position: absolute;
		bottom: 6px;
		right: 6px;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.85);
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
		pointer-events: none;
		user-select: none;
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

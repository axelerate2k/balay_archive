<script lang="ts">
	let { id = 'photos', name = 'photos', multiple = true } = $props();

	let fileInputRef = $state<HTMLInputElement | null>(null);
	let selectedFiles = $state<File[]>([]);
	let previews = $state<{ file: File; url: string }[]>([]);
	let isDragging = $state(false);

	function updateFiles(newFiles: File[]) {
		selectedFiles = newFiles;
		// Revoke previous URLs to avoid memory leak
		previews.forEach((p) => URL.revokeObjectURL(p.url));
		previews = newFiles.map((file) => ({
			file,
			url: URL.createObjectURL(file)
		}));

		// Sync with input element DataTransfer
		if (fileInputRef) {
			const dt = new DataTransfer();
			newFiles.forEach((f) => dt.items.add(f));
			fileInputRef.files = dt.files;
		}
	}

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			const filesArr = Array.from(input.files);
			updateFiles([...selectedFiles, ...filesArr]);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files) {
			const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
			if (dropped.length > 0) {
				updateFiles([...selectedFiles, ...dropped]);
			}
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function removeFile(index: number) {
		const updated = selectedFiles.filter((_, i) => i !== index);
		updateFiles(updated);
	}

	function triggerBrowse() {
		fileInputRef?.click();
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<div class="upload-container">
	<input
		type="file"
		{id}
		{name}
		accept="image/*"
		{multiple}
		bind:this={fileInputRef}
		onchange={handleFileChange}
		class="sr-only"
	/>

	<div
		class="dropzone"
		class:dragging={isDragging}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onclick={triggerBrowse}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Enter' && triggerBrowse()}
	>
		<div class="dropzone-icon">
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
				<polyline points="17 8 12 3 7 8"/>
				<line x1="12" y1="3" x2="12" y2="15"/>
			</svg>
		</div>
		<div class="dropzone-text">
			<p class="main-prompt"><span class="highlight">Click to upload</span> or drag and drop photos</p>
			<p class="sub-prompt">High-resolution PNG, JPG, or WEBP images</p>
		</div>
	</div>

	{#if previews.length > 0}
		<div class="previews-header">
			<span>Selected Photos ({previews.length})</span>
		</div>
		<div class="previews-grid">
			{#each previews as item, index}
				<div class="preview-card">
					<img src={item.url} alt={item.file.name} />
					<div class="preview-info">
						<span class="file-name" title={item.file.name}>{item.file.name}</span>
						<span class="file-size">{formatSize(item.file.size)}</span>
					</div>
					<button
						type="button"
						class="remove-btn"
						onclick={(e) => {
							e.stopPropagation();
							removeFile(index);
						}}
						title="Remove photo"
					>
						✕
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.upload-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.dropzone {
		border: 2px dashed var(--color-line);
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		padding: 32px 20px;
		border-radius: 4px;
		text-align: center;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		transition: all 0.2s ease;
	}

	.dropzone:hover,
	.dropzone.dragging {
		border-color: var(--color-ink);
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
	}

	.dropzone-icon {
		color: var(--color-muted);
		transition: color 0.2s ease;
	}

	.dropzone:hover .dropzone-icon {
		color: var(--color-ink);
	}

	.dropzone-text {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.main-prompt {
		margin: 0;
		font-size: 13px;
		font-family: var(--font-body);
		color: var(--color-ink);
	}

	.highlight {
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.sub-prompt {
		margin: 0;
		font-size: 11px;
		color: var(--color-muted);
	}

	.previews-header {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		color: var(--color-muted);
		margin-top: 4px;
	}

	.previews-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 12px;
	}

	.preview-card {
		position: relative;
		border: 1px solid var(--color-line);
		background: white;
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.preview-card img {
		width: 100%;
		height: 100px;
		object-fit: cover;
		display: block;
	}

	.preview-info {
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: white;
	}

	.file-name {
		font-size: 11px;
		font-weight: 500;
		color: var(--color-ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-size {
		font-size: 10px;
		color: var(--color-muted);
	}

	.remove-btn {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.7);
		color: white;
		border: none;
		font-size: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.remove-btn:hover {
		background: rgba(198, 40, 40, 0.9);
	}
</style>

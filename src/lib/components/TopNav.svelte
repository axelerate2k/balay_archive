<header class="top-nav">
	<div class="top-nav-brand">
		balay <sup>®</sup> archive
	</div>
</header>

<style>
	.top-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		display: flex;
		align-items: center;
		padding: 16px 20px;
	}

	.top-nav-brand {
		border: 1px solid var(--color-line);
		background: var(--color-glass-strong);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 10px 16px;
		font-family: var(--font-display);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.1em;
	}

	.top-nav-brand sup {
		font-size: 8px;
	}

	@media (max-width: 768px) {
		.top-nav {
			padding: 12px 16px;
		}

		.top-nav-brand {
			padding: 8px 12px;
			font-size: 11px;
		}
	}
</style>

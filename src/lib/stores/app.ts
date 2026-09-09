import { writable } from 'svelte/store';
import type { Resort } from '$lib/types/resort';

/** Current view: 'overview' (cascade), 'index' (table), or 'map' (interactive map) */
export const activeView = writable<'overview' | 'index' | 'map'>('overview');

/** Currently hovered resort (drives the floating info panel) */
export const hoveredResort = writable<Resort | null>(null);

/** Currently selected resort (drives the detail view) */
export const selectedResort = writable<Resort | null>(null);

/** Captured origin rect + transform for the card→detail FLIP transition */
export const transitionOrigin = writable<{
	rect: DOMRect;
	transform: string;
} | null>(null);

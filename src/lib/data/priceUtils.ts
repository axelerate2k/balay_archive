import type { Resort } from '$lib/types/resort';

/**
 * Extracts the primary (lowest) numeric price from a free-text rate string.
 * Example: "₱6,500" -> 6500, "₱9,800 - ₱12,000" -> 9800, "7000/night" -> 7000
 */
export function parsePrice(rateStr?: string | null): number | null {
	if (!rateStr) return null;
	// Remove commas and spaces between digits
	const cleaned = rateStr.replace(/,/g, '');
	// Find the first integer or decimal number
	const match = cleaned.match(/\d+(?:\.\d+)?/);
	if (!match) return null;
	const val = parseFloat(match[0]);
	return isNaN(val) ? null : Math.round(val);
}

/**
 * Formats a numeric price into Philippine Peso format (e.g. 6500 -> "₱6,500")
 */
export function formatPrice(price: number | null | undefined): string {
	if (price == null || isNaN(price)) return '';
	return `₱${price.toLocaleString('en-US')}`;
}

/**
 * Get numeric price from a resort for either '12h' or '22h' rate
 */
export function getResortPrice(resort: Resort, rateType: '12h' | '22h' = '22h'): number | null {
	if (rateType === '12h') {
		return parsePrice(resort.rate12) ?? parsePrice(resort.rate22);
	}
	return parsePrice(resort.rate22) ?? parsePrice(resort.rate12);
}

/**
 * Check if a resort satisfies a max price threshold
 */
export function matchesPriceFilter(
	resort: Resort,
	maxPrice: number | null,
	rateType: '12h' | '22h' = '22h'
): boolean {
	if (maxPrice == null || maxPrice <= 0) return true;
	const price = getResortPrice(resort, rateType);
	if (price == null) return true; // If unpriced, keep visible
	return price <= maxPrice;
}

/**
 * Filter an array of resorts by a min/max price range and rate type.
 * Resorts with no parseable price are always included.
 */
export function filterResortsByPrice(
	resorts: Resort[],
	minPrice: number | null,
	maxPrice: number | null,
	rateType: '12h' | '22h' = '22h'
): Resort[] {
	return resorts.filter((resort) => {
		const price = getResortPrice(resort, rateType);
		if (price == null) return true; // unpriced always shown
		if (minPrice != null && minPrice > 0 && price < minPrice) return false;
		if (maxPrice != null && maxPrice > 0 && price > maxPrice) return false;
		return true;
	});
}

/**
 * Extracts numeric pax capacity from free-text string (e.g. "25 pax" -> 25)
 */
export function parsePax(paxStr?: string | null): number | null {
	if (!paxStr) return null;
	const match = paxStr.replace(/,/g, '').match(/\d+/);
	return match ? parseInt(match[0], 10) : null;
}

/**
 * Extracts numeric room count from free-text string (e.g. "4 rooms" -> 4)
 */
export function parseRooms(roomsStr?: string | null): number | null {
	if (!roomsStr) return null;
	const match = roomsStr.replace(/,/g, '').match(/\d+/);
	return match ? parseInt(match[0], 10) : null;
}

export interface FilterOptions {
	minPrice?: number | null;
	maxPrice?: number | null;
	rateType?: '12h' | '22h';
	minPax?: number | null;
	minRooms?: number | null;
}

/**
 * Filter an array of resorts by price range, min pax, min rooms, and rate type.
 */
export function filterResorts(resorts: Resort[], options: FilterOptions): Resort[] {
	const { minPrice, maxPrice, rateType = '22h', minPax, minRooms } = options;
	return resorts.filter((resort) => {
		// Price filter
		const price = getResortPrice(resort, rateType);
		if (price != null) {
			if (minPrice != null && minPrice > 0 && price < minPrice) return false;
			if (maxPrice != null && maxPrice > 0 && price > maxPrice) return false;
		}

		// Pax filter (capacity at least minPax)
		if (minPax != null && minPax > 0) {
			const pax = parsePax(resort.pax);
			if (pax != null && pax < minPax) return false;
		}

		// Rooms filter (rooms count at least minRooms)
		if (minRooms != null && minRooms > 0) {
			const rooms = parseRooms(resort.rooms);
			if (rooms != null && rooms < minRooms) return false;
		}

		return true;
	});
}

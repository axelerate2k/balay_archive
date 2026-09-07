import type { Resort } from '$lib/types/resort';

/**
 * Mock resort data.
 * When Supabase is connected, replace this with a query in +page.server.ts
 * and pass data via the load function — zero component changes needed.
 */
export const resorts: Resort[] = [
	{
		id: 'villa-marina',
		slug: 'villa-marina',
		name: 'Villa Marina Private Resort',
		location: 'Laguna',
		contact: '0917 000 1111 · fb.com/villamarinaresort',
		rate12: '₱6,500',
		rate22: '₱9,800',
		pax: '25 pax',
		addPax: '₱150 / head',
		rooms: '4 rooms (2 aircon, 2 fan)',
		pool: 'Adult pool 5ft · Kiddie pool 2ft',
		inclusions: ['Towels', 'Kitchen use', 'Free parking', 'Gazebo'],
		amenities: ['Videoke', 'Bilyar', 'Basketball hoop', 'Native cottages'],
		gallery: [],
		image_seed: 'villa-marina'
	},
	{
		id: 'casa-verde',
		slug: 'casa-verde',
		name: 'Casa Verde Nature Resort',
		location: 'Tagaytay',
		contact: '0918 222 3333 · fb.com/casaverdenature',
		rate12: '₱8,000',
		rate22: '₱12,000',
		pax: '30 pax',
		addPax: '₱180 / head',
		rooms: '5 rooms, all aircon',
		pool: 'Infinity pool 4-6ft',
		inclusions: ['Towels', 'Function hall', 'Sound system', 'Free ice'],
		amenities: ['Function hall', 'Garden nook', 'Firepit area'],
		gallery: [],
		image_seed: 'casa-verde'
	},
	{
		id: 'blue-lagoon',
		slug: 'blue-lagoon',
		name: 'Blue Lagoon Pool Villa',
		location: 'Batangas',
		contact: '0919 444 5555 · fb.com/bluelagoonpoolvilla',
		rate12: '₱7,200',
		rate22: '₱10,500',
		pax: '20 pax',
		addPax: '₱150 / head',
		rooms: '3 rooms, aircon',
		pool: 'Lap pool 4ft constant depth',
		inclusions: ['Towels', 'Kitchen use', 'Cookware', 'Free wifi'],
		amenities: ['Videoke', 'Mini bar', 'Beach volleyball court'],
		gallery: [],
		image_seed: 'blue-lagoon'
	},
	{
		id: 'hidden-grove',
		slug: 'hidden-grove',
		name: 'Hidden Grove Resort',
		location: 'Antipolo',
		contact: '0920 666 7777 · fb.com/hiddengroveresort',
		rate12: '₱5,800',
		rate22: '₱8,900',
		pax: '18 pax',
		addPax: '₱120 / head',
		rooms: '3 rooms (fan)',
		pool: 'Shallow family pool 3ft',
		inclusions: ['Towels', 'Free parking', 'Nipa hut'],
		amenities: ['Bilyar', 'Trampoline', 'Mini zipline'],
		gallery: [],
		image_seed: 'hidden-grove'
	},
	{
		id: 'amihan-beach',
		slug: 'amihan-beach',
		name: 'Amihan Beach House',
		location: 'Zambales',
		contact: '0921 888 9999 · fb.com/amihanbeachhouse',
		rate12: '₱11,000',
		rate22: '₱16,500',
		pax: '35 pax',
		addPax: '₱200 / head',
		rooms: '6 rooms, aircon',
		pool: 'Beachfront, no pool',
		inclusions: ['Towels', 'Beach access', 'Kitchen use', 'Grill area'],
		amenities: ['Function hall', 'Bonfire pit', 'Kayaks (rental)'],
		gallery: [],
		image_seed: 'amihan-beach'
	},
	{
		id: 'terraza-sol',
		slug: 'terraza-sol',
		name: 'Terraza Del Sol',
		location: 'Laguna',
		contact: '0922 111 2222 · fb.com/terrazadelsol',
		rate12: '₱6,900',
		rate22: '₱10,200',
		pax: '22 pax',
		addPax: '₱150 / head',
		rooms: '4 rooms, mixed aircon/fan',
		pool: 'Adult pool 5ft, slide',
		inclusions: ['Towels', 'Free ice', 'Sound system'],
		amenities: ['Videoke', 'Basketball court', 'Native huts'],
		gallery: [],
		image_seed: 'terraza-sol'
	},
	{
		id: 'coral-cove',
		slug: 'coral-cove',
		name: 'Coral Cove Resort',
		location: 'Batangas',
		contact: '0923 333 4444 · fb.com/coralcoveresort',
		rate12: '₱9,500',
		rate22: '₱14,000',
		pax: '28 pax',
		addPax: '₱180 / head',
		rooms: '5 rooms, aircon',
		pool: 'Saltwater pool 4-5ft',
		inclusions: ['Towels', 'Snorkeling gear', 'Kitchen use'],
		amenities: ['Bilyar', 'Diving deck', 'Beach bonfire spot'],
		gallery: [],
		image_seed: 'coral-cove'
	},
	{
		id: 'palma-vista',
		slug: 'palma-vista',
		name: 'Palma Vista Villas',
		location: 'Cavite',
		contact: '0924 555 6666 · fb.com/palmavistavillas',
		rate12: '₱6,200',
		rate22: '₱9,000',
		pax: '20 pax',
		addPax: '₱140 / head',
		rooms: '3 rooms, aircon',
		pool: 'Kiddie + adult combo, 3-5ft',
		inclusions: ['Towels', 'Free parking', 'Gazebo'],
		amenities: ['Videoke', 'Playground', 'Mini garden'],
		gallery: [],
		image_seed: 'palma-vista'
	},
	{
		id: 'rainmist',
		slug: 'rainmist',
		name: 'Rainmist Garden Resort',
		location: 'Tagaytay',
		contact: '0925 777 8888 · fb.com/rainmistgarden',
		rate12: '₱8,700',
		rate22: '₱13,000',
		pax: '26 pax',
		addPax: '₱170 / head',
		rooms: '4 rooms, aircon',
		pool: 'Heated pool 4ft',
		inclusions: ['Towels', 'Function hall', 'Free wifi', 'Cookware'],
		amenities: ['Function hall', 'Bilyar', 'Garden lounge'],
		gallery: [],
		image_seed: 'rainmist'
	},
	{
		id: 'sundown-point',
		slug: 'sundown-point',
		name: 'Sundown Point Resort',
		location: 'Laguna',
		contact: '0926 999 0000 · fb.com/sundownpoint',
		rate12: '₱7,500',
		rate22: '₱11,000',
		pax: '24 pax',
		addPax: '₱150 / head',
		rooms: '4 rooms, aircon',
		pool: 'Overflow pool 5ft, night lights',
		inclusions: ['Towels', 'Kitchen use', 'Free ice', 'Sound system'],
		amenities: ['Videoke', 'Basketball hoop', 'Firepit'],
		gallery: [],
		image_seed: 'sundown-point'
	}
];

/** Map seed names to specific aspect ratio dimensions for rich card size variation */
const coverDimensions: Record<string, [number, number]> = {
	'villa-marina': [800, 530], // Landscape 3:2
	'casa-verde': [600, 850],   // Portrait 3:4
	'blue-lagoon': [850, 550],  // Landscape
	'hidden-grove': [620, 840], // Portrait
	'amihan-beach': [920, 520], // Wide landscape
	'terraza-sol': [600, 900],  // Tall portrait
	'coral-cove': [800, 560],   // Landscape 4:3
	'palma-vista': [680, 680],  // Square
	'rainmist': [620, 820],     // Portrait
	'sundown-point': [860, 540] // Landscape
};

/** Get varied aspect ratio cover photo for a resort */
export function getResortCoverUrl(seed: string): string {
	const [w, h] = coverDimensions[seed] || [700, 900];
	return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

/** Build a stable placeholder photo URL per resort */
export function getPhotoUrl(seed: string, w: number, h: number): string {
	return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

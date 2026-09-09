export interface Resort {
	id: string;
	slug: string;
	name: string;
	location: string;
	contact: string;
	rate12: string;
	rate22: string;
	pax: string;
	addPax: string;
	rooms: string;
	pool: string;
	inclusions: string[];
	amenities: string[];
	gallery: string[];
	/** Used for placeholder image generation — fallback when no gallery photos exist */
	image_seed: string;
	latitude?: number | null;
	longitude?: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface TVShow {
	id: string;
	title: string;
	seasons: number[];
}

export interface Episode {
	/** url of an episode */
	url: string;
	/** episode number in a season */
	episode: number;
}

interface Person {
	name: string;
	url: string;
}

interface AggregateRating {
	bestRating: number;
	ratingCount: number;
	ratingValue: number;
	worstRating: number;
}

interface Company {
	url: string;
}

export interface IMDBMeta {
	actor: Person[];
	aggregateRating: AggregateRating;
	contentRating: string;
	creator: (Company|Person)[];
	datePublished: string;
	description: string;
	director: Person[];
	duration: string;
	genre: string[];
	/** Poster URL */
	image: string;
	keywords: string[];
	/** URL of this movie / episode / tvshow */
	url: string;
}


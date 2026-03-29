export const SCRAPED_CHARACTER_DETAILS_CACHE_TAG = "scraped_character_details";

export const SCRAPED_CHARACTER_DETAILS_CACHE_LIFE = {
  stale: 300,
  revalidate: 60 * 60 * 24 * 365,
  expire: 60 * 60 * 24 * 366,
} as const;

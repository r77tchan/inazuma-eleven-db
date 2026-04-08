export const CHARACTERS_LIST_CACHE_TAG = "characters_list";

export const CHARACTERS_LIST_CACHE_LIFE = {
  stale: 300,
  revalidate: 60 * 60 * 24 * 365,
  expire: 60 * 60 * 24 * 366,
} as const;

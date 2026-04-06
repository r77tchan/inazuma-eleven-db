import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { getScrapedCharacterDetailsRange } from "@/lib/db/scraped_character_details/getScrapedCharacterDetailsRange";
import {
  SCRAPED_CHARACTER_DETAILS_CACHE_LIFE,
  SCRAPED_CHARACTER_DETAILS_CACHE_TAG,
} from "@/lib/db/scraped_character_details/cache";
import type {
  ScrapedCharacterDetailRow,
  ScrapedCharacterDetailWithMetrics,
} from "@/lib/types";

const CHUNK_SIZE = 300;

function toScrapedCharacterDetailWithMetrics(
  row: ScrapedCharacterDetailRow,
): ScrapedCharacterDetailWithMetrics {
  return {
    detailUrl: row.detail_url,
    characterNo: String(row.character_no),
    team: row.team,
    worksFlags: row.works_flags,
    nickname: row.nickname,
    fullName: row.full_name,
    howToGet: row.how_to_get,
    imageUrl: row.image_url,
    works: row.works,
    description: row.description,
    position: row.position,
    element: row.element,
    kick: row.kick,
    control: row.control,
    technique: row.technique,
    pressure: row.pressure,
    physical: row.physical,
    agility: row.agility,
    intelligence: row.intelligence,
    generation: row.generation,
    schoolYear: row.school_year,
    gender: row.gender,
    characterRole: row.character_role,
    fetchedAt: row.fetched_at,
    totalStatus: row.total_status,
    shootAT: row.shoot_at,
    focusAT: row.focus_at,
    focusDF: row.focus_df,
    scrambleAT: row.scramble_at,
    scrambleDF: row.scramble_df,
    wallDF: row.wall_df,
    KP: row.kp,
  };
}

export default async function getAllScrapedCharacterDetails(): Promise<
  ScrapedCharacterDetailWithMetrics[]
> {
  "use cache";
  cacheLife(SCRAPED_CHARACTER_DETAILS_CACHE_LIFE);
  cacheTag(SCRAPED_CHARACTER_DETAILS_CACHE_TAG);

  const allRows: ScrapedCharacterDetailRow[] = [];

  for (let chunkIndex = 0; ; chunkIndex++) {
    const offset = chunkIndex * CHUNK_SIZE;
    const chunk = await getScrapedCharacterDetailsRange(offset, CHUNK_SIZE);
    allRows.push(...chunk);

    if (chunk.length < CHUNK_SIZE) {
      break;
    }
  }

  return allRows.map(toScrapedCharacterDetailWithMetrics);
}

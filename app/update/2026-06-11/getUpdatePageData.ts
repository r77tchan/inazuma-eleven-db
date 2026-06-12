import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { supabaseAdmin } from "@/lib/db/admin";
import { withRetry } from "@/lib/supabaseRetry";
import {
  CHARACTERS_LIST_CACHE_LIFE,
  CHARACTERS_LIST_CACHE_TAG,
} from "@/lib/db/mined/cache";

/** キャラクターIDリストから表示用の概要情報を取得 */
export type CharacterSummary = {
  character_id: string;
  full_name: string;
  image_url: string;
};

export async function getCharacterSummariesByIds(
  ids: string[],
): Promise<Record<string, CharacterSummary>> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const data = await withRetry(
    () =>
      supabaseAdmin
        .from("mined_characters")
        .select("character_id, full_name, image_url")
        .in("character_id", uniqueIds),
    "getCharacterSummariesByIds",
  );

  const map: Record<string, CharacterSummary> = {};
  for (const row of (data ?? []) as unknown as CharacterSummary[]) {
    map[row.character_id] = row;
  }
  return map;
}

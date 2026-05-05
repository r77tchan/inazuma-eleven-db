import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { supabaseAdmin } from "@/lib/db/admin";
import { withRetry } from "@/lib/supabaseRetry";
import {
  SKILLS_LIST_CACHE_LIFE,
  SKILLS_LIST_CACHE_TAG,
} from "@/lib/db/mined/skillCache";
import type { MinedSkillDetailView } from "@/lib/types";

export async function getSkillDetail(
  skillId: string,
): Promise<MinedSkillDetailView | null> {
  "use cache";
  cacheLife(SKILLS_LIST_CACHE_LIFE);
  cacheTag(SKILLS_LIST_CACHE_TAG);

  const { data, error } = await supabaseAdmin
    .from("mined_skills")
    .select(
      `skill_id, name, name_ruby, type, option, element, number_of_people,
       foul_rate, description,
       tension_normal, power_normal, recast_normal,
       tension_mm, power_mm, recast_mm,
       tension_or, power_or, recast_or,
       tension_keshin, power_keshin, recast_keshin,
       tension_soul, power_soul, recast_soul,
       is_normal, is_mm, is_or, is_keshin, is_soul,
       aura_id, where_to_get, image_url`,
    )
    .eq("skill_id", skillId)
    .single();

  if (error || !data) return null;
  return data as unknown as MinedSkillDetailView;
}

export async function getAllSkillIds(): Promise<string[]> {
  "use cache";
  cacheLife(SKILLS_LIST_CACHE_LIFE);
  cacheTag(SKILLS_LIST_CACHE_TAG);

  const allIds: string[] = [];
  const CHUNK_SIZE = 1000;

  for (let i = 0; ; i++) {
    const offset = i * CHUNK_SIZE;
    const data = await withRetry(
      () =>
        supabaseAdmin
          .from("mined_skills")
          .select("skill_id")
          .order("skill_id", { ascending: true })
          .range(offset, offset + CHUNK_SIZE - 1),
      "getAllSkillIds",
    );
    const rows = (data ?? []) as { skill_id: string }[];
    for (const r of rows) allIds.push(r.skill_id);
    if (rows.length < CHUNK_SIZE) break;
  }

  return allIds;
}

/** スキルIDに紐づくボイスキャラクター情報を取得 */
export type VoiceCharacter = {
  character_id: string;
  full_name: string;
  nickname: string;
  element: string;
  image_url: string;
};

export async function getVoiceCharactersBySkillId(
  skillId: string,
): Promise<VoiceCharacter[]> {
  "use cache";
  cacheLife(SKILLS_LIST_CACHE_LIFE);
  cacheTag(SKILLS_LIST_CACHE_TAG);

  const voiceCharIds = await withRetry(
    () =>
      supabaseAdmin
        .from("mined_skill_voices")
        .select("character_id")
        .eq("skill_id", skillId),
    "getVoiceCharactersBySkillId:voices",
  );

  const characterIds = ((voiceCharIds ?? []) as { character_id: string }[]).map(
    (r) => r.character_id,
  );
  if (characterIds.length === 0) return [];

  const chars = await withRetry(
    () =>
      supabaseAdmin
        .from("mined_characters")
        .select("character_id, full_name, nickname, element, image_url")
        .in("character_id", characterIds),
    "getVoiceCharactersBySkillId:chars",
  );

  return (chars ?? []) as unknown as VoiceCharacter[];
}

/** aura_id から化身/ソウル情報を取得 */
export type AuraInfo = {
  aura_id: string;
  name: string;
  element: string;
  type: string;
};

export async function getAurasByAuraIds(
  auraIds: string[],
): Promise<AuraInfo[]> {
  "use cache";
  cacheLife(SKILLS_LIST_CACHE_LIFE);
  cacheTag(SKILLS_LIST_CACHE_TAG);

  if (auraIds.length === 0) return [];

  const { data, error } = await supabaseAdmin
    .from("mined_auras")
    .select("aura_id, name, element, type")
    .in("aura_id", auraIds);

  if (error || !data) return [];

  const map = new Map(
    (data as unknown as AuraInfo[]).map((row) => [row.aura_id, row]),
  );
  return auraIds
    .map((id) => map.get(id))
    .filter((row): row is AuraInfo => row != null);
}

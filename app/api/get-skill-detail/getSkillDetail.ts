import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { supabaseAdmin } from "@/lib/db/admin";
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
       where_to_get, image_url`,
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
    const { data, error } = await supabaseAdmin
      .from("mined_skills")
      .select("skill_id")
      .order("skill_id", { ascending: true })
      .range(offset, offset + CHUNK_SIZE - 1);

    if (error) throw new Error(`Supabase select failed: ${error.message}`);
    const rows = data ?? [];
    for (const r of rows) allIds.push((r as { skill_id: string }).skill_id);
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

  const { data, error } = await supabaseAdmin
    .from("mined_skill_voices")
    .select("character_id")
    .eq("skill_id", skillId);

  if (error)
    throw new Error(`mined_skill_voices select failed: ${error.message}`);

  const characterIds = (data ?? []).map(
    (r: { character_id: string }) => r.character_id,
  );
  if (characterIds.length === 0) return [];

  const { data: chars, error: charErr } = await supabaseAdmin
    .from("mined_characters")
    .select("character_id, full_name, nickname, element, image_url")
    .in("character_id", characterIds);

  if (charErr)
    throw new Error(`mined_characters select failed: ${charErr.message}`);

  return (chars ?? []) as unknown as VoiceCharacter[];
}

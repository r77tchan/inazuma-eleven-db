import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { supabaseAdmin } from "@/lib/db/admin";
import { calcStatus } from "@/lib/calcStatus";
import { withRetry } from "@/lib/supabaseRetry";
import {
  CHARACTERS_LIST_CACHE_LIFE,
  CHARACTERS_LIST_CACHE_TAG,
} from "@/lib/db/mined/cache";
import type { MinedCharacterDetailView, CharacterStats } from "@/lib/types";
import type { CalcStatusResult } from "@/lib/calcStatus";

type JoinedRow = {
  character_id: string;
  full_name: string;
  full_name_ruby: string;
  nickname: string;
  inagle_no: number | null;
  position: string;
  sub_position: string;
  element: string;
  gender: string;
  physique: string;
  build_type: string;
  description: string;
  image_url: string;
  normal_slot_1: string | null;
  normal_slot_2: string | null;
  normal_slot_3: string | null;
  normal_default_slot_4: string | null;
  normal_default_slot_5: string | null;
  normal_default_slot_6: string | null;
  normal_branch_slot_4: string | null;
  normal_branch_slot_5: string | null;
  normal_branch_slot_6: string | null;
  inagle_url: string | null;
  team: string[] | null;
  works_flags: MinedCharacterDetailView["works_flags"];
  how_to_get: MinedCharacterDetailView["how_to_get"];
  generation: string | null;
  school_year: string | null;
  character_role: string | null;
  default_status: CharacterStats;
  branch_status: CharacterStats;
};

function buildView(row: JoinedRow): MinedCharacterDetailView {
  const defaultCalc: CalcStatusResult = calcStatus(row.default_status);
  const branchCalc: CalcStatusResult = calcStatus(row.branch_status);

  return {
    character_id: row.character_id,
    full_name: row.full_name,
    full_name_ruby: row.full_name_ruby,
    nickname: row.nickname,
    inagle_no: row.inagle_no,
    position: row.position,
    sub_position: row.sub_position,
    element: row.element,
    gender: row.gender,
    physique: row.physique,
    build_type: row.build_type,
    description: row.description,
    image_url: row.image_url,
    normal_slot_1: row.normal_slot_1,
    normal_slot_2: row.normal_slot_2,
    normal_slot_3: row.normal_slot_3,
    normal_default_slot_4: row.normal_default_slot_4,
    normal_default_slot_5: row.normal_default_slot_5,
    normal_default_slot_6: row.normal_default_slot_6,
    normal_branch_slot_4: row.normal_branch_slot_4,
    normal_branch_slot_5: row.normal_branch_slot_5,
    normal_branch_slot_6: row.normal_branch_slot_6,
    default_status: row.default_status,
    branch_status: row.branch_status,
    default_shoot_at: defaultCalc.shoot_at,
    default_focus_at: defaultCalc.focus_at,
    default_focus_df: defaultCalc.focus_df,
    default_scramble_at: defaultCalc.scramble_at,
    default_scramble_df: defaultCalc.scramble_df,
    default_wall_df: defaultCalc.wall_df,
    default_kp: defaultCalc.kp,
    branch_shoot_at: branchCalc.shoot_at,
    branch_focus_at: branchCalc.focus_at,
    branch_focus_df: branchCalc.focus_df,
    branch_scramble_at: branchCalc.scramble_at,
    branch_scramble_df: branchCalc.scramble_df,
    branch_wall_df: branchCalc.wall_df,
    branch_kp: branchCalc.kp,
    inagle_url: row.inagle_url,
    team: row.team,
    works_flags: row.works_flags,
    how_to_get: row.how_to_get,
    generation: row.generation,
    school_year: row.school_year,
    character_role: row.character_role,
  };
}

const SELECT_FIELDS = `character_id, full_name, full_name_ruby, nickname, inagle_no,
  position, sub_position, element, gender, physique, build_type, description, image_url,
  normal_slot_1, normal_slot_2, normal_slot_3,
  normal_default_slot_4, normal_default_slot_5, normal_default_slot_6,
  normal_branch_slot_4, normal_branch_slot_5, normal_branch_slot_6,
  inagle_url, team, works_flags, how_to_get, generation, school_year, character_role,
  default_status:status_types!legend_status_type_default(kick, control, technique, pressure, physical, intelligence, agility),
  branch_status:status_types!legend_status_type_branch(kick, control, technique, pressure, physical, intelligence, agility)`;

export async function getCharacterDetail(
  characterId: string,
): Promise<MinedCharacterDetailView | null> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const { data, error } = await supabaseAdmin
    .from("mined_characters")
    .select(SELECT_FIELDS)
    .eq("character_id", characterId)
    .single();

  if (error || !data) return null;
  return buildView(data as unknown as JoinedRow);
}

export async function getAllCharacterIds(): Promise<string[]> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const allIds: string[] = [];
  const CHUNK_SIZE = 1000;

  for (let i = 0; ; i++) {
    const offset = i * CHUNK_SIZE;
    const rows = (await withRetry(
      () =>
        supabaseAdmin
          .from("mined_characters")
          .select("character_id")
          .order("character_id", { ascending: true })
          .range(offset, offset + CHUNK_SIZE - 1),
      "getAllCharacterIds",
    )) as { character_id: string }[] | null;
    for (const r of rows ?? []) allIds.push(r.character_id);
    if ((rows ?? []).length < CHUNK_SIZE) break;
  }

  return allIds;
}

/** 全 status_types の生データ + 実数値を取得（順位計算 + レーダー用） */
export type AllStatusTypeData = {
  calcStats: CalcStatusResult[];
  statMax: CharacterStats;
};

export async function getAllStatusTypeData(): Promise<AllStatusTypeData> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const allRows: CharacterStats[] = [];
  const CHUNK_SIZE = 1000;

  for (let i = 0; ; i++) {
    const offset = i * CHUNK_SIZE;
    const data = await withRetry(
      () =>
        supabaseAdmin
          .from("status_types")
          .select(
            "kick, control, technique, pressure, physical, intelligence, agility",
          )
          .order("id", { ascending: true })
          .range(offset, offset + CHUNK_SIZE - 1),
      "getAllStatusTypeData",
    );
    const rows = (data ?? []) as unknown as CharacterStats[];
    allRows.push(...rows);
    if (rows.length < CHUNK_SIZE) break;
  }

  const statMax: CharacterStats = {
    kick: 0,
    control: 0,
    technique: 0,
    pressure: 0,
    physical: 0,
    intelligence: 0,
    agility: 0,
  };
  for (const r of allRows) {
    for (const k of Object.keys(statMax) as (keyof CharacterStats)[]) {
      if (r[k] > statMax[k]) statMax[k] = r[k];
    }
  }

  return {
    calcStats: allRows.map((r) => calcStatus(r)),
    statMax,
  };
}

/** スキルIDリストからスキル情報を取得 */
export type SkillSlotInfo = {
  skill_id: string;
  name: string;
  type: string;
  element: string;
  option: string | null;
  tension_normal: number | null;
  power_normal: number | null;
};

export async function getSkillInfoByIds(
  ids: string[],
): Promise<Record<string, SkillSlotInfo>> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const data = await withRetry(
    () =>
      supabaseAdmin
        .from("mined_skills")
        .select(
          "skill_id, name, type, element, option, tension_normal, power_normal",
        )
        .in("skill_id", uniqueIds),
    "getSkillInfoByIds",
  );

  const map: Record<string, SkillSlotInfo> = {};
  for (const row of (data ?? []) as unknown as SkillSlotInfo[]) {
    map[row.skill_id] = row;
  }
  return map;
}

/** オーラIDリストからオーラ情報を取得 */
export type AuraSlotInfo = {
  aura_id: string;
  name: string;
  type: string;
  element: string;
};

export async function getAuraInfoByIds(
  ids: string[],
): Promise<Record<string, AuraSlotInfo>> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return {};

  const data = await withRetry(
    () =>
      supabaseAdmin
        .from("mined_auras")
        .select("aura_id, name, type, element")
        .in("aura_id", uniqueIds),
    "getAuraInfoByIds",
  );

  const map: Record<string, AuraSlotInfo> = {};
  for (const row of (data ?? []) as unknown as AuraSlotInfo[]) {
    map[row.aura_id] = row;
  }
  return map;
}

/** キャラクターIDに紐づくボイス情報(スキル+オーラ)を取得 */
export type VoiceEntry = {
  id: string;
  kind: "skill" | "aura";
};

export async function getVoicesByCharacterId(
  characterId: string,
): Promise<VoiceEntry[]> {
  "use cache";
  cacheLife(CHARACTERS_LIST_CACHE_LIFE);
  cacheTag(CHARACTERS_LIST_CACHE_TAG);

  const [skillData, auraData] = await Promise.all([
    withRetry(
      () =>
        supabaseAdmin
          .from("mined_skill_voices")
          .select("skill_id")
          .eq("character_id", characterId),
      "getVoicesByCharacterId:skills",
    ),
    withRetry(
      () =>
        supabaseAdmin
          .from("mined_aura_voices")
          .select("aura_id")
          .eq("character_id", characterId),
      "getVoicesByCharacterId:auras",
    ),
  ]);

  const entries: VoiceEntry[] = [];
  for (const r of (skillData ?? []) as { skill_id: string }[]) {
    entries.push({ id: r.skill_id, kind: "skill" });
  }
  for (const r of (auraData ?? []) as { aura_id: string }[]) {
    entries.push({ id: r.aura_id, kind: "aura" });
  }
  return entries;
}

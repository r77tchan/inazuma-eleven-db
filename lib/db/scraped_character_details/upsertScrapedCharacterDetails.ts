import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type {
  ScrapedCharacterDetailRow,
  ScrapedCharacterDetailWithMetrics,
} from "@/lib/types";

function toIntegerCharacterNo(value: string): number {
  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    throw new Error(`characterNo が整数ではありません: ${value}`);
  }

  return Number.parseInt(normalizedValue, 10);
}

function toScrapedCharacterDetailRow(
  characterDetail: ScrapedCharacterDetailWithMetrics,
): Omit<ScrapedCharacterDetailRow, "created_at" | "updated_at"> {
  return {
    character_no: toIntegerCharacterNo(characterDetail.characterNo),
    detail_url: characterDetail.detailUrl,
    team: characterDetail.team,
    works_flags: characterDetail.worksFlags,
    nickname: characterDetail.nickname,
    full_name: characterDetail.fullName,
    how_to_get: characterDetail.howToGet,
    image_url: characterDetail.imageUrl,
    works: characterDetail.works,
    description: characterDetail.description,
    position: characterDetail.position,
    element: characterDetail.element,
    kick: characterDetail.kick,
    control: characterDetail.control,
    technique: characterDetail.technique,
    pressure: characterDetail.pressure,
    physical: characterDetail.physical,
    agility: characterDetail.agility,
    intelligence: characterDetail.intelligence,
    generation: characterDetail.generation,
    school_year: characterDetail.schoolYear,
    gender: characterDetail.gender,
    character_role: characterDetail.characterRole,
    fetched_at: characterDetail.fetchedAt,
    total_status: characterDetail.totalStatus,
    shoot_at: characterDetail.shootAT,
    focus_at: characterDetail.focusAT,
    focus_df: characterDetail.focusDF,
    scramble_at: characterDetail.scrambleAT,
    scramble_df: characterDetail.scrambleDF,
    wall_df: characterDetail.wallDF,
    kp: characterDetail.KP,
  };
}

export async function upsertScrapedCharacterDetails(
  characterDetailList: ScrapedCharacterDetailWithMetrics[],
): Promise<void> {
  const rows = characterDetailList.map(toScrapedCharacterDetailRow);

  const { error } = await supabaseAdmin
    .from("scraped_character_details")
    .upsert(rows, { onConflict: "character_no" });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

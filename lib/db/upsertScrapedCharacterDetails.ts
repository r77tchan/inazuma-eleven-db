import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type { CharacterDetail } from "@/lib/types";

function toIntOrNull(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function toCharacterDetailRow(c: CharacterDetail) {
  return {
    character_no: toIntOrNull(c.characterNo),
    detail_url: c.detailUrl,
    nickname: c.nickname,
    full_name: c.fullName,
    image_url: c.imageUrl,
    works: c.works,
    description: c.description,
    position: c.position,
    element: c.element,
    kick: toIntOrNull(c.kick),
    control: toIntOrNull(c.control),
    technique: toIntOrNull(c.technique),
    pressure: toIntOrNull(c.pressure),
    physical: toIntOrNull(c.physical),
    agility: toIntOrNull(c.agility),
    intelligence: toIntOrNull(c.intelligence),
    generation: c.generation,
    school_year: c.schoolYear,
    gender: c.gender,
    character_role: c.characterRole,
    fetched_at: c.fetchedAt,
  };
}

export async function upsertScrapedCharacterDetails(
  characterDetailList: CharacterDetail[],
): Promise<void> {
  const rows = characterDetailList.map(toCharacterDetailRow);
  const { error } = await supabaseAdmin
    .from("scraped_character_details")
    .upsert(rows, { onConflict: "character_no" });

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

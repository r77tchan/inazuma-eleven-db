import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type { CharacterDetail } from "@/lib/types";

function removeMiddleDot(value: string): string {
  return value.replace(/・/g, "");
}

function isKatakanaOnly(value: string): boolean {
  // 長音「ー」も含めてカタカナ扱い
  return /^[\u30A0-\u30FF\u31F0-\u31FF\u30FC]+$/.test(value);
}

function katakanaToHiragana(value: string): string {
  return Array.from(value)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      // ァ(0x30A1)〜ヶ(0x30F6) を ぁ(0x3041)〜ゖ(0x3096) に変換
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCharCode(code - 0x60);
      }
      return ch;
    })
    .join("");
}

function overwriteRubyIfKatakanaName<T extends { name: string; ruby: string }>(
  item: T,
): T {
  const withoutDot = removeMiddleDot(item.name);
  if (!withoutDot) return item;
  if (!isKatakanaOnly(withoutDot)) return item;

  return {
    ...item,
    ruby: katakanaToHiragana(withoutDot),
  };
}

function toIntOrNull(value: string): number | null {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function toCharacterDetailRow(c: CharacterDetail) {
  return {
    character_no: toIntOrNull(c.characterNo),
    detail_url: c.detailUrl,
    nickname: c.nickname.map(overwriteRubyIfKatakanaName),
    full_name: c.fullName.map(overwriteRubyIfKatakanaName),
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

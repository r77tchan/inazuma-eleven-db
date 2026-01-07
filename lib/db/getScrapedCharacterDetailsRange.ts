import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type { ScrapedCharacterDetailRow } from "@/lib/types";

export async function getScrapedCharacterDetailsRange(
  offset: number,
  limit: number,
): Promise<ScrapedCharacterDetailRow[]> {
  // console.log("db接続");

  const safeOffset = Number.isFinite(offset)
    ? Math.max(0, Math.trunc(offset))
    : 0;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 1;

  const query = supabaseAdmin
    .from("scraped_character_details")
    .select("*")
    .order("character_no", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Supabase select failed: ${error.message}`);
  }

  return (data ?? []) as ScrapedCharacterDetailRow[];
}

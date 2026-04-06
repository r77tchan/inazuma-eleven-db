import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type { MinedCharacterRow } from "@/lib/types";

export async function getMinedCharactersRange(
  offset: number,
  limit: number,
): Promise<MinedCharacterRow[]> {
  const safeOffset = Number.isFinite(offset)
    ? Math.max(0, Math.trunc(offset))
    : 0;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 1;

  const { data, error } = await supabaseAdmin
    .from("mined_characters")
    .select("*")
    .order("character_id", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (error) {
    throw new Error(`Supabase select failed: ${error.message}`);
  }

  return (data ?? []) as MinedCharacterRow[];
}

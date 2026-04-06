import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import type { MinedSkillRow } from "@/lib/types";

export async function getMinedSkillsRange(
  offset: number,
  limit: number,
): Promise<MinedSkillRow[]> {
  const safeOffset = Number.isFinite(offset)
    ? Math.max(0, Math.trunc(offset))
    : 0;
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.trunc(limit)) : 1;

  const { data, error } = await supabaseAdmin
    .from("mined_skills")
    .select("*")
    .order("skill_id", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (error) {
    throw new Error(`Supabase select failed: ${error.message}`);
  }

  return (data ?? []) as MinedSkillRow[];
}

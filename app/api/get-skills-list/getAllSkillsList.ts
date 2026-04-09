import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { supabaseAdmin } from "@/lib/db/admin";
import {
  SKILLS_LIST_CACHE_LIFE,
  SKILLS_LIST_CACHE_TAG,
} from "@/lib/db/mined/skillCache";
import type { MinedSkillListView } from "@/lib/types";

const CHUNK_SIZE = 500;

export default async function getAllSkillsList(): Promise<
  MinedSkillListView[]
> {
  "use cache";
  cacheLife(SKILLS_LIST_CACHE_LIFE);
  cacheTag(SKILLS_LIST_CACHE_TAG);

  const allRows: MinedSkillListView[] = [];

  for (let chunkIndex = 0; ; chunkIndex++) {
    const offset = chunkIndex * CHUNK_SIZE;
    const { data, error } = await supabaseAdmin
      .from("mined_skills")
      .select(
        `skill_id, name, name_ruby, type, option, element, number_of_people,
         description, tension_normal, power_normal, tension_mm, power_mm,
         tension_or, power_or, tension_keshin, power_keshin,
         tension_soul, power_soul, is_normal, is_mm, is_or, is_keshin, is_soul,
         image_url`,
      )
      .order("skill_id", { ascending: true })
      .range(offset, offset + CHUNK_SIZE - 1);

    if (error) throw new Error(`Supabase select failed: ${error.message}`);

    const rows = (data ?? []) as unknown as MinedSkillListView[];
    allRows.push(...rows);

    if (rows.length < CHUNK_SIZE) break;
  }

  return allRows;
}

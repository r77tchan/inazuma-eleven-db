import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";
import { calcStatus } from "@/lib/calcStatus";
import type { MinedCharacterListView } from "@/lib/types";

const CHUNK_SIZE = 500;

type JoinedRow = {
  character_id: string;
  full_name: string;
  nickname: string;
  inagle_no: number | null;
  position: string;
  sub_position: string;
  element: string;
  physique: string;
  build_type: string;
  image_url: string;
  is_obtainable: boolean;
  team: string[] | null;
  character_role: string | null;
  default_status: {
    kick: number;
    control: number;
    technique: number;
    pressure: number;
    physical: number;
    intelligence: number;
    agility: number;
  };
  branch_status: {
    kick: number;
    control: number;
    technique: number;
    pressure: number;
    physical: number;
    intelligence: number;
    agility: number;
  };
};

export default async function getAllCharactersList(): Promise<
  MinedCharacterListView[]
> {
  const allRows: JoinedRow[] = [];

  for (let chunkIndex = 0; ; chunkIndex++) {
    const offset = chunkIndex * CHUNK_SIZE;
    const { data, error } = await supabaseAdmin
      .from("mined_characters")
      .select(
        `character_id, full_name, nickname, inagle_no, position, sub_position,
         element, physique, build_type, image_url, is_obtainable, team, character_role,
         default_status:status_types!legend_status_type_default(kick, control, technique, pressure, physical, intelligence, agility),
         branch_status:status_types!legend_status_type_branch(kick, control, technique, pressure, physical, intelligence, agility)`,
      )
      .order("character_id", { ascending: true })
      .range(offset, offset + CHUNK_SIZE - 1);

    if (error) throw new Error(`Supabase select failed: ${error.message}`);

    const rows = (data ?? []) as unknown as JoinedRow[];
    allRows.push(...rows);

    if (rows.length < CHUNK_SIZE) break;
  }

  return allRows.map((row): MinedCharacterListView => {
    const defaultCalc = calcStatus(row.default_status);
    const branchCalc = calcStatus(row.branch_status);

    return {
      character_id: row.character_id,
      full_name: row.full_name,
      nickname: row.nickname,
      inagle_no: row.inagle_no,
      position: row.position,
      sub_position: row.sub_position,
      element: row.element,
      physique: row.physique,
      build_type: row.build_type,
      image_url: row.image_url,
      is_obtainable: row.is_obtainable,
      team: row.team?.[0] ?? null,
      character_role: row.character_role,
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
    };
  });
}

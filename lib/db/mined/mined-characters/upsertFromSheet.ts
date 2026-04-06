// 実行方法:
// npx tsx --env-file=.env.local lib/db/mined/mined-characters/upsertFromSheet.ts

import { createClient } from "@supabase/supabase-js";

import { fetchSheetAsRecords } from "../fetchSheetCsv";

const SHEET_NAME = "mined_characters";
const TABLE_NAME = "mined_characters";
const BATCH_SIZE = 500;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`環境変数 ${name} が未設定です。`);
  }
  return value;
}

function toBoolean(value: string): boolean {
  return value === "TRUE" || value === "true" || value === "1";
}

function toInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

type UpsertRow = {
  character_id: string;
  full_name: string;
  full_name_ruby: string;
  nickname: string;
  nickname_ruby: string;
  position: string;
  sub_position: string;
  element: string;
  gender: string;
  physique: string;
  build_type: string;
  description: string;
  kick_legend: number;
  control_legend: number;
  technique_legend: number;
  pressure_legend: number;
  physical_legend: number;
  intelligence_legend: number;
  agility_legend: number;
  total_status_legend: number;
  kick_basara: number;
  control_basara: number;
  technique_basara: number;
  pressure_basara: number;
  physical_basara: number;
  intelligence_basara: number;
  agility_basara: number;
  total_status_basara: number;
  image_url: string;
  is_obtainable: boolean;
};

function toUpsertRow(record: Record<string, string>): UpsertRow {
  return {
    character_id: record["character_id"] ?? "",
    full_name: record["full_name"] ?? "",
    full_name_ruby: record["full_name_ruby"] ?? "",
    nickname: record["nickname"] ?? "",
    nickname_ruby: record["nickname_ruby"] ?? "",
    position: record["position"] ?? "",
    sub_position: record["sub_position"] ?? "",
    element: record["element"] ?? "",
    gender: record["gender"] ?? "",
    physique: record["physique"] ?? "",
    build_type: record["build_type"] ?? "",
    description: record["description"] ?? "",
    kick_legend: toInt(record["kick_legend"] ?? "0"),
    control_legend: toInt(record["control_legend"] ?? "0"),
    technique_legend: toInt(record["technique_legend"] ?? "0"),
    pressure_legend: toInt(record["pressure_legend"] ?? "0"),
    physical_legend: toInt(record["physical_legend"] ?? "0"),
    intelligence_legend: toInt(record["intelligence_legend"] ?? "0"),
    agility_legend: toInt(record["agility_legend"] ?? "0"),
    total_status_legend: toInt(record["total_status_legend"] ?? "0"),
    kick_basara: toInt(record["kick_basara"] ?? "0"),
    control_basara: toInt(record["control_basara"] ?? "0"),
    technique_basara: toInt(record["technique_basara"] ?? "0"),
    pressure_basara: toInt(record["pressure_basara"] ?? "0"),
    physical_basara: toInt(record["physical_basara"] ?? "0"),
    intelligence_basara: toInt(record["intelligence_basara"] ?? "0"),
    agility_basara: toInt(record["agility_basara"] ?? "0"),
    total_status_basara: toInt(record["total_status_basara"] ?? "0"),
    image_url: record["image_url"] ?? "",
    // シートのセルが空の場合は入手可能とみなす
    is_obtainable: ((): boolean => {
      const raw = record["is_obtainable"] ?? "";
      return raw === "" ? true : toBoolean(raw);
    })(),
  };
}

async function main() {
  const supabase = createClient(
    requireEnv("DB_API_URL"),
    requireEnv("DB_SECRET_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  console.log(`[${SHEET_NAME}] Google Sheets からデータを取得中...`);
  const records = await fetchSheetAsRecords(SHEET_NAME);
  console.log(`[${SHEET_NAME}] ${records.length}件のデータを取得しました`);

  const rows = records.filter((r) => r["character_id"]).map(toUpsertRow);
  console.log(`[${TABLE_NAME}] ${rows.length}件をupsertします`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(batch, { onConflict: "character_id" });

    if (error) {
      throw new Error(
        `Supabase upsert failed (batch ${i / BATCH_SIZE + 1}): ${error.message}`,
      );
    }

    console.log(`  batch ${i / BATCH_SIZE + 1}: ${batch.length}件 upsert完了`);
  }

  console.log(`[${TABLE_NAME}] 全てのupsertが完了しました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

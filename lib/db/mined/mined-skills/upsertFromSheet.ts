// 実行方法:
// npx tsx --env-file=.env.local lib/db/mined/mined-skills/upsertFromSheet.ts

import { createClient } from "@supabase/supabase-js";

import { fetchSheetAsRecords } from "../fetchSheetCsv";

const SHEET_NAME = "mined_skills";
const TABLE_NAME = "mined_skills";
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
  skill_id: string;
  name: string;
  name_ruby: string;
  type: string;
  option: string;
  tension: number;
  power: number;
  recast: number;
  element: string;
  number_of_people: number;
  foul_rate: number;
  is_mixi_max: boolean;
  is_override: boolean;
  is_keshin: boolean;
  is_soul: boolean;
  where_to_get: string;
  image_url: string;
};

function toUpsertRow(record: Record<string, string>): UpsertRow {
  return {
    skill_id: record["skill_id"] ?? "",
    name: record["name"] ?? "",
    name_ruby: record["name_ruby"] ?? "",
    type: record["type"] ?? "",
    option: record["option"] ?? "",
    tension: toInt(record["tension"] ?? "0"),
    power: toInt(record["power"] ?? "0"),
    recast: toInt(record["recast"] ?? "0"),
    element: record["element"] ?? "",
    number_of_people: toInt(record["number_of_people"] ?? "0"),
    foul_rate: toInt(record["foul_rate"] ?? "0"),
    is_mixi_max: toBoolean(record["is_mixi_max"] ?? ""),
    is_override: toBoolean(record["is_override"] ?? ""),
    is_keshin: toBoolean(record["is_keshin"] ?? ""),
    is_soul: toBoolean(record["is_soul"] ?? ""),
    where_to_get: record["where_to_get"] ?? "",
    image_url: record["image_url"] ?? "",
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

  const rows = records.filter((r) => r["skill_id"]).map(toUpsertRow);
  console.log(`[${TABLE_NAME}] ${rows.length}件をupsertします`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(batch, { onConflict: "skill_id" });

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

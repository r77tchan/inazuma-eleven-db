// 実行方法:
// npx tsx --env-file=.env.local lib/db/mined/mined-voices/upsertFromSheet.ts

import { createClient } from "@supabase/supabase-js";

import { fetchSheetAsRecords } from "../fetchSheetCsv";

const SHEET_NAME = "mined_voices";
const TABLE_NAME = "mined_voices";
const BATCH_SIZE = 500;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`環境変数 ${name} が未設定です。`);
  }
  return value;
}

type UpsertRow = {
  id: string;
  character_id: string;
  skill_id: string;
};

function toUpsertRow(record: Record<string, string>): UpsertRow {
  return {
    id: record["id"] ?? "",
    character_id: record["character_id"] ?? "",
    skill_id: record["skill_id"] ?? "",
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

  const rows = records.filter((r) => r["id"]).map(toUpsertRow);
  console.log(`[${TABLE_NAME}] ${rows.length}件をupsertします`);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(batch, { onConflict: "id" });

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

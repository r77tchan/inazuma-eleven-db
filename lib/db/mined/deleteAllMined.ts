// mined 系テーブル6つ (scraped_character_details 以外) の全データを削除するスクリプト
// 削除後は fetchAndInsertMined.ts で再投入する
//
// 実行方法:
// npx tsx --env-file=.env.local lib/db/mined/deleteAllMined.ts

import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`環境変数 ${name} が未設定です。`);
  return value;
}

// mined_characters が status_types を外部キー参照しているため、
// status_types は mined_characters より後に削除する
const TARGETS: { table: string; pkColumn: string; pkMin: string | number }[] = [
  { table: "mined_skill_voices", pkColumn: "id", pkMin: 0 },
  { table: "mined_aura_voices", pkColumn: "id", pkMin: 0 },
  { table: "mined_characters", pkColumn: "character_id", pkMin: "" },
  { table: "mined_skills", pkColumn: "skill_id", pkMin: "" },
  { table: "mined_auras", pkColumn: "aura_id", pkMin: "" },
  { table: "status_types", pkColumn: "id", pkMin: 0 },
];

async function main() {
  const supabase = createClient(
    requireEnv("DB_API_URL"),
    requireEnv("DB_SECRET_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  for (const { table, pkColumn, pkMin } of TARGETS) {
    const { count, error: countError } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (countError) {
      throw new Error(`${table} の件数取得に失敗: ${countError.message}`);
    }

    console.log(`[delete] ${table} (${count ?? 0}件) を削除中...`);

    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .gte(pkColumn, pkMin);
    if (deleteError) {
      throw new Error(`${table} の削除に失敗: ${deleteError.message}`);
    }

    console.log("  削除完了");
  }

  console.log("\n全6テーブルの削除が完了しました！");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

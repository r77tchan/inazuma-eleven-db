/**
 * JSONファイルとDBデータを比較するスクリプト
 *
 * 使い方: npx tsx scripts/compare-with-db.ts
 */

const JSON_FILE_NAME = "2026-03-30.json";
const API_BASE_URL = "http://localhost:3000";

type JsonEntry = {
  id: string;
  nameJp: string | null;
  style: string;
};

type CharacterName = {
  name: string;
  ruby: string;
};

type DbEntry = {
  characterNo: string;
  fullName: CharacterName;
  [key: string]: unknown;
};

type ApiResponse = {
  message: string;
  dbData: DbEntry[];
};

/** idの末尾の数字を抽出する (例: "mark-evans-1" → "1") */
function extractNumberFromId(id: string): string {
  const match = id.match(/-(\d+)$/);
  if (!match) {
    throw new Error(`idから数字を抽出できません: ${id}`);
  }
  return match[1];
}

/** nameJpのカッコ内のふりがなを抽出する (例: "円堂 守 (えんどう まもる)" → "えんどう まもる") */
function extractRubyFromNameJp(nameJp: string): string {
  const match = nameJp.match(/[（(]([^）)]+)[）)]/);
  if (!match) {
    throw new Error(`nameJpからふりがなを抽出できません: ${nameJp}`);
  }
  return match[1];
}

async function main() {
  // JSONファイルを読み込む
  const { readFileSync } = await import("node:fs");
  const { fileURLToPath, URL: NodeURL } = await import("node:url");
  const jsonPath = fileURLToPath(new NodeURL(JSON_FILE_NAME, import.meta.url));
  const jsonText = readFileSync(jsonPath, "utf-8");
  const jsonEntries: JsonEntry[] = JSON.parse(jsonText);

  // APIからDBデータを取得
  const res = await fetch(`${API_BASE_URL}/api/get-db-data`);
  if (!res.ok) {
    throw new Error(`API呼び出し失敗: ${res.status} ${res.statusText}`);
  }
  const apiData: ApiResponse = await res.json();
  const dbEntries = apiData.dbData;

  // DBデータをcharacterNoでマップ化
  const dbMap = new Map<string, DbEntry>();
  for (const entry of dbEntries) {
    dbMap.set(entry.characterNo, entry);
  }

  // JSONデータをid番号でマップ化
  const jsonMap = new Map<string, JsonEntry>();
  for (const entry of jsonEntries) {
    const num = extractNumberFromId(entry.id);
    jsonMap.set(num, entry);
  }

  const mismatches: string[] = [];
  const onlyInJson: string[] = [];
  const onlyInDb: string[] = [];

  // JSONにあってDBにないもの、またはrubyが一致しないものを検出
  for (const entry of jsonEntries) {
    const num = extractNumberFromId(entry.id);

    if (!entry.nameJp) {
      console.log(entry.id);
      // nameJpがnullの場合はスキップ（比較不可）
      continue;
    }

    const ruby = extractRubyFromNameJp(entry.nameJp);
    const dbEntry = dbMap.get(num);

    if (!dbEntry) {
      onlyInJson.push(`  No.${num} (id: ${entry.id}, nameJp: ${entry.nameJp})`);
      continue;
    }

    const dbRuby = dbEntry.fullName.ruby;
    if (ruby !== dbRuby) {
      mismatches.push(
        `  No.${num}\n` +
          `    JSON: "${ruby}" (id: ${entry.id})\n` +
          `    DB:   "${dbRuby}"`,
      );
    }
  }

  // DBにあってJSONにないものを検出
  for (const entry of dbEntries) {
    if (!jsonMap.has(entry.characterNo)) {
      onlyInDb.push(
        `  No.${entry.characterNo} (fullName: ${entry.fullName.name} / ${entry.fullName.ruby})`,
      );
    }
  }

  // 結果表示
  console.log(`\n=== 比較結果 ===`);
  console.log(`JSONファイル: ${JSON_FILE_NAME} (${jsonEntries.length}件)`);
  console.log(`DBデータ: ${dbEntries.length}件\n`);

  if (mismatches.length > 0) {
    console.log(`❌ ふりがな不一致 (${mismatches.length}件):`);
    // console.log(mismatches.join("\n"));
    console.log();
  }

  if (onlyInJson.length > 0) {
    console.log(`📄 JSONにのみ存在 (${onlyInJson.length}件):`);
    console.log(onlyInJson.join("\n"));
    console.log();
  }

  if (onlyInDb.length > 0) {
    console.log(`🗄️  DBにのみ存在 (${onlyInDb.length}件):`);
    console.log(onlyInDb.join("\n"));
    console.log();
  }

  if (
    mismatches.length === 0 &&
    onlyInJson.length === 0 &&
    onlyInDb.length === 0
  ) {
    console.log("✅ すべて一致しています！");
  }
}

main().catch((e) => {
  console.error("エラー:", e);
  process.exit(1);
});

// 実行方法:
// npm run dev した状態で:
// npx tsx --env-file=.env.local lib/db/mined/fetchAndUpsertMined.ts

import { createClient } from "@supabase/supabase-js";

// =============================================
// 環境変数 & 定数
// =============================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`環境変数 ${name} が未設定です。`);
  return value;
}

const SPREADSHEET_ID = requireEnv("MINED_SPREADSHEET_ID");
const BATCH_SIZE = 500;
const SPECIAL_CHARACTER_ID = "c11010020";

// =============================================
// ユーティリティ
// =============================================

function toInt(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : 0;
}

function toBoolean(value: string): boolean {
  return value === "TRUE" || value === "true" || value === "1";
}

function toNullableString(value: string | undefined): string | null {
  return value && value !== "" ? value : null;
}

function toNullableInt(value: string | undefined): number | null {
  if (!value || value === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

// =============================================
// CSV パーサー (RFC 4180)
// =============================================

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let i = 0;

  while (i <= text.length) {
    if (i === text.length) {
      if (row.length > 0) rows.push(row);
      break;
    }

    let field: string;

    if (text[i] === '"') {
      i++;
      field = "";
      while (i < text.length) {
        if (text[i] === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          field += text[i];
          i++;
        }
      }
    } else {
      field = "";
      while (
        i < text.length &&
        text[i] !== "," &&
        text[i] !== "\r" &&
        text[i] !== "\n"
      ) {
        field += text[i];
        i++;
      }
    }

    row.push(field);

    if (i < text.length && text[i] === ",") {
      i++;
    } else {
      rows.push(row);
      row = [];
      if (i < text.length && text[i] === "\r") i++;
      if (i < text.length && text[i] === "\n") i++;
    }
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

async function fetchSheetAsRecords(
  sheetName: string,
): Promise<Record<string, string>[]> {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: sheetName,
  });
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Google Sheets の取得に失敗しました (HTTP ${response.status}): sheet=${sheetName}`,
    );
  }

  const csvText = await response.text();
  const allRows = parseCsv(csvText);

  if (allRows.length === 0) return [];

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = row[j] ?? "";
    }
    return record;
  });
}

// =============================================
// ステータス補正計算
// =============================================

type Stats = {
  kick: number;
  control: number;
  technique: number;
  pressure: number;
  physical: number;
  intelligence: number;
  agility: number;
};

function getCommonBonus(position: string): Stats {
  const s: Stats = {
    kick: 0,
    control: 0,
    technique: 0,
    pressure: 0,
    physical: 0,
    intelligence: 0,
    agility: 0,
  };
  switch (position) {
    case "FW":
      s.kick += 3;
      s.control += 5;
      break;
    case "MF":
      s.control += 5;
      s.technique += 3;
      break;
    case "DF":
      s.pressure += 3;
      s.physical += 5;
      break;
    case "GK":
      s.physical += 5;
      s.agility += 3;
      break;
  }
  return s;
}

function getExtraBonus(position: string): Stats {
  const s: Stats = {
    kick: 0,
    control: 0,
    technique: 0,
    pressure: 0,
    physical: 0,
    intelligence: 0,
    agility: 0,
  };
  switch (position) {
    case "FW":
      s.kick += 10;
      s.control += 5;
      break;
    case "MF":
      s.control += 5;
      s.technique += 3;
      s.intelligence += 7;
      break;
    case "DF":
      s.pressure += 3;
      s.physical += 5;
      s.intelligence += 7;
      break;
    case "GK":
      s.physical += 5;
      s.agility += 10;
      break;
  }
  return s;
}

function computeCorrectedStats(
  baseStats: Stats,
  mainPosition: string,
  extraPosition: string,
  isSpecial: boolean,
): Stats {
  const common = getCommonBonus(mainPosition);
  const extra = getExtraBonus(extraPosition);
  const result: Stats = {
    kick: baseStats.kick + common.kick + extra.kick,
    control: baseStats.control + common.control + extra.control,
    technique: baseStats.technique + common.technique + extra.technique,
    pressure: baseStats.pressure + common.pressure + extra.pressure,
    physical: baseStats.physical + common.physical + extra.physical,
    intelligence:
      baseStats.intelligence + common.intelligence + extra.intelligence,
    agility: baseStats.agility + common.agility + extra.agility,
  };
  if (isSpecial) {
    result.kick += 4;
    result.technique -= 2;
    result.pressure += 4;
    result.physical += 2;
    result.intelligence -= 4;
    result.agility -= 4;
  }
  return result;
}

function statsToKey(s: Stats): string {
  return `${s.kick}_${s.control}_${s.technique}_${s.pressure}_${s.physical}_${s.intelligence}_${s.agility}`;
}

function totalStats(s: Stats): number {
  return (
    s.kick +
    s.control +
    s.technique +
    s.pressure +
    s.physical +
    s.intelligence +
    s.agility
  );
}

// =============================================
// Scraped データ取得
// =============================================

type ScrapedDetail = {
  detailUrl: string;
  characterNo: string;
  team: string[];
  worksFlags: Record<string, boolean>;
  howToGet: unknown[];
  generation: string;
  schoolYear: string;
  characterRole: string;
};

async function fetchScrapedDetails(): Promise<Map<string, ScrapedDetail>> {
  const res = await fetch(
    "http://localhost:3000/api/get-scraped-character-details",
  );
  if (!res.ok) {
    throw new Error(
      `スクレイピングデータの取得に失敗しました (HTTP ${res.status})`,
    );
  }
  const json = await res.json();
  const data: ScrapedDetail[] = json.dbData;
  const map = new Map<string, ScrapedDetail>();
  for (const d of data) {
    map.set(d.characterNo, d);
  }
  return map;
}

// =============================================
// メイン処理
// =============================================

async function main() {
  const supabase = createClient(
    requireEnv("DB_API_URL"),
    requireEnv("DB_SECRET_API_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // -----------------------------------------------
  // 1. Google Sheets から全シートのデータを取得
  // -----------------------------------------------
  console.log("[fetch] Google Sheets からデータ取得中...");

  const [
    charRecords,
    skillRecords,
    auraRecords,
    skillVoiceRecords,
    auraVoiceRecords,
  ] = await Promise.all([
    fetchSheetAsRecords("mined_characters"),
    fetchSheetAsRecords("mined_skills"),
    fetchSheetAsRecords("mined_auras"),
    fetchSheetAsRecords("mined_skill_voices"),
    fetchSheetAsRecords("mined_aura_voices"),
  ]);

  console.log(`  mined_characters: ${charRecords.length}件`);
  console.log(`  mined_skills:     ${skillRecords.length}件`);
  console.log(`  mined_auras:      ${auraRecords.length}件`);
  console.log(`  mined_skill_voices: ${skillVoiceRecords.length}件`);
  console.log(`  mined_aura_voices:  ${auraVoiceRecords.length}件`);

  // -----------------------------------------------
  // 2. Scraped character details を localhost から取得
  // -----------------------------------------------
  console.log("[fetch] localhost:3000 からスクレイピングデータ取得中...");
  const scrapedMap = await fetchScrapedDetails();
  console.log(`  scraped: ${scrapedMap.size}件`);

  // -----------------------------------------------
  // 3. ステータス補正計算 & status_types 準備
  // -----------------------------------------------
  const parsedChars = charRecords
    .filter((r) => r["character_id"])
    .map((r) => ({
      character_id: r["character_id"],
      position: r["position"] ?? "",
      sub_position: r["sub_position"] ?? "",
      baseStats: {
        kick: toInt(r["kick_legend"] ?? "0"),
        control: toInt(r["control_legend"] ?? "0"),
        technique: toInt(r["technique_legend"] ?? "0"),
        pressure: toInt(r["pressure_legend"] ?? "0"),
        physical: toInt(r["physical_legend"] ?? "0"),
        intelligence: toInt(r["intelligence_legend"] ?? "0"),
        agility: toInt(r["agility_legend"] ?? "0"),
      },
      record: r,
    }));

  // 各キャラの default / branch の補正後ステータスを計算
  type StatsEntry = { stats: Stats; origins: string[] };
  const statsMap = new Map<string, StatsEntry>();
  const charDefaultKeys: string[] = [];
  const charBranchKeys: string[] = [];

  for (const char of parsedChars) {
    const isSpecial = char.character_id === SPECIAL_CHARACTER_ID;

    // default: common(position) + extra(position)
    const defaultStats = computeCorrectedStats(
      char.baseStats,
      char.position,
      char.position,
      isSpecial,
    );
    const defaultKey = statsToKey(defaultStats);
    charDefaultKeys.push(defaultKey);
    if (!statsMap.has(defaultKey)) {
      statsMap.set(defaultKey, { stats: defaultStats, origins: [] });
    }
    statsMap.get(defaultKey)!.origins.push(`${char.position}_${char.position}`);

    // branch: common(position) + extra(sub_position)
    const branchStats = computeCorrectedStats(
      char.baseStats,
      char.position,
      char.sub_position,
      isSpecial,
    );
    const branchKey = statsToKey(branchStats);
    charBranchKeys.push(branchKey);
    if (!statsMap.has(branchKey)) {
      statsMap.set(branchKey, { stats: branchStats, origins: [] });
    }
    statsMap
      .get(branchKey)!
      .origins.push(`${char.position}_${char.sub_position}`);
  }

  // 名前の生成: プレフィックス(ポジション_サブポジション) + 番号
  // 同一プレフィックス内で合計ステータスが高いほど番号が若い
  function mostCommon(arr: string[]): string {
    const counts = new Map<string, number>();
    for (const s of arr) counts.set(s, (counts.get(s) ?? 0) + 1);
    let maxCount = 0;
    let maxStr = arr[0];
    for (const [s, c] of counts) {
      if (c > maxCount) {
        maxCount = c;
        maxStr = s;
      }
    }
    return maxStr;
  }

  const prefixGroups = new Map<
    string,
    { key: string; stats: Stats; total: number }[]
  >();
  for (const [key, entry] of statsMap) {
    const prefix = mostCommon(entry.origins);
    if (!prefixGroups.has(prefix)) prefixGroups.set(prefix, []);
    prefixGroups
      .get(prefix)!
      .push({ key, stats: entry.stats, total: totalStats(entry.stats) });
  }

  const nameMap = new Map<string, string>();
  for (const [prefix, entries] of prefixGroups) {
    entries.sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
    for (let i = 0; i < entries.length; i++) {
      nameMap.set(entries[i].key, `${prefix}_${i + 1}`);
    }
  }

  // -----------------------------------------------
  // 4. status_types テーブルに挿入
  // -----------------------------------------------
  const statusTypeRows = Array.from(statsMap.entries()).map(([key, entry]) => ({
    name: nameMap.get(key)!,
    rarity: "legend",
    image_url: null,
    ...entry.stats,
  }));
  statusTypeRows.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`[status_types] ${statusTypeRows.length}件を挿入します`);

  const insertedStatusTypes: {
    id: number;
    kick: number;
    control: number;
    technique: number;
    pressure: number;
    physical: number;
    intelligence: number;
    agility: number;
  }[] = [];

  for (let i = 0; i < statusTypeRows.length; i += BATCH_SIZE) {
    const batch = statusTypeRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("status_types")
      .insert(batch)
      .select(
        "id, kick, control, technique, pressure, physical, intelligence, agility",
      );
    if (error) throw new Error(`status_types insert failed: ${error.message}`);
    insertedStatusTypes.push(...(data ?? []));
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  // statsKey → status_types.id のマッピング
  const statsKeyToId = new Map<string, number>();
  for (const row of insertedStatusTypes) {
    const key = statsToKey({
      kick: row.kick,
      control: row.control,
      technique: row.technique,
      pressure: row.pressure,
      physical: row.physical,
      intelligence: row.intelligence,
      agility: row.agility,
    });
    statsKeyToId.set(key, row.id);
  }

  // -----------------------------------------------
  // 5. mined_characters テーブルに挿入
  // -----------------------------------------------
  const minedCharacterRows = parsedChars.map((char, idx) => {
    const r = char.record;
    const defaultId = statsKeyToId.get(charDefaultKeys[idx])!;
    const branchId = statsKeyToId.get(charBranchKeys[idx])!;

    const inagleNo = toNullableInt(r["inagle_no"]);
    const scraped = inagleNo === null ? undefined : scrapedMap.get(String(inagleNo));

    return {
      character_id: r["character_id"],
      full_name: r["full_name"] ?? "",
      full_name_ruby: r["full_name_ruby"] ?? "",
      nickname: r["nickname"] ?? "",
      nickname_ruby: r["nickname_ruby"] ?? "",
      inagle_no: inagleNo,
      position: r["position"] ?? "",
      sub_position: r["sub_position"] ?? "",
      element: r["element"] ?? "",
      gender: r["gender"] ?? "",
      physique: r["physique"] ?? "",
      build_type: r["build_type"] ?? "",
      description: r["description"] ?? "",
      image_url: r["image_url"] ?? "",
      is_obtainable: (() => {
        const raw = r["is_obtainable"] ?? "";
        return raw === "" ? true : toBoolean(raw);
      })(),
      normal_slot_1: toNullableString(r["normal_slot_1"]),
      normal_slot_2: toNullableString(r["normal_slot_2"]),
      normal_slot_3: toNullableString(r["normal_slot_3"]),
      normal_default_slot_4: toNullableString(r["normal_default_slot_4"]),
      normal_default_slot_5: toNullableString(r["normal_default_slot_5"]),
      normal_default_slot_6: toNullableString(r["normal_default_slot_6"]),
      normal_branch_slot_4: toNullableString(r["normal_branch_slot_4"]),
      normal_branch_slot_5: toNullableString(r["normal_branch_slot_5"]),
      normal_branch_slot_6: toNullableString(r["normal_branch_slot_6"]),
      legend_status_type_default: defaultId,
      legend_status_type_branch: branchId,
      inagle_url: scraped?.detailUrl ?? null,
      team: scraped?.team ?? null,
      works_flags: scraped?.worksFlags ?? null,
      how_to_get: scraped?.howToGet ?? null,
      generation: scraped?.generation ?? null,
      school_year: scraped?.schoolYear ?? null,
      character_role: scraped?.characterRole ?? null,
    };
  });

  console.log(`[mined_characters] ${minedCharacterRows.length}件を挿入します`);
  for (let i = 0; i < minedCharacterRows.length; i += BATCH_SIZE) {
    const batch = minedCharacterRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mined_characters").insert(batch);
    if (error)
      throw new Error(
        `mined_characters insert failed (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${error.message}`,
      );
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  // -----------------------------------------------
  // 6. mined_skills テーブルに挿入
  // -----------------------------------------------
  const skillRows = skillRecords
    .filter((r) => r["skill_id"])
    .map((r) => ({
      skill_id: r["skill_id"],
      name: r["name"] ?? "",
      name_ruby: r["name_ruby"] ?? "",
      type: r["type"] ?? "",
      option: toNullableString(r["option"]),
      element: r["element"] ?? "",
      number_of_people: toInt(r["number_of_people"] ?? "0"),
      foul_rate: toInt(r["foul_rate"] ?? "0"),
      description: r["description"] ?? "",
      tension_normal: toNullableInt(r["tension_normal"]),
      power_normal: toNullableInt(r["power_normal"]),
      recast_normal: toNullableInt(r["recast_normal"]),
      tension_mm: toNullableInt(r["tension_mm"]),
      power_mm: toNullableInt(r["power_mm"]),
      recast_mm: toNullableInt(r["recast_mm"]),
      tension_or: toNullableInt(r["tension_or"]),
      power_or: toNullableInt(r["power_or"]),
      recast_or: toNullableInt(r["recast_or"]),
      tension_keshin: toNullableInt(r["tension_keshin"]),
      power_keshin: toNullableInt(r["power_keshin"]),
      recast_keshin: toNullableInt(r["recast_keshin"]),
      tension_soul: toNullableInt(r["tension_soul"]),
      power_soul: toNullableInt(r["power_soul"]),
      recast_soul: toNullableInt(r["recast_soul"]),
      is_normal: toBoolean(r["is_normal"] ?? ""),
      is_mm: toBoolean(r["is_mm"] ?? ""),
      is_or: toBoolean(r["is_or"] ?? ""),
      is_keshin: toBoolean(r["is_keshin"] ?? ""),
      is_soul: toBoolean(r["is_soul"] ?? ""),
      aura_id: toNullableString(r["aura_id"]),
      where_to_get: toNullableString(r["where_to_get"]),
      image_url: toNullableString(r["image_url"]),
    }));

  console.log(`[mined_skills] ${skillRows.length}件を挿入します`);
  for (let i = 0; i < skillRows.length; i += BATCH_SIZE) {
    const batch = skillRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mined_skills").insert(batch);
    if (error) throw new Error(`mined_skills insert failed: ${error.message}`);
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  // -----------------------------------------------
  // 7. mined_auras テーブルに挿入
  // -----------------------------------------------
  const auraRows = auraRecords
    .filter((r) => r["aura_id"])
    .map((r) => ({
      aura_id: r["aura_id"],
      name: r["name"] ?? "",
      name_ruby: r["name_ruby"] ?? "",
      type: r["type"] ?? "",
      category: toNullableString(r["category"]),
      element: r["element"] ?? "",
      description: r["description"] ?? "",
    }));

  console.log(`[mined_auras] ${auraRows.length}件を挿入します`);
  for (let i = 0; i < auraRows.length; i += BATCH_SIZE) {
    const batch = auraRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mined_auras").insert(batch);
    if (error) throw new Error(`mined_auras insert failed: ${error.message}`);
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  // -----------------------------------------------
  // 8. mined_skill_voices テーブルに挿入 (id は auto-increment)
  // -----------------------------------------------
  const skillVoiceRows = skillVoiceRecords
    .filter((r) => r["character_id"] && r["skill_id"])
    .map((r) => ({
      character_id: r["character_id"],
      skill_id: r["skill_id"],
    }));

  console.log(`[mined_skill_voices] ${skillVoiceRows.length}件を挿入します`);
  for (let i = 0; i < skillVoiceRows.length; i += BATCH_SIZE) {
    const batch = skillVoiceRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mined_skill_voices").insert(batch);
    if (error)
      throw new Error(`mined_skill_voices insert failed: ${error.message}`);
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  // -----------------------------------------------
  // 9. mined_aura_voices テーブルに挿入 (id は auto-increment)
  // -----------------------------------------------
  const auraVoiceRows = auraVoiceRecords
    .filter((r) => r["character_id"] && r["aura_id"])
    .map((r) => ({
      character_id: r["character_id"],
      aura_id: r["aura_id"],
    }));

  console.log(`[mined_aura_voices] ${auraVoiceRows.length}件を挿入します`);
  for (let i = 0; i < auraVoiceRows.length; i += BATCH_SIZE) {
    const batch = auraVoiceRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("mined_aura_voices").insert(batch);
    if (error)
      throw new Error(`mined_aura_voices insert failed: ${error.message}`);
    console.log(
      `  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length}件完了`,
    );
  }

  console.log("\n全てのテーブルへの挿入が完了しました！");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

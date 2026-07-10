// 2026-07-06 アップデートでのボイス差分 (スキルボイス + 超次元ボイス)
// スキルボイスは local-scripts/compare-voice-sheets/compare.ts の出力 (diff-skill-voices.csv) から生成
// 超次元ボイスは比較用の旧シートが存在しなかったため、手動で特定した1件のみ

export type VoiceDiffEntry = {
  character_id: string;
  kind: "skill" | "aura";
  id: string;
};

/**
 * このアップデートで追加された新キャラクター
 * (ボイス差分ではなく新キャラとしてページに表示する)
 */
export const NEW_CHARACTER_IDS = [
  "c11901150", // 円堂 守
  "c11901160", // 鬼道 有人
  "c11902360", // 吹雪 士郎
];

/** 追加されたボイス (10件) */
export const ADDED_VOICES: VoiceDiffEntry[] = [
  { character_id: "c01000010", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c05024610", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c05029460", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c07110020", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c11500500", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c11901150", kind: "skill", id: "whk00555" }, // 円堂 守 - ゴッドキャッチＦＴ
  { character_id: "c11902360", kind: "skill", id: "whd00240" }, // 吹雪 士郎 - アイスグランド
  { character_id: "c11902360", kind: "skill", id: "whs00440" }, // 吹雪 士郎 - エターナルブリザード
  { character_id: "c11902360", kind: "skill", id: "whs00840" }, // 吹雪 士郎 - ワイバーンブリザード
  { character_id: "c11901150", kind: "aura", id: "wkk00510" }, // 円堂 守 - 魔神グレイト (化身)
];

/** 削除されたボイス (0件) */
export const REMOVED_VOICES: VoiceDiffEntry[] = [];

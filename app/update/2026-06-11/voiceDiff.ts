// 2026-06-11 アップデートでのボイス差分 (スキルボイス + 超次元ボイス)
// local-scripts/compare-voice-sheets/compare.ts の出力 (diff-skill-voices.csv, diff-aura-voices.csv) から生成

export type VoiceDiffEntry = {
  character_id: string;
  kind: "skill" | "aura";
  id: string;
};

/** 追加されたボイス (82件) */
export const ADDED_VOICES: VoiceDiffEntry[] = [
  { character_id: "c01000010", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c01002610", kind: "skill", id: "whk00490" }, // 響木 正剛 - ゴッドハンドＥＶ
  { character_id: "c01010930", kind: "skill", id: "whk00490" }, // 多摩野 五郎 - ゴッドハンドＥＶ
  { character_id: "c02022210", kind: "skill", id: "whk00490" }, // 響木 正剛 - ゴッドハンドＥＶ
  { character_id: "c02023810", kind: "skill", id: "whk00490" }, // 立向居 勇気 - ゴッドハンドＥＶ
  { character_id: "c02024750", kind: "skill", id: "whk00490" }, // 木野 秋 - ゴッドハンドＥＶ
  { character_id: "c03032210", kind: "skill", id: "whk00490" }, // ロココ・ウルパ - ゴッドハンドＥＶ
  { character_id: "c04000050", kind: "skill", id: "whk00490" }, // 西園 信助 - ゴッドハンドＥＶ
  { character_id: "c05024610", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c05024930", kind: "skill", id: "whd01030" }, // サン - マグネットドロー
  { character_id: "c05024930", kind: "skill", id: "whs01700" }, // サン - エボリューション
  { character_id: "c05024930", kind: "skill", id: "whs01970" }, // サン - プラズマボール
  { character_id: "c05028070", kind: "skill", id: "whk00490" }, // 西園 信助 - ゴッドハンドＥＶ
  { character_id: "c05029460", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c05029710", kind: "skill", id: "whd01390" }, // エルシャール・レイトン - ウイニングロジック
  { character_id: "c05029710", kind: "skill", id: "who00040" }, // エルシャール・レイトン - イリュージョンボール
  { character_id: "c05029710", kind: "skill", id: "whs00970" }, // エルシャール・レイトン - エクスカリバー
  { character_id: "c05029720", kind: "skill", id: "who00630" }, // ルーク・トライトン - ウルトラムーン
  { character_id: "c05029720", kind: "skill", id: "who00690" }, // ルーク・トライトン - トリックボール
  { character_id: "c05029720", kind: "skill", id: "whs01200" }, // ルーク・トライトン - ペガサスショット
  { character_id: "c06037430", kind: "skill", id: "whk00490" }, // 立向居 勇気 - ゴッドハンドＥＶ
  { character_id: "c06039010", kind: "skill", id: "whk00490" }, // 円堂 大介 - ゴッドハンドＥＶ
  { character_id: "c06039020", kind: "skill", id: "whk00490" }, // 響木 正剛 - ゴッドハンドＥＶ
  { character_id: "c07010120", kind: "skill", id: "whk00490" }, // 京野 球太 - ゴッドハンドＥＶ
  { character_id: "c07110010", kind: "skill", id: "whk00490" }, // 坂野上 昇 - ゴッドハンドＥＶ
  { character_id: "c07110020", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c11260010", kind: "skill", id: "whk00490" }, // 円堂 ハル - ゴッドハンドＥＶ
  { character_id: "c11500500", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c11801010", kind: "skill", id: "whk00490" }, // 円堂 大介 - ゴッドハンドＥＶ
  { character_id: "c11802040", kind: "skill", id: "whk00490" }, // 伐天 泰作 - ゴッドハンドＥＶ
  { character_id: "c11803100", kind: "skill", id: "whk00490" }, // 荒矢 大介 - ゴッドハンドＥＶ
  { character_id: "c11807260", kind: "skill", id: "whk00490" }, // 木野 秋 - ゴッドハンドＥＶ
  { character_id: "c11807270", kind: "skill", id: "whk00490" }, // 響木 正剛 - ゴッドハンドＥＶ
  { character_id: "c11901150", kind: "skill", id: "whk00010" }, // 円堂 守 - ゴッドハンド
  { character_id: "c11901150", kind: "skill", id: "whk00030" }, // 円堂 守 - 熱血パンチ
  { character_id: "c11901150", kind: "skill", id: "whk00080" }, // 円堂 守 - トリプルディフェンス
  { character_id: "c11901150", kind: "skill", id: "whk00210" }, // 円堂 守 - 爆裂パンチ
  { character_id: "c11901150", kind: "skill", id: "whk00220" }, // 円堂 守 - マジン・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk00440" }, // 円堂 守 - 正義の鉄拳
  { character_id: "c11901150", kind: "skill", id: "whk00470" }, // 円堂 守 - マジン・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk00480" }, // 円堂 守 - ゴッドハンド
  { character_id: "c11901150", kind: "skill", id: "whk00490" }, // 円堂 守 - ゴッドハンドＥＶ
  { character_id: "c11901150", kind: "skill", id: "whk00500" }, // 円堂 守 - イジゲン・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk00510" }, // 円堂 守 - 怒りの鉄槌
  { character_id: "c11901150", kind: "skill", id: "whk00550" }, // 円堂 守 - ゴッドキャッチ
  { character_id: "c11901150", kind: "skill", id: "whk00690" }, // 円堂 守 - オメガ・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk00850" }, // 円堂 守 - ゴッドハンドＶ
  { character_id: "c11901150", kind: "skill", id: "whk00910" }, // 円堂 守 - マジン・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk00980" }, // 円堂 守 - グレイト・ザ・ハンド
  { character_id: "c11901150", kind: "skill", id: "whk01090" }, // 円堂 守 - ゴッドハンドＷ
  { character_id: "c11901150", kind: "skill", id: "whk01710" }, // 円堂 守 - ゴッドハンド
  { character_id: "c11901150", kind: "skill", id: "whs00050" }, // 円堂 守 - イナズマ１号
  { character_id: "c11901150", kind: "skill", id: "whs00070" }, // 円堂 守 - グレネードショット
  { character_id: "c11901150", kind: "skill", id: "whs00380" }, // 円堂 守 - イナズマブレイク
  { character_id: "c11901150", kind: "skill", id: "whs00410" }, // 円堂 守 - ザ・フェニックス
  { character_id: "c11901150", kind: "skill", id: "whs00470" }, // 円堂 守 - デスゾーン２
  { character_id: "c11901150", kind: "skill", id: "whs00480" }, // 円堂 守 - ジ・アース
  { character_id: "c11901150", kind: "skill", id: "whs00680" }, // 円堂 守 - トライペガサス
  { character_id: "c11901150", kind: "skill", id: "whs00690" }, // 円堂 守 - イナズマ１号落とし
  { character_id: "c11901150", kind: "skill", id: "whs00910" }, // 円堂 守 - メガトンヘッド
  { character_id: "c11901150", kind: "skill", id: "whs01220" }, // 円堂 守 - ジェットストリーム
  { character_id: "c11901150", kind: "skill", id: "whs02070" }, // 円堂 守 - ギガトンヘッド
  { character_id: "c11901150", kind: "skill", id: "whs10180" }, // 円堂 守 - イナズマブレイク
  { character_id: "c11901160", kind: "skill", id: "who00040" }, // 鬼道 有人 - イリュージョンボール
  { character_id: "c11901160", kind: "skill", id: "who00480" }, // 鬼道 有人 - キラーフィールズ
  { character_id: "c11901160", kind: "skill", id: "whs00020" }, // 鬼道 有人 - ツインブースト
  { character_id: "c11901160", kind: "skill", id: "whs00080" }, // 鬼道 有人 - デスゾーン
  { character_id: "c11901160", kind: "skill", id: "whs00380" }, // 鬼道 有人 - イナズマブレイク
  { character_id: "c11901160", kind: "skill", id: "whs00400" }, // 鬼道 有人 - 皇帝ペンギン２号
  { character_id: "c11901160", kind: "skill", id: "whs00470" }, // 鬼道 有人 - デスゾーン２
  { character_id: "c11901160", kind: "skill", id: "whs00770" }, // 鬼道 有人 - ツインブーストＦ
  { character_id: "c11901160", kind: "skill", id: "whs01050" }, // 鬼道 有人 - 皇帝ペンギン３号
  { character_id: "c11901160", kind: "skill", id: "whs01110" }, // 鬼道 有人 - ビッグバン
  { character_id: "c11901160", kind: "skill", id: "whs01380" }, // 鬼道 有人 - プライムレジェンド
  { character_id: "c11901160", kind: "skill", id: "whs02010" }, // 鬼道 有人 - ラスト・デスゾーン
  { character_id: "c11901160", kind: "skill", id: "whs10180" }, // 鬼道 有人 - イナズマブレイク
  { character_id: "c11903020", kind: "skill", id: "whk00490" }, // 鬼瓦 源五郎 - ゴッドハンドＥＶ
  { character_id: "c04003500", kind: "aura", id: "wmm00150" }, // 白竜 - ミキシトランス・劉備 (ミキシトランス)
  { character_id: "c05029450", kind: "aura", id: "wmm00150" }, // 白竜 - ミキシトランス・劉備 (ミキシトランス)
  { character_id: "c11600020", kind: "aura", id: "wks02050" }, // フェイ・ルーン - 光速騎士ロビン (化身)
  { character_id: "c11901150", kind: "aura", id: "wkk00510" }, // 円堂 守 - 魔神グレイト (化身)
  { character_id: "c11908170", kind: "aura", id: "wmm00150" }, // 白竜 - ミキシトランス・劉備 (ミキシトランス)
];

/** 削除されたボイス (1件) */
export const REMOVED_VOICES: VoiceDiffEntry[] = [
  { character_id: "c11600020", kind: "aura", id: "wks00760" }, // フェイ・ルーン - 光速闘士ロビン (化身)
];

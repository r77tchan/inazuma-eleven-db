"use client";

import type { MinedSkillDetailView } from "@/lib/types";

// =============================================
// アイコンマッピング
// =============================================

const ELEMENT_ICON: Record<string, string> = {
  風: "/img/icons/elements/wind.webp",
  林: "/img/icons/elements/forest.webp",
  火: "/img/icons/elements/fire.webp",
  山: "/img/icons/elements/mountain.webp",
};

const TYPE_ICON: Record<string, string> = {
  シュート技: "/img/icons/skills/shoot.webp",
  オフェンス技: "/img/icons/skills/offense.webp",
  ディフェンス技: "/img/icons/skills/defense.webp",
  キーパー技: "/img/icons/skills/keeper.webp",
};

const ELEMENT_BG: Record<string, string> = {
  風: "#2476b1",
  林: "#329b36",
  火: "#9f2121",
  山: "#976626",
  無: "#5f2181",
};

// option DB値 → 表示名
const OPTION_LABEL: Record<string, string> = {
  ロングシュート: "ロングシュート",
  カウンターシュート: "カウンターシュート",
  シュートブロック: "シュートブロック",
  キャッチ: "キャッチ",
  パンチング: "パンチング",
};

// option → アイコン
const OPTION_ICON: Record<string, string> = {
  ロングシュート: "/img/icons/skills/long_shoot.webp",
  カウンターシュート: "/img/icons/skills/counter_shoot.webp",
  シュートブロック: "/img/icons/skills/shoot_block.webp",
};

// バリアント定義
const VARIANT_KEYS = ["normal", "or", "keshin", "soul", "mm"] as const;
type VariantKey = (typeof VARIANT_KEYS)[number];

const VARIANT_LABELS: Record<VariantKey, string> = {
  normal: "通常",
  or: "オーバーライド",
  keshin: "化身",
  soul: "ソウル",
  mm: "ミキシマックス",
};

function getActiveVariants(skill: MinedSkillDetailView) {
  return VARIANT_KEYS.filter((v) => skill[`is_${v}`]);
}

// inagle URL生成
function buildInagleSkillUrl(name: string): string {
  const json = JSON.stringify({ name_filter: [name] });
  const bytes = new TextEncoder().encode(json);
  const xored = new Uint8Array(bytes.map((b) => b ^ 0xff));
  let b64 = btoa(String.fromCharCode(...xored));
  b64 = b64.replace(/\+/g, "-").replace(/\//g, "_");
  return `https://zukan.inazuma.jp/skill/?q=${encodeURIComponent(b64)}&per_page=50`;
}

// =============================================
// メインコンポーネント
// =============================================

export default function SkillDetailContent({
  skill,
}: {
  skill: MinedSkillDetailView;
}) {
  const bgColor = ELEMENT_BG[skill.element] ?? ELEMENT_BG["無"];
  const activeVariants = getActiveVariants(skill);
  const optionLabel = skill.option ? OPTION_LABEL[skill.option] : null;
  const optionIcon = skill.option ? OPTION_ICON[skill.option] : null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <div className="flex flex-col gap-4">
        {/* ===== ヘッダー: アイコン + 技名 ===== */}
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3"
          style={{
            backgroundImage: `linear-gradient(90deg, #0004, ${bgColor})`,
          }}
        >
          {TYPE_ICON[skill.type] && (
            <img
              src={TYPE_ICON[skill.type]}
              alt={skill.type}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0"
            />
          )}
          {ELEMENT_ICON[skill.element] && (
            <img
              src={ELEMENT_ICON[skill.element]}
              alt={skill.element}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
          )}
          <h1 className="text-2xl font-bold">{skill.name}</h1>
        </div>

        {/* ===== 画像 ===== */}
        <div className="flex justify-center">
          <div
            className="bg-a-700 overflow-hidden rounded-lg"
            style={{ width: "min(320px, 80vw)", aspectRatio: "16/9" }}
          >
            {skill.image_url && (
              <img
                src={skill.image_url}
                alt={skill.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </div>
        </div>

        {/* ===== 説明テキスト ===== */}
        <div className="border-a-700 bg-a-900 rounded-lg border p-4">
          <p className="text-a-200 leading-relaxed whitespace-pre-wrap">
            {skill.description.split(/\\n|\n/).map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* ===== 消費テンション + 威力 ===== */}
        <div className="flex justify-center gap-12">
          {activeVariants.length <= 1 ? (
            // 単一バリアント: シンプル表示
            <>
              <div className="flex items-baseline gap-1 text-orange-400">
                <span className="text-sm">消費テンション</span>
                <span className="text-3xl font-semibold tabular-nums">
                  {skill[`tension_${activeVariants[0] ?? "normal"}`] ?? "??"}
                </span>
                <span className="text-sm">T</span>
              </div>
              <div className="text-a-0 flex items-baseline gap-1">
                <span className="text-sm">威力</span>
                <span className="text-3xl font-semibold tabular-nums">
                  {skill[`power_${activeVariants[0] ?? "normal"}`] ?? "??"}
                </span>
              </div>
            </>
          ) : (
            // 複数バリアント: テーブル表示
            <table className="text-sm">
              <thead>
                <tr className="text-a-400">
                  <th className="px-3 py-1 text-left font-medium" />
                  <th className="px-3 py-1 text-center font-medium text-orange-400">
                    消費T
                  </th>
                  <th className="px-3 py-1 text-center font-medium">威力</th>
                  <th className="px-3 py-1 text-center font-medium">
                    リキャスト
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeVariants.map((v) => (
                  <tr key={v} className="border-a-800 border-t">
                    <td className="text-a-400 px-3 py-1.5 text-xs">
                      {VARIANT_LABELS[v]}
                    </td>
                    <td className="px-3 py-1.5 text-center text-orange-400 tabular-nums">
                      <span className="text-xl font-semibold">
                        {skill[`tension_${v}`] ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center tabular-nums">
                      <span className="text-xl font-semibold">
                        {skill[`power_${v}`] ?? "-"}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center tabular-nums">
                      <span className="text-xl font-semibold">
                        {skill[`recast_${v}`] ?? "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ===== 特殊効果 ===== */}
        {optionLabel && (
          <section>
            <h2 className="border-a-400 mb-3 border-b pb-1 text-lg font-bold">
              特殊効果
            </h2>
            <div className="bg-a-900 rounded-lg p-4">
              <div className="flex items-center gap-2">
                {optionIcon && (
                  <img
                    src={optionIcon}
                    alt={optionLabel}
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0"
                  />
                )}
                <span className="text-base font-semibold">{optionLabel}</span>
              </div>
            </div>
          </section>
        )}

        {/* ===== 補足情報 ===== */}
        <section>
          <h2 className="border-a-400 mb-3 border-b pb-1 text-lg font-bold">
            補足情報
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <InfoCell label="人数" value={`${skill.number_of_people}人`} />
            <InfoCell label="ファウル率" value={`${skill.foul_rate}%`} />
            {activeVariants.length <= 1 ? (
              <InfoCell
                label="リキャスト時間"
                value={
                  skill[`recast_${activeVariants[0] ?? "normal"}`] != null
                    ? `${skill[`recast_${activeVariants[0] ?? "normal"}`]}秒`
                    : "-"
                }
              />
            ) : (
              <InfoCell label="リキャスト時間" value="上記テーブル参照" />
            )}
          </div>
        </section>

        {/* ===== 入手方法 ===== */}
        <section>
          <h2 className="border-a-400 mb-3 border-b pb-1 text-lg font-bold">
            入手方法
          </h2>
          <div className="bg-a-900 rounded-lg p-4">
            {skill.where_to_get ? (
              <p className="text-a-200 leading-relaxed whitespace-pre-wrap">
                {skill.where_to_get.split(/\\n|\n/).map((line, i) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-a-500">情報なし</p>
            )}
          </div>
        </section>

        {/* ===== inagleリンク ===== */}
        <section>
          <h2 className="border-a-400 mb-3 border-b pb-1 text-lg font-bold">
            inagleリンク
          </h2>
          <div className="bg-a-900 rounded-lg p-4">
            <a
              href={buildInagleSkillUrl(skill.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm break-all text-blue-500 underline underline-offset-2"
            >
              「{skill.name}」を検索
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

// =============================================
// InfoCell
// =============================================

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-a-700 bg-a-900 rounded-lg border p-3 text-center">
      <div className="text-a-400 mb-1 text-xs">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

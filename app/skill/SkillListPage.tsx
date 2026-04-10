"use client";

import Link from "next/link";
import {
  useSkillList,
  ELEMENT_VALUES,
  VARIANT_KEYS,
  VARIANT_LABELS,
  TYPE_VALUES,
  OPTION_VALUES,
  SORT_FIELD_OPTIONS,
  mapOptionToFilter,
  type SortFieldKey,
  type SkillDisplayRow,
} from "./useSkillList";

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

const OPTION_ICON: Record<string, string> = {
  ロング: "/img/icons/skills/long_shoot.webp",
  カウンター: "/img/icons/skills/counter_shoot.webp",
  ブロック: "/img/icons/skills/shoot_block.webp",
};

// 属性ごとの背景グラデーション色
const ELEMENT_BG: Record<string, string> = {
  風: "#2476b1",
  林: "#329b36",
  火: "#9f2121",
  山: "#976626",
  無: "#5f2181",
};

// =============================================
// FilterSection
// =============================================

function FilterSection({
  label,
  color,
  children,
}: {
  label: string;
  color: "red" | "blue" | "green";
  children: React.ReactNode;
}) {
  const colorClasses = {
    red: "border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
    blue: "border-blue-200 bg-blue-50 text-blue-500 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
    green:
      "border-green-200 bg-green-50 text-green-500 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400",
  };

  return (
    <div>
      <p
        className={`mb-1 inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClasses[color]}`}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

// =============================================
// ToggleButton
// =============================================

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-sm font-medium ${
        active
          ? "border-a-0 bg-a-0 text-a-1000"
          : "text-a-400 hover:text-a-200 bg-a-800 hover:bg-a-700 hover:border-a-500 border-transparent"
      }`}
    >
      {children}
    </button>
  );
}

// =============================================
// Skill カード（PC / SP共通）
// =============================================

function SkillCard({ row }: { row: SkillDisplayRow }) {
  const bgColor = ELEMENT_BG[row.element] ?? ELEMENT_BG["無"];
  const optionLabel = mapOptionToFilter(row.option);

  return (
    <Link
      href={`/skill/${row.skill_id}`}
      className="bg-a-950 border-a-800 hover:border-a-600 flex flex-col overflow-hidden rounded-lg border hover:shadow-lg"
    >
      {/* ヘッダー: 属性グラデーション + 種類アイコン + 属性アイコン + 名前 + option */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{
          backgroundImage: `linear-gradient(90deg, #0004, ${bgColor})`,
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {TYPE_ICON[row.type] && (
            <img
              src={TYPE_ICON[row.type]}
              alt={row.type}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
          )}
          {ELEMENT_ICON[row.element] && (
            <img
              src={ELEMENT_ICON[row.element]}
              alt={row.element}
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
          )}
          <span className="truncate text-base font-bold">{row.name}</span>
        </div>
        {optionLabel && OPTION_ICON[optionLabel] && (
          <img
            src={OPTION_ICON[optionLabel]}
            alt={optionLabel}
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
        )}
      </div>

      {/* ボディ: 画像 + 説明 + ステータス */}
      <div className="flex gap-2 p-2 md:gap-3 md:p-3">
        {/* 画像: レスポンシブ */}
        <div
          className="bg-a-700 h-25 shrink-0 overflow-hidden rounded md:h-full"
          style={{ width: "min(224px, 30vw)", aspectRatio: "16 / 9" }}
        >
          {row.image_url && (
            <img
              src={row.image_url}
              alt={row.name}
              className="h-full w-full object-cover object-center"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
        </div>

        {/* テキスト部分 */}
        <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-2">
          <p className="text-a-300 line-clamp-4 text-xs md:text-sm">
            {row.description.split(/\\n|\n/).map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className="mt-auto flex items-baseline gap-3 text-xs md:gap-4 md:text-sm">
            <div className="flex items-baseline gap-1 text-orange-400">
              <span>消費</span>
              <span className="text-lg font-semibold tabular-nums md:text-xl">
                {row.tension ?? "-"}
              </span>
              <span>T</span>
            </div>
            <div className="text-a-0 flex items-baseline gap-1">
              <span>威力</span>
              <span className="text-lg font-semibold tabular-nums md:text-xl">
                {row.power ?? "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// =============================================
// メイン コンポーネント
// =============================================

export default function SkillListPage() {
  const {
    isLoading,
    error,
    searchTerm,
    handleSearchChange,
    sortField,
    sortDirection,
    handleSortChange,
    filters,
    setFilter,
    toggleFilter,
    tensionValues,
    visibleData,
    totalCount,
    filteredCount,
    hasMore,
    sentinelRef,
  } = useSkillList();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">必殺技一覧</h1>

      {/* 検索 + フィルタ */}
      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="名前で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-a-700 bg-a-950 text-a-0 placeholder:text-a-500 hover:border-a-400 mb-4 w-full cursor-pointer rounded-lg border px-4 py-2 text-base focus:cursor-text focus:border-blue-500 focus:outline-none"
        />

        {/* 赤: 属性 */}
        <FilterSection label="属性" color="red">
          {ELEMENT_VALUES.map((v) => (
            <ToggleButton
              key={v}
              active={filters.element.includes(v)}
              onClick={() => toggleFilter("element", v)}
            >
              {ELEMENT_ICON[v] ? (
                <img
                  src={ELEMENT_ICON[v]}
                  alt={v}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              ) : (
                <span className="block h-4 w-4 rounded-sm bg-purple-600" />
              )}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 赤: 人数 */}
        <FilterSection label="人数" color="red">
          {[1, 2, 3, 4].map((v) => (
            <ToggleButton
              key={v}
              active={filters.numberOfPeople.includes(v)}
              onClick={() => toggleFilter("numberOfPeople", v)}
            >
              {v}人
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 青: 種類1 (ラジオ) */}
        <FilterSection label="種類1" color="blue">
          <ToggleButton
            active={filters.variant === "all"}
            onClick={() => setFilter("variant", "all")}
          >
            全て
          </ToggleButton>
          {VARIANT_KEYS.map((v) => (
            <ToggleButton
              key={v}
              active={filters.variant === v}
              onClick={() => setFilter("variant", v)}
            >
              {VARIANT_LABELS[v]}
            </ToggleButton>
          ))}
          <ToggleButton
            active={filters.variant === "realSkill"}
            onClick={() => setFilter("variant", "realSkill")}
          >
            リアルスキル
          </ToggleButton>
        </FilterSection>

        {/* 青: 種類2 (ラジオ) */}
        <FilterSection label="種類2" color="blue">
          <ToggleButton
            active={filters.type === null}
            onClick={() => setFilter("type", null)}
          >
            全て
          </ToggleButton>
          {TYPE_VALUES.map((v) => (
            <ToggleButton
              key={v}
              active={filters.type === v}
              onClick={() => setFilter("type", v)}
            >
              {v}
            </ToggleButton>
          ))}
          <div className="h-0 basis-full" />
          <ToggleButton
            active={filters.option === null}
            onClick={() => setFilter("option", null)}
          >
            全て
          </ToggleButton>
          {OPTION_VALUES.map((v) => (
            <ToggleButton
              key={v}
              active={filters.option === v}
              onClick={() => setFilter("option", v)}
            >
              {OPTION_ICON[v] ? (
                <img
                  src={OPTION_ICON[v]}
                  alt={v}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              ) : (
                v
              )}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 青: テンション (ラジオ) */}
        {tensionValues.length > 0 && (
          <FilterSection label="テンション" color="blue">
            <ToggleButton
              active={filters.tension === null}
              onClick={() => setFilter("tension", null)}
            >
              全て
            </ToggleButton>
            {tensionValues.map((v) => (
              <ToggleButton
                key={v}
                active={filters.tension === v}
                onClick={() => setFilter("tension", v)}
              >
                {v}
              </ToggleButton>
            ))}
          </FilterSection>
        )}

        {/* 緑: 並べ替え */}
        <FilterSection label="並べ替え" color="green">
          {SORT_FIELD_OPTIONS.map(({ key, label }) => (
            <ToggleButton
              key={key}
              active={sortField === key}
              onClick={() => handleSortChange(key as SortFieldKey)}
            >
              {label}
              {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
            </ToggleButton>
          ))}
        </FilterSection>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="border-a-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-a-500 text-base">データを読み込み中...</p>
        </div>
      )}

      {/* エラー */}
      {error && (
        <p className="py-12 text-center text-base text-red-500">{error}</p>
      )}

      {/* データ */}
      {!isLoading && !error && (
        <>
          <p className="text-a-500 mb-4 text-base">
            {filteredCount !== totalCount
              ? `${filteredCount.toLocaleString()} 件ヒット（全 ${totalCount.toLocaleString()} 件）`
              : `全 ${totalCount.toLocaleString()} 件`}
          </p>

          {/* スキルリスト: PC 2列 / タブレット・SP 1列 */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visibleData.map((row) => (
              <SkillCard key={`${row.skill_id}_${row.variant}`} row={row} />
            ))}
          </div>

          {/* 無限スクロール用のセンチネル */}
          <div ref={sentinelRef} className="h-4" />

          {hasMore && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="border-a-500 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-a-500 text-base">読み込み中...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

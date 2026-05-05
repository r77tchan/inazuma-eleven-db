"use client";

import Link from "next/link";
import {
  useCharacterList,
  POSITION_VALUES,
  ELEMENT_VALUES,
  PHYSIQUE_ORDER,
  BUILD_VALUES,
  BUILD_MAP,
  SORT_FIELD_OPTIONS,
  SECONDARY_SORT_OPTIONS,
  type AbillerMode,
  type ObtainableFilter,
  type SortFieldKey,
  type CharacterDisplayRow,
} from "./useCharacterList";

// =============================================
// アイコンマッピング
// =============================================

const POSITION_ICON: Record<string, string> = {
  FW: "/img/icons/position/fw.webp",
  MF: "/img/icons/position/mf.webp",
  DF: "/img/icons/position/df.webp",
  GK: "/img/icons/position/gk.webp",
};

const ELEMENT_ICON: Record<string, string> = {
  風: "/img/icons/elements/wind.webp",
  林: "/img/icons/elements/forest.webp",
  火: "/img/icons/elements/fire.webp",
  山: "/img/icons/elements/mountain.webp",
};

function buildIconSrc(
  buildType: string,
): { light: string; dark: string } | null {
  const key = BUILD_MAP[buildType];
  if (!key) return null;
  return {
    light: `/img/icons/builds/${key}.webp`,
    dark: `/img/icons/builds/${key}-dark.webp`,
  };
}

function physiqueIconSrc(physique: string): string {
  return `/img/icons/gender/${physique}.png`;
}

// =============================================
// SafeImg — 画像が存在しない場合にグレー四角を表示
// =============================================

function SafeImg({
  src,
  alt,
  width,
  height,
  className,
  loading,
}: {
  src: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  return (
    <span
      className={`${className ?? ""} bg-a-700 inline-block overflow-hidden`}
      style={{ width, height }}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-full w-full object-cover"
          loading={loading}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </span>
  );
}

// =============================================
// ソートで選択中のフィールドのラベルを取得
// =============================================

function getSortLabel(key: SortFieldKey | null): string | null {
  if (!key) return null;
  if (key === "inagle_no") return null; // No はヘッダー左列に表示しない
  return SORT_FIELD_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

function getSortLabelForSP(key: SortFieldKey | null): string | null {
  if (!key) return null;
  if (key === "inagle_no") return null;
  return SORT_FIELD_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

function getSortValue(
  row: CharacterDisplayRow,
  key: SortFieldKey | null,
): number | null {
  if (!key || key === "inagle_no") return null; // No は左列に表示しない
  return row[key];
}

// =============================================
// BuildIconImg （light/dark 切り替え）
// =============================================

function BuildIconImg({
  buildType,
  size,
  className,
  invert = false,
}: {
  buildType: string;
  size: number;
  className?: string;
  invert?: boolean;
}) {
  const srcs = buildIconSrc(buildType);
  if (!srcs)
    return (
      <span
        className={className}
        style={{ display: "inline-block", width: size, height: size }}
      />
    );
  // Light theme: dark icon / Dark theme: light icon
  // invert=true (active button): swap
  const lightSrc = invert ? srcs.light : srcs.dark;
  const darkSrc = invert ? srcs.dark : srcs.light;
  return (
    <>
      <img
        src={darkSrc}
        alt={buildType}
        width={size}
        height={size}
        className={`hidden dark:block ${className ?? ""}`}
      />
      <img
        src={lightSrc}
        alt={buildType}
        width={size}
        height={size}
        className={`block dark:hidden ${className ?? ""}`}
      />
    </>
  );
}

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
      className={`cursor-pointer rounded-md border px-2.5 py-1 text-sm font-medium ${
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
// PC 行ヘッダー
// =============================================

function PCHeader({ sortLabel }: { sortLabel: string | null }) {
  return (
    <div className="col-span-full grid grid-cols-subgrid items-center gap-x-2.5 px-3 pb-2 text-sm text-nowrap">
      <span className="text-center">{sortLabel ?? ""}</span>
      <span />
      <span>名前</span>
      <span>メイン</span>
      <span>サブ</span>
      <span>属性</span>
      <span>体格</span>
      <span>メインビルド</span>
      <span>カテゴリ</span>
      <span>所属</span>
      <span className="text-right">No</span>
    </div>
  );
}

// =============================================
// PC 行
// =============================================

function PCRow({
  row,
  sortField,
}: {
  row: CharacterDisplayRow;
  sortField: SortFieldKey | null;
}) {
  const sortValue = getSortValue(row, sortField);
  const hasBuild = !!BUILD_MAP[row.build_type];

  return (
    <Link
      href={`/character/${row.character_id}`}
      prefetch={false}
      className="border-a-800 col-span-full grid grid-cols-subgrid items-center gap-x-2.5 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-[#3273dc40]"
    >
      {/* ソート値 */}
      <span className="text-a-0 text-center font-bold tabular-nums">
        {sortValue != null ? Math.round(sortValue) : ""}
      </span>

      {/* アイコン画像 */}
      <SafeImg
        src={row.image_url}
        alt={row.full_name}
        width={80}
        height={80}
        className="mx-auto rounded"
        loading="lazy"
      />

      {/* 名前 + ニックネーム */}
      <div className="min-w-0">
        <p className="text-a-0 truncate font-bold">{row.full_name}</p>
        {row.nickname && (
          <p className="text-a-500 truncate text-xs">{row.nickname}</p>
        )}
      </div>

      {/* メインポジション */}
      <img
        src={POSITION_ICON[row.position]}
        alt={row.position}
        width={24}
        height={24}
        className="h-6 w-6"
      />

      {/* サブポジション */}
      <img
        src={POSITION_ICON[row.sub_position]}
        alt={row.sub_position}
        width={24}
        height={24}
        className="h-6 w-6 opacity-60"
      />

      {/* 属性 */}
      <img
        src={ELEMENT_ICON[row.element]}
        alt={row.element}
        width={24}
        height={24}
        className="h-6 w-6"
      />

      {/* 体格 */}
      <SafeImg
        src={physiqueIconSrc(row.physique)}
        alt={row.physique}
        width={24}
        height={24}
        className="rounded"
      />

      {/* メインビルド (icon + text) */}
      <div className="flex items-center gap-1">
        <BuildIconImg
          buildType={row.build_type}
          size={24}
          className="h-6 w-6 shrink-0"
        />
        <span className="truncate">{hasBuild ? row.build_type : ""}</span>
      </div>

      {/* カテゴリ */}
      <span className="truncate">{row.character_role ?? ""}</span>

      {/* 所属 */}
      <span className="truncate">{row.team ?? ""}</span>

      {/* No */}
      <span className="text-right tabular-nums">
        {row.inagle_no != null ? row.inagle_no : ""}
      </span>
    </Link>
  );
}

// =============================================
// SP カード
// =============================================

function SPCard({
  row,
  sortField,
}: {
  row: CharacterDisplayRow;
  sortField: SortFieldKey | null;
}) {
  const sortValue = getSortValue(row, sortField);
  const sortLabel = getSortLabelForSP(sortField);

  return (
    <Link
      href={`/character/${row.character_id}`}
      prefetch={false}
      className="border-a-800 bg-a-950 flex gap-2.5 border-b p-2 last:border-b-0 hover:bg-[#3273dc40]"
    >
      {/* 左: アイコン（大きめ） */}
      <SafeImg
        src={row.image_url}
        alt={row.full_name}
        width={80}
        height={80}
        className="shrink-0 self-stretch rounded"
        loading="lazy"
      />

      {/* 中央: 3行 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* Row 1: No（右寄せ） */}
        <div className="text-a-500 text-right text-xs tabular-nums">
          {row.inagle_no != null ? `No.${row.inagle_no}` : "\u00A0"}
        </div>

        {/* Row 2: 名前 + ニックネーム */}
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="text-a-0 truncate text-base font-bold">
            {row.full_name}
          </span>
          {row.nickname && (
            <span className="text-a-500 shrink-0 text-xs">{row.nickname}</span>
          )}
        </div>

        {/* Row 3: アイコン群 + ソート値 */}
        <div className="flex items-center gap-1.5">
          <img
            src={POSITION_ICON[row.position]}
            alt={row.position}
            width={18}
            height={18}
            className="h-4.5 w-4.5"
          />
          <img
            src={POSITION_ICON[row.sub_position]}
            alt={row.sub_position}
            width={18}
            height={18}
            className="h-4.5 w-4.5 opacity-60"
          />
          <img
            src={ELEMENT_ICON[row.element]}
            alt={row.element}
            width={18}
            height={18}
            className="h-4.5 w-4.5"
          />
          <SafeImg
            src={physiqueIconSrc(row.physique)}
            alt={row.physique}
            width={20}
            height={20}
            className="rounded"
          />
          <BuildIconImg
            buildType={row.build_type}
            size={18}
            className="h-4.5 w-4.5"
          />
          {sortValue != null && sortLabel && (
            <span className="text-a-300 tracking-0 ml-1 text-xs tabular-nums">
              {sortLabel} {Math.round(sortValue)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// =============================================
// メイン コンポーネント
// =============================================

export default function CharacterListPage() {
  const {
    isLoading,
    error,
    searchTerm,
    handleSearchChange,
    abillerMode,
    setAbillerMode,
    obtainableFilter,
    setObtainableFilter,
    sortField,
    sortDirection,
    handleSortChange,
    secondarySort,
    handleSecondarySortChange,
    filters,
    toggleFilter,
    visibleData,
    totalCount,
    filteredCount,
    hasMore,
    sentinelRef,
    resetAll,
  } = useCharacterList();

  const availablePhysiques = PHYSIQUE_ORDER as readonly string[];
  const sortLabel = getSortLabel(sortField);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">キャラクター一覧</h1>

      {/* 検索 */}
      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="名前で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-a-700 bg-a-950 text-a-0 placeholder:text-a-500 hover:border-a-400 mb-4 w-full cursor-pointer rounded-lg border px-4 py-2 text-base focus:cursor-text focus:border-blue-500 focus:outline-none"
        />

        {/* 赤フィルタ群 */}
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <FilterSection label="メインポジション" color="red">
            {POSITION_VALUES.map((v) => (
              <ToggleButton
                key={v}
                active={filters.mainPosition.includes(v)}
                onClick={() => toggleFilter("mainPosition", v)}
              >
                <img
                  src={POSITION_ICON[v]}
                  alt={v}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </ToggleButton>
            ))}
          </FilterSection>

          <FilterSection label="サブポジション" color="red">
            {POSITION_VALUES.map((v) => (
              <ToggleButton
                key={v}
                active={filters.subPosition.includes(v)}
                onClick={() => toggleFilter("subPosition", v)}
              >
                <img
                  src={POSITION_ICON[v]}
                  alt={v}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </ToggleButton>
            ))}
          </FilterSection>

          <FilterSection label="属性" color="red">
            {ELEMENT_VALUES.map((v) => (
              <ToggleButton
                key={v}
                active={filters.element.includes(v)}
                onClick={() => toggleFilter("element", v)}
              >
                <img
                  src={ELEMENT_ICON[v]}
                  alt={v}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              </ToggleButton>
            ))}
          </FilterSection>

          <div className="w-full">
            <FilterSection label="体格" color="red">
              {availablePhysiques.map((v) => (
                <ToggleButton
                  key={v}
                  active={filters.physique.includes(v)}
                  onClick={() => toggleFilter("physique", v)}
                >
                  <img
                    src={physiqueIconSrc(v)}
                    alt={v}
                    width={18}
                    height={18}
                    className="h-4.5 w-4.5"
                  />
                </ToggleButton>
              ))}
            </FilterSection>
          </div>

          <FilterSection label="メインビルド" color="red">
            {BUILD_VALUES.map((v) => {
              const isActive = filters.build.includes(v);
              return (
                <ToggleButton
                  key={v}
                  active={isActive}
                  onClick={() => toggleFilter("build", v)}
                >
                  <BuildIconImg
                    buildType={v}
                    size={16}
                    className="h-4 w-4"
                    invert={isActive}
                  />
                </ToggleButton>
              );
            })}
          </FilterSection>
        </div>

        {/* 青: アビラー */}
        <FilterSection label="アビラー" color="blue">
          {(
            [
              ["default", "通常"],
              ["branch", "分岐"],
              ["both", "同時"],
            ] as [AbillerMode, string][]
          ).map(([mode, label]) => (
            <ToggleButton
              key={mode}
              active={abillerMode === mode}
              onClick={() => setAbillerMode(mode)}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 青: 入手可不可 */}
        <FilterSection label="入手可不可" color="blue">
          {(
            [
              ["obtainable", "入手可"],
              ["unobtainable", "入手不可"],
              ["any", "不問"],
            ] as [ObtainableFilter, string][]
          ).map(([value, label]) => (
            <ToggleButton
              key={value}
              active={obtainableFilter === value}
              onClick={() => setObtainableFilter(value)}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 緑: 並べ替え（第1ソート + 昇降順） */}
        <FilterSection label="並べ替え" color="green">
          {SORT_FIELD_OPTIONS.map(({ key, label }) => (
            <ToggleButton
              key={key}
              active={sortField === key}
              onClick={() => handleSortChange(key)}
            >
              {label}
              {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 第二ソート */}
        <div className="flex flex-wrap gap-1 pt-1">
          {SECONDARY_SORT_OPTIONS.map(({ key, label }) => (
            <ToggleButton
              key={key}
              active={secondarySort === key}
              onClick={() => handleSecondarySortChange(key)}
            >
              {label}
            </ToggleButton>
          ))}
        </div>

        {/* リセット */}
        <div className="flex">
          <button
            onClick={resetAll}
            className="text-a-400 hover:text-a-0 hover:bg-a-800 cursor-pointer rounded-md border border-transparent px-3 py-1 text-sm font-medium transition-colors hover:border-red-500"
          >
            すべてリセット
          </button>
        </div>
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

          {/* PC: グリッド表示 */}
          <div className="hidden grid-cols-[73px_minmax(90px,auto)_minmax(0,auto)_minmax(52px,auto)_minmax(52px,auto)_minmax(52px,auto)_minmax(52px,auto)_minmax(0,auto)_minmax(0,auto)_minmax(0,auto)_50px] md:grid">
            <PCHeader sortLabel={sortLabel} />
            <div className="border-a-800 bg-a-950 col-span-full grid grid-cols-subgrid overflow-hidden rounded-lg border">
              {visibleData.map((row) => (
                <PCRow
                  key={`${row.character_id}_${row.variant}`}
                  row={row}
                  sortField={sortField}
                />
              ))}
            </div>
          </div>

          {/* SP: カード表示 */}
          <div className="border-a-800 bg-a-900 overflow-hidden rounded-lg border md:hidden">
            {visibleData.map((row) => (
              <SPCard
                key={`${row.character_id}_${row.variant}`}
                row={row}
                sortField={sortField}
              />
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

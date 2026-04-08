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

function buildIconSrc(buildType: string): string | null {
  const key = BUILD_MAP[buildType];
  return key ? `/img/icons/builds/${key}.webp` : null;
}

function physiqueIconSrc(physique: string): string {
  return `/img/icons/gender/${physique}.png`;
}

// =============================================
// ソートで選択中のフィールドのラベルを取得
// =============================================

function getSortLabel(key: SortFieldKey | null): string | null {
  if (!key) return null;
  return SORT_FIELD_OPTIONS.find((o) => o.key === key)?.label ?? null;
}

function getSortValue(
  row: CharacterDisplayRow,
  key: SortFieldKey | null,
): number | null {
  if (!key) return null;
  return row[key];
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
      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-a-0 text-a-1000"
          : "text-a-400 hover:text-a-200 bg-a-900 hover:bg-a-800"
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
    <div className="text-a-500 border-a-800 hidden border-b pb-1 text-xs md:grid md:grid-cols-[2.5rem_3rem_1fr_2rem_2rem_1.5rem_2.5rem_2rem_4rem_6rem_3rem_3rem] md:items-center md:gap-2">
      <span className="text-right">{sortLabel ?? ""}</span>
      <span></span>
      <span>名前</span>
      <span>メイン</span>
      <span>サブ</span>
      <span>属性</span>
      <span>体格</span>
      <span>ビルド</span>
      <span>カテゴリ</span>
      <span>所属</span>
      <span className="text-right">No</span>
      <span>アビラー</span>
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
  const buildSrc = buildIconSrc(row.build_type);

  return (
    <Link
      href={`/character/${row.character_id}`}
      className="text-a-300 hover:bg-a-950 border-a-900 hidden border-b py-1.5 text-xs md:grid md:grid-cols-[2.5rem_3rem_1fr_2rem_2rem_1.5rem_2.5rem_2rem_4rem_6rem_3rem_3rem] md:items-center md:gap-2"
    >
      {/* ソート値 */}
      <span className="text-a-0 text-right text-sm font-bold tabular-nums">
        {sortValue != null ? Math.round(sortValue) : ""}
      </span>

      {/* アイコン画像 */}
      <img
        src={row.image_url}
        alt={row.full_name}
        width={40}
        height={40}
        className="h-10 w-10 rounded object-cover"
        loading="lazy"
      />

      {/* 名前 + ニックネーム */}
      <div className="min-w-0">
        <p className="text-a-0 truncate text-sm font-bold">{row.full_name}</p>
        {row.nickname && (
          <p className="text-a-500 truncate text-[10px]">{row.nickname}</p>
        )}
      </div>

      {/* メインポジション */}
      <img
        src={POSITION_ICON[row.position]}
        alt={row.position}
        width={20}
        height={20}
        className="h-5 w-5"
      />

      {/* サブポジション */}
      <img
        src={POSITION_ICON[row.sub_position]}
        alt={row.sub_position}
        width={20}
        height={20}
        className="h-5 w-5 opacity-60"
      />

      {/* 属性 */}
      <img
        src={ELEMENT_ICON[row.element]}
        alt={row.element}
        width={16}
        height={16}
        className="h-4 w-4"
      />

      {/* 体格 */}
      <img
        src={physiqueIconSrc(row.physique)}
        alt={row.physique}
        width={24}
        height={24}
        className="h-6 w-6"
      />

      {/* メインビルド */}
      {buildSrc ? (
        <img
          src={buildSrc}
          alt={row.build_type}
          width={20}
          height={20}
          className="h-5 w-5"
        />
      ) : (
        <span className="inline-block h-5 w-5" />
      )}

      {/* カテゴリ */}
      <span className="truncate">{row.character_role ?? ""}</span>

      {/* 所属 */}
      <span className="truncate">{row.team ?? ""}</span>

      {/* No */}
      <span className="text-right tabular-nums">
        {row.inagle_no != null ? row.inagle_no : ""}
      </span>

      {/* アビラー */}
      <span>{row.variant === "default" ? "通常" : "分岐"}</span>
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
  const buildSrc = buildIconSrc(row.build_type);

  return (
    <Link
      href={`/character/${row.character_id}`}
      className="border-a-900 hover:bg-a-950 flex gap-2 border-b py-1.5 md:hidden"
    >
      {/* 左: アイコン（大きめ） */}
      <img
        src={row.image_url}
        alt={row.full_name}
        width={56}
        height={56}
        className="h-14 w-14 self-stretch rounded object-cover"
        loading="lazy"
      />

      {/* 中央 */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        {/* 上段: 名前 + ニックネーム */}
        <div className="min-w-0">
          <p className="text-a-0 truncate text-sm font-bold">{row.full_name}</p>
          {row.nickname && (
            <p className="text-a-500 truncate text-[10px]">{row.nickname}</p>
          )}
        </div>

        {/* 下段: アイコン群 + ソート値 */}
        <div className="flex items-center gap-1.5">
          <img
            src={POSITION_ICON[row.position]}
            alt={row.position}
            width={16}
            height={16}
            className="h-4 w-4"
          />
          <img
            src={ELEMENT_ICON[row.element]}
            alt={row.element}
            width={14}
            height={14}
            className="h-3.5 w-3.5"
          />
          <img
            src={physiqueIconSrc(row.physique)}
            alt={row.physique}
            width={18}
            height={18}
            className="h-4.5 w-4.5"
          />
          {buildSrc && (
            <img
              src={buildSrc}
              alt={row.build_type}
              width={16}
              height={16}
              className="h-4 w-4"
            />
          )}
          {sortValue != null && (
            <span className="text-a-0 ml-1 text-xs font-bold tabular-nums">
              {Math.round(sortValue)}
            </span>
          )}
        </div>
      </div>

      {/* 右上: No */}
      <div className="text-a-500 shrink-0 self-start text-[10px] tabular-nums">
        {row.inagle_no != null ? `No.${row.inagle_no}` : ""}
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
    sortField,
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
  } = useCharacterList();

  // ここだけの目的で allData にアクセスしたいが hook で直に返さないので
  // visibleData から physique を集める代わりに PHYSIQUE_ORDER をそのまま使う
  const availablePhysiques = PHYSIQUE_ORDER as readonly string[];

  const sortLabel = getSortLabel(sortField);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">キャラクター一覧</h1>

      {/* 検索 */}
      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="名前で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-a-700 bg-a-950 text-a-0 placeholder:text-a-500 focus:border-a-400 w-full rounded-lg border px-4 py-2 focus:outline-none"
        />

        {/* 赤フィルタ群（同色は横幅に余裕があれば横並び） */}
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

          <FilterSection label="メインビルド" color="red">
            {BUILD_VALUES.map((v) => {
              const src = buildIconSrc(v);
              return (
                <ToggleButton
                  key={v}
                  active={filters.build.includes(v)}
                  onClick={() => toggleFilter("build", v)}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={v}
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  ) : (
                    v
                  )}
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

        {/* 緑: 並べ替え */}
        <FilterSection label="並べ替え" color="green">
          {SORT_FIELD_OPTIONS.map(({ key, label }) => (
            <ToggleButton
              key={key}
              active={sortField === key}
              onClick={() => handleSortChange(key)}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* 第二ソート（ラベルなし、少し上にスペース） */}
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
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="border-a-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-a-500 text-sm">データを読み込み中...</p>
        </div>
      )}

      {/* エラー */}
      {error && <p className="py-12 text-center text-red-500">{error}</p>}

      {/* データ */}
      {!isLoading && !error && (
        <>
          <p className="text-a-500 mb-4 text-sm">
            {filteredCount !== totalCount
              ? `${filteredCount.toLocaleString()} 件ヒット（全 ${totalCount.toLocaleString()} 件）`
              : `全 ${totalCount.toLocaleString()} 件`}
          </p>

          {/* PC: ヘッダー */}
          <PCHeader sortLabel={sortLabel} />

          {/* リスト */}
          <div>
            {visibleData.map((row) => (
              <div key={`${row.character_id}_${row.variant}`}>
                <PCRow row={row} sortField={sortField} />
                <SPCard row={row} sortField={sortField} />
              </div>
            ))}
          </div>

          {/* 無限スクロール用のセンチネル */}
          <div ref={sentinelRef} className="h-4" />

          {hasMore && (
            <div className="flex items-center justify-center gap-2 py-4">
              <div className="border-a-500 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              <p className="text-a-500 text-sm">読み込み中...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

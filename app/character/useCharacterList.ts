"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApiGetCharactersListSuccess } from "@/app/api/get-characters-list/route";
import type { ApiFailure } from "@/lib/api";
import type { MinedCharacterListView } from "@/lib/types";

const PAGE_SIZE = 50;

// ======================================
// アビラー (通常 / 分岐 / 同時)
// ======================================

export type AbillerMode = "default" | "branch" | "both";

export type CharacterDisplayRow = MinedCharacterListView & {
  variant: "default" | "branch";
  shoot_at: number;
  focus_at: number;
  focus_df: number;
  scramble_at: number;
  scramble_df: number;
  wall_df: number;
  kp: number;
};

function expandRows(
  list: MinedCharacterListView[],
  mode: AbillerMode,
): CharacterDisplayRow[] {
  const rows: CharacterDisplayRow[] = [];
  for (const c of list) {
    if (mode === "default" || mode === "both") {
      rows.push({
        ...c,
        variant: "default",
        shoot_at: c.default_shoot_at,
        focus_at: c.default_focus_at,
        focus_df: c.default_focus_df,
        scramble_at: c.default_scramble_at,
        scramble_df: c.default_scramble_df,
        wall_df: c.default_wall_df,
        kp: c.default_kp,
      });
    }
    if (mode === "branch" || mode === "both") {
      rows.push({
        ...c,
        variant: "branch",
        shoot_at: c.branch_shoot_at,
        focus_at: c.branch_focus_at,
        focus_df: c.branch_focus_df,
        scramble_at: c.branch_scramble_at,
        scramble_df: c.branch_scramble_df,
        wall_df: c.branch_wall_df,
        kp: c.branch_kp,
      });
    }
  }
  return rows;
}

// ======================================
// フィルタ定義
// ======================================

export const POSITION_VALUES = ["FW", "MF", "DF", "GK"] as const;
export const ELEMENT_VALUES = ["風", "林", "火", "山"] as const;

// 体格の順序（並べ替え用 — 必要に応じて順序を変更してください）
export const PHYSIQUE_ORDER = [
  "body_male",
  "body_female",
  "body_small",
  "body_smallfemale",
  "body_smallfat",
  "body_smallfatfemale",
  "body_tall",
  "body_tallfemale",
  "body_tallmuscle",
  "body_tallmusclefemale",
  "body_muscle",
  "body_musclefemale",
  "body_musclethick",
  "body_big",
  "body_bigfemale",
  "body_bigthick",
  "body_bigthickfemale",
] as const;

export const BUILD_MAP: Record<string, string> = {
  正義: "justice",
  テンション: "tension",
  カウンター: "counter",
  キズナ: "bond",
  ラフプレー: "rough_play",
  ひっさつ: "breach",
};

export const BUILD_VALUES = Object.keys(BUILD_MAP);

// ======================================
// ソート定義
// ======================================

export const SORT_FIELD_OPTIONS = [
  { key: "shoot_at", label: "シュート" },
  { key: "focus_at", label: "フォーカスAT" },
  { key: "focus_df", label: "フォーカスDF" },
  { key: "scramble_at", label: "スクランブルAT" },
  { key: "scramble_df", label: "スクランブルDF" },
  { key: "wall_df", label: "城壁" },
  { key: "kp", label: "KP" },
] as const;

export type SortFieldKey = (typeof SORT_FIELD_OPTIONS)[number]["key"];

export const SECONDARY_SORT_OPTIONS = [
  { key: "inagle_no", label: "No" },
  { key: "element", label: "属性" },
  { key: "physique", label: "体格" },
] as const;

export type SecondarySortKey = (typeof SECONDARY_SORT_OPTIONS)[number]["key"];

// ======================================
// フィルタ状態
// ======================================

export type Filters = {
  mainPosition: string[];
  subPosition: string[];
  element: string[];
  physique: string[];
  build: string[];
};

// ======================================
// 検索ヘルパー
// ======================================

function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u30A1-\u30F6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60),
    )
    .replace(/[\uFF01-\uFF5E]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    );
}

// ======================================
// ソートヘルパー
// ======================================

const ELEMENT_ORDER: Record<string, number> = { 風: 0, 林: 1, 火: 2, 山: 3 };

function physiqueIndex(p: string): number {
  const idx = PHYSIQUE_ORDER.indexOf(p as (typeof PHYSIQUE_ORDER)[number]);
  return idx === -1 ? 999 : idx;
}

// ======================================
// Hook
// ======================================

export function useCharacterList() {
  const [allData, setAllData] = useState<MinedCharacterListView[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [abillerMode, setAbillerMode] = useState<AbillerMode>("default");
  const [sortField, setSortField] = useState<SortFieldKey | null>(null);
  const [secondarySort, setSecondarySort] =
    useState<SecondarySortKey>("inagle_no");
  const [filters, setFilters] = useState<Filters>({
    mainPosition: [],
    subPosition: [],
    element: [],
    physique: [],
    build: [],
  });
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // --- データ取得 ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/get-characters-list");
        if (res.ok) {
          const json: ApiGetCharactersListSuccess = await res.json();
          setAllData(json.data);
        } else {
          const errJson: ApiFailure = await res.json();
          setError(errJson.errorMessage);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- トグル ---
  const toggleFilter = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
    setDisplayCount(PAGE_SIZE);
  }, []);

  const handleSortChange = useCallback((key: SortFieldKey) => {
    setSortField((prev) => (prev === key ? null : key));
    setDisplayCount(PAGE_SIZE);
  }, []);

  const handleSecondarySortChange = useCallback((key: SecondarySortKey) => {
    setSecondarySort(key);
    setDisplayCount(PAGE_SIZE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setDisplayCount(PAGE_SIZE);
  }, []);

  // --- フィルタリング ---
  const filteredData = useMemo(() => {
    if (!allData) return [];
    let result = allData;

    if (filters.mainPosition.length > 0) {
      result = result.filter((c) => filters.mainPosition.includes(c.position));
    }
    if (filters.subPosition.length > 0) {
      result = result.filter((c) =>
        filters.subPosition.includes(c.sub_position),
      );
    }
    if (filters.element.length > 0) {
      result = result.filter((c) => filters.element.includes(c.element));
    }
    if (filters.physique.length > 0) {
      result = result.filter((c) => filters.physique.includes(c.physique));
    }
    if (filters.build.length > 0) {
      result = result.filter((c) => filters.build.includes(c.build_type));
    }

    if (searchTerm) {
      const term = normalizeForSearch(searchTerm);
      result = result.filter(
        (c) =>
          normalizeForSearch(c.full_name).includes(term) ||
          normalizeForSearch(c.nickname).includes(term),
      );
    }

    return result;
  }, [allData, filters, searchTerm]);

  // --- アビラー展開 ---
  const expandedRows = useMemo(
    () => expandRows(filteredData, abillerMode),
    [filteredData, abillerMode],
  );

  // --- ソート ---
  const sortedData = useMemo(() => {
    const rows = [...expandedRows];

    rows.sort((a, b) => {
      // primary sort
      if (sortField) {
        const av = a[sortField];
        const bv = b[sortField];
        if (av !== bv) return bv - av; // 降順
      }

      // secondary sort (常に昇順)
      if (secondarySort === "inagle_no") {
        const an = a.inagle_no ?? Infinity;
        const bn = b.inagle_no ?? Infinity;
        if (an !== bn) return an - bn;
      } else if (secondarySort === "element") {
        const ae = ELEMENT_ORDER[a.element] ?? 99;
        const be = ELEMENT_ORDER[b.element] ?? 99;
        if (ae !== be) return ae - be;
      } else if (secondarySort === "physique") {
        const ap = physiqueIndex(a.physique);
        const bp = physiqueIndex(b.physique);
        if (ap !== bp) return ap - bp;
      }

      // tie-break: character_id
      return a.character_id.localeCompare(b.character_id);
    });

    return rows;
  }, [expandedRows, sortField, secondarySort]);

  // --- 表示件数 ---
  const visibleData = useMemo(
    () => sortedData.slice(0, displayCount),
    [sortedData, displayCount],
  );

  const hasMore = displayCount < sortedData.length;

  // --- Intersection Observer ---
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  return {
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
    totalCount: allData?.length ?? 0,
    filteredCount: filteredData.length,
    hasMore,
    sentinelRef,
  };
}

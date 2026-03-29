"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApiGetDbDataSuccess } from "@/app/api/get-db-data/route";
import type { ApiFailure } from "@/lib/api";
import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

const PAGE_SIZE = 50;

export const INFO_FIELD_OPTIONS = [
  { key: "position", label: "ポジション" },
  { key: "element", label: "属性" },
  { key: "gender", label: "性別" },
  { key: "totalStatus", label: "総合" },
  { key: "shootAT", label: "シュート" },
  { key: "focusAT", label: "フォーカスAT" },
  { key: "focusDF", label: "フォーカスDF" },
  { key: "scrambleAT", label: "スクランブルAT" },
  { key: "scrambleDF", label: "スクランブルDF" },
  { key: "wallDF", label: "城壁" },
  { key: "KP", label: "KP" },
] as const;

export type InfoFieldKey = (typeof INFO_FIELD_OPTIONS)[number]["key"];

const DEFAULT_INFO_FIELDS: InfoFieldKey[] = [
  "position",
  "element",
  "gender",
  "totalStatus",
];

export const SORT_FIELD_OPTIONS = [
  { key: "characterNo", label: "No" },
  { key: "totalStatus", label: "総合" },
  { key: "shootAT", label: "シュート" },
  { key: "focusAT", label: "フォーカスAT" },
  { key: "focusDF", label: "フォーカスDF" },
  { key: "scrambleAT", label: "スクランブルAT" },
  { key: "scrambleDF", label: "スクランブルDF" },
  { key: "wallDF", label: "城壁" },
  { key: "KP", label: "KP" },
] as const;

export type SortFieldKey = (typeof SORT_FIELD_OPTIONS)[number]["key"];
export type SortDirection = "asc" | "desc";

export const FILTER_OPTIONS = {
  position: {
    label: "ポジション",
    values: ["FW", "MF", "DF", "GK"],
  },
  element: {
    label: "属性",
    values: ["風", "林", "火", "山"],
  },
  gender: {
    label: "性別",
    values: ["男", "女"],
  },
} as const;

export type FilterKey = keyof typeof FILTER_OPTIONS;

/** カタカナ→ひらがな、全角英数→半角英数に変換して小文字化（表記揺れ不問検索用） */
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

export function useCharacterPage() {
  const [allData, setAllData] = useState<
    ScrapedCharacterDetailWithMetrics[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [nameDisplay, setNameDisplay] = useState<"fullName" | "nickname">(
    "fullName",
  );
  const [selectedInfoFields, setSelectedInfoFields] =
    useState<InfoFieldKey[]>(DEFAULT_INFO_FIELDS);
  const [sortField, setSortField] = useState<SortFieldKey>("characterNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>({
    position: [],
    element: [],
    gender: [],
  });
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const toggleInfoField = useCallback((key: InfoFieldKey) => {
    setSelectedInfoFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const handleSortChange = useCallback(
    (key: SortFieldKey) => {
      if (sortField === key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(key);
        setSortDirection(key === "characterNo" ? "asc" : "desc");
      }
      setDisplayCount(PAGE_SIZE);
    },
    [sortField],
  );

  const toggleFilter = useCallback((key: FilterKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
    setDisplayCount(PAGE_SIZE);
  }, []);

  // 全データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get-db-data");
        if (response.ok) {
          const data: ApiGetDbDataSuccess = await response.json();
          setAllData(data.dbData);
        } else {
          const errorData: ApiFailure = await response.json();
          setError(errorData.errorMessage);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // 名前検索でフィルタ
  const filteredData = useMemo(() => {
    if (!allData) return [];
    let result = allData;

    // フィルタ適用
    for (const key of Object.keys(filters) as FilterKey[]) {
      const selected = filters[key];
      if (selected.length > 0) {
        result = result.filter((c) => selected.includes(c[key]));
      }
    }

    // 名前検索
    if (searchTerm) {
      const term = normalizeForSearch(searchTerm);
      result = result.filter(
        (c) =>
          normalizeForSearch(c.fullName.name).includes(term) ||
          normalizeForSearch(c.fullName.ruby).includes(term) ||
          c.nickname.some(
            (n) =>
              normalizeForSearch(n.name).includes(term) ||
              normalizeForSearch(n.ruby).includes(term),
          ),
      );
    }

    return result;
  }, [allData, searchTerm, filters]);

  // ソート
  const sortedData = useMemo(() => {
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const aVal =
        sortField === "characterNo" ? Number(a.characterNo) : a[sortField];
      const bVal =
        sortField === "characterNo" ? Number(b.characterNo) : b[sortField];
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * dir;
    });
  }, [filteredData, sortField, sortDirection]);

  // 表示するデータ（無限スクロール）
  const visibleData = useMemo(
    () => sortedData.slice(0, displayCount),
    [sortedData, displayCount],
  );

  const hasMore = displayCount < sortedData.length;

  // 検索語変更時に表示数リセット
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setDisplayCount(PAGE_SIZE);
  }, []);

  // IntersectionObserver で無限スクロール
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
    nameDisplay,
    setNameDisplay,
    selectedInfoFields,
    toggleInfoField,
    sortField,
    sortDirection,
    handleSortChange,
    filters,
    toggleFilter,
    visibleData,
    totalCount: allData?.length ?? 0,
    filteredCount: filteredData.length,
    hasMore,
    sentinelRef,
  };
}

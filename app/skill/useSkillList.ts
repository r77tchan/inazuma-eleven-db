"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApiGetSkillsListSuccess } from "@/app/api/get-skills-list/route";
import type { ApiFailure } from "@/lib/api";
import type { MinedSkillListView } from "@/lib/types";

const PAGE_SIZE = 50;

// ======================================
// 種類1 展開 (is_normal, is_or, is_keshin, is_soul, is_mm)
// ======================================

export const VARIANT_KEYS = ["normal", "or", "keshin", "soul", "mm"] as const;

export type VariantKey = (typeof VARIANT_KEYS)[number];

export const VARIANT_LABELS: Record<VariantKey, string> = {
  normal: "通常",
  or: "オーバーライド",
  keshin: "化身",
  soul: "ソウル",
  mm: "ミキシマックス",
};

export type SkillDisplayRow = MinedSkillListView & {
  variant: VariantKey;
  tension: number | null;
  power: number | null;
};

function expandRows(
  list: MinedSkillListView[],
  variantFilter: VariantKey[],
): SkillDisplayRow[] {
  const rows: SkillDisplayRow[] = [];
  const variants: VariantKey[] =
    variantFilter.length > 0 ? variantFilter : VARIANT_KEYS.slice();

  for (const s of list) {
    for (const v of variants) {
      const flag = s[`is_${v}`];
      if (!flag) continue;
      rows.push({
        ...s,
        variant: v,
        tension: s[`tension_${v}`],
        power: s[`power_${v}`],
      });
    }
  }
  return rows;
}

// ======================================
// フィルタ定義
// ======================================

export const ELEMENT_VALUES = ["風", "林", "火", "山"] as const;

// 種類2: type フィールドの値
export const TYPE_VALUES = [
  "シュート技",
  "オフェンス技",
  "ディフェンス技",
  "キーパー技",
] as const;

// option のフィルタ値
export const OPTION_VALUES = [
  "ロング",
  "カウンター",
  "ブロック",
  "キャッチ",
  "パンチング",
] as const;

// リアルスキル = 威力30 の技
const REAL_SKILL_POWER = 30;

// option DB値 → フィルタ値 のマッピング
const OPTION_MAP: Record<string, string> = {
  ロングシュート: "ロング",
  カウンターシュート: "カウンター",
  シュートブロック: "ブロック",
  キャッチ: "キャッチ",
  パンチング: "パンチング",
};

export function mapOptionToFilter(option: string | null): string | null {
  if (!option) return null;
  return OPTION_MAP[option] ?? null;
}

// option → type の自動選択マッピング
const OPTION_TYPE_MAP: Record<string, string> = {
  ロング: "シュート技",
  カウンター: "シュート技",
  ブロック: "ディフェンス技",
  キャッチ: "キーパー技",
  パンチング: "キーパー技",
};

// ======================================
// ソート定義
// ======================================

export const SORT_FIELD_OPTIONS = [
  { key: "name", label: "名前" },
  { key: "power", label: "威力" },
  { key: "element", label: "属性" },
] as const;

export type SortFieldKey = (typeof SORT_FIELD_OPTIONS)[number]["key"];
export type SortDirection = "asc" | "desc";

// ======================================
// フィルタ状態
// ======================================

export type VariantSelection = VariantKey | "realSkill";

export type Filters = {
  element: string[];
  variant: VariantSelection;
  type: string;
  option: string | null;
  tension: number | null;
  numberOfPeople: number[];
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
// Hook
// ======================================

export function useSkillList() {
  const [allData, setAllData] = useState<MinedSkillListView[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortFieldKey>("name");
  const sortFieldRef = useRef<SortFieldKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<Filters>({
    element: [],
    variant: "normal",
    type: "シュート技",
    option: null,
    tension: null,
    numberOfPeople: [],
  });
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // --- テンション値一覧（展開後データから動的に取得） ---
  // Note: expandedRows に依存するので、後で定義する

  // --- データ取得 ---
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/get-skills-list");
        if (res.ok) {
          const json: ApiGetSkillsListSuccess = await res.json();
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

  // --- フィルタセット (ラジオ) ---
  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        // option → type 自動選択
        if (
          key === "option" &&
          typeof value === "string" &&
          value in OPTION_TYPE_MAP
        ) {
          next.type = OPTION_TYPE_MAP[value as string];
        }
        // 種類1 変更時: option + tension をリセット
        if (key === "variant") {
          next.option = null;
          next.tension = null;
        }
        // 種類2上段 変更時: option + tension をリセット
        if (key === "type") {
          next.option = null;
          next.tension = null;
        }
        return next;
      });
      setDisplayCount(PAGE_SIZE);
    },
    [],
  );

  // --- トグル (複数選択) ---
  const toggleFilter = useCallback(
    (key: "element" | "numberOfPeople", value: unknown) => {
      setFilters((prev) => {
        const arr = prev[key] as unknown[];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
      setDisplayCount(PAGE_SIZE);
    },
    [],
  );

  const handleSortChange = useCallback((key: SortFieldKey) => {
    if (sortFieldRef.current === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortDirection(key === "power" || key === "element" ? "desc" : "asc");
    }
    sortFieldRef.current = key;
    setSortField(key);
    setDisplayCount(PAGE_SIZE);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setDisplayCount(PAGE_SIZE);
  }, []);

  // --- フィルタリング (展開前) ---
  const preFiltered = useMemo(() => {
    if (!allData) return [];
    let result = allData;

    // 属性 (複数選択)
    if (filters.element.length > 0) {
      result = result.filter((s) => filters.element.includes(s.element));
    }
    // 種類2 上段: type (ラジオ)
    result = result.filter((s) => s.type === filters.type);
    // 種類2 下段: option (ラジオ, null=全て)
    if (filters.option !== null) {
      result = result.filter((s) => {
        const mapped = mapOptionToFilter(s.option);
        return mapped === filters.option;
      });
    }
    // 種類1: リアルスキル
    if (filters.variant === "realSkill") {
      result = result.filter(
        (s) =>
          s.power_normal === REAL_SKILL_POWER ||
          s.power_or === REAL_SKILL_POWER ||
          s.power_keshin === REAL_SKILL_POWER ||
          s.power_soul === REAL_SKILL_POWER ||
          s.power_mm === REAL_SKILL_POWER,
      );
    } else {
      // 通常バリアント選択時: リアルスキル(power=30)を除外
      const variantKey = filters.variant;
      result = result.filter(
        (s) => s[`power_${variantKey}`] !== REAL_SKILL_POWER,
      );
    }
    // 人数 (複数選択)
    if (filters.numberOfPeople.length > 0) {
      result = result.filter((s) =>
        filters.numberOfPeople.includes(s.number_of_people),
      );
    }
    // 検索
    if (searchTerm) {
      const term = normalizeForSearch(searchTerm);
      result = result.filter(
        (s) =>
          normalizeForSearch(s.name).includes(term) ||
          normalizeForSearch(s.name_ruby).includes(term),
      );
    }

    return result;
  }, [allData, filters, searchTerm]);

  // --- 種類1 展開 ---
  const expandedRows = useMemo(
    () =>
      expandRows(
        preFiltered,
        filters.variant === "realSkill"
          ? VARIANT_KEYS.slice()
          : [filters.variant],
      ),
    [preFiltered, filters.variant],
  );

  // --- テンション値一覧（展開後データから動的に取得） ---
  const tensionValues = useMemo(() => {
    const set = new Set<number>();
    for (const r of expandedRows) {
      if (r.tension != null) set.add(r.tension);
    }
    return [...set].sort((a, b) => a - b);
  }, [expandedRows]);

  // --- テンション自動リセット ---
  useEffect(() => {
    if (
      filters.tension !== null &&
      !expandedRows.some((r) => r.tension === filters.tension)
    ) {
      setFilters((prev) => ({ ...prev, tension: null }));
    }
  }, [expandedRows, filters.tension]);

  // --- テンションフィルタ (展開後) ---
  const tensionFiltered = useMemo(() => {
    if (filters.tension === null) return expandedRows;
    return expandedRows.filter((r) => r.tension === filters.tension);
  }, [expandedRows, filters.tension]);

  // --- ソート ---
  const sortedData = useMemo(() => {
    const rows = [...tensionFiltered];
    const dir = sortDirection === "asc" ? 1 : -1;
    const elementOrder: Record<string, number> = { 風: 0, 林: 1, 火: 2, 山: 3 };

    rows.sort((a, b) => {
      if (sortField === "name") {
        const cmp = a.name_ruby.localeCompare(b.name_ruby, "ja");
        if (cmp !== 0) return cmp * dir;
      } else if (sortField === "power") {
        const ap = a.power ?? -Infinity;
        const bp = b.power ?? -Infinity;
        if (ap !== bp) return (ap - bp) * dir;
        // 第2ソート: 名前昇順
        const cmp = a.name_ruby.localeCompare(b.name_ruby, "ja");
        if (cmp !== 0) return cmp;
      } else if (sortField === "element") {
        const ae = elementOrder[a.element] ?? 99;
        const be = elementOrder[b.element] ?? 99;
        if (ae !== be) return (ae - be) * dir;
        // 第2ソート: 名前降順
        const cmp = a.name_ruby.localeCompare(b.name_ruby, "ja");
        if (cmp !== 0) return cmp * -1;
      }

      // tie-break: skill_id + variant
      const idCmp = a.skill_id.localeCompare(b.skill_id);
      if (idCmp !== 0) return idCmp;
      return a.variant.localeCompare(b.variant);
    });

    return rows;
  }, [tensionFiltered, sortField, sortDirection]);

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

  // --- 全件数 (種類1 + 種類2上段で変動) ---
  const totalCount = useMemo(() => {
    if (!allData) return 0;
    let base = allData.filter((s) => s.type === filters.type);
    const v = filters.variant;
    if (v === "realSkill") {
      base = base.filter(
        (s) =>
          s.power_normal === REAL_SKILL_POWER ||
          s.power_or === REAL_SKILL_POWER ||
          s.power_keshin === REAL_SKILL_POWER ||
          s.power_soul === REAL_SKILL_POWER ||
          s.power_mm === REAL_SKILL_POWER,
      );
      return expandRows(base, VARIANT_KEYS.slice()).length;
    }
    base = base.filter((s) => s[`power_${v}`] !== REAL_SKILL_POWER);
    return expandRows(base, [v]).length;
  }, [allData, filters.variant, filters.type]);

  return {
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
    filteredCount: sortedData.length,
    hasMore,
    sentinelRef,
  };
}

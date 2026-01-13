"use client";

import { useRef, useState, useTransition } from "react";

import { searchCharactersAction } from "@/app/actions/searchCharacters";
import type { SearchCharactersResponse } from "@/app/actions/searchCharacters";
import type { MetricKey } from "@/lib/characterMetrics";
import { sortRowsByMetric } from "@/lib/characterMetrics";
import SearchPart from "./components/SearchPart";
import TabPart from "./components/TabPart";
import TablePart from "./components/TablePart";

export default function Home() {
  const characterNameSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedTab, setSelectedTab] = useState<"history" | "options">(
    "history",
  );
  const [viewTableColumn, setViewTableColumn] = useState<{
    [key: string]: boolean;
  }>({
    remove: false,
    gender: false,
    element: false,
    position: false,
    kick: false,
    control: false,
    technique: false,
    pressure: false,
    physical: false,
    agility: false,
    intelligence: false,
    totalStatus: true,
    shootAT: true,
    focusAT: true,
    focusDF: true,
    scrambleAT: true,
    scrambleDF: true,
    wallDF: true,
    KP: true,
  });
  const [searchResultMode, setSearchResultMode] = useState<
    "overwrite" | "append"
  >("overwrite");
  const [maxLimit, setMaxLimit] = useState<"50" | "200" | "unlimited">("50");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false); // 日本語変換中フラグ
  const [searchResult, setSearchResult] =
    useState<SearchCharactersResponse | null>(null);
  const [isPending, startTransition] = useTransition(); //startTransition(fn)内で行うsetStateは低優先度の更新となり、UIの即時応答を阻害しない

  const changeViewTableColumn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setViewTableColumn((prev) => {
      return {
        ...prev,
        [name]: checked,
      };
    });
  };

  const handleSearch = async () => {
    if (isPending) return;

    const characterNameSearchInputRefQuery =
      characterNameSearchInputRef.current?.value ?? "";
    startTransition(async () => {
      const result = await searchCharactersAction(
        characterNameSearchInputRefQuery,
        maxLimit === "unlimited" ? undefined : Number(maxLimit),
      );
      if (searchResultMode === "overwrite") {
        setSearchResult(result);
      } else if (searchResultMode === "append") {
        setSearchResult((prev) => {
          if (!prev) return result;
          // 既存のcharacter_noのセット型作成
          const existingNos = new Set(
            prev.rows
              .map((r) => r.character_no)
              .filter((n): n is number => n != null),
          );
          // 重複していない新規データに絞る
          const dedupedNextRows = result.rows.filter((r) => {
            const no = r.character_no;
            if (no == null) return true;
            if (existingNos.has(no)) return false;
            existingNos.add(no);
            return true;
          });
          // 結合
          return {
            ...result,
            rows: [...prev.rows, ...dedupedNextRows],
          };
        });
      }
      console.log("searchCharactersAction result:", result);
    });

    characterNameSearchInputRef.current?.blur();
    setIsInputFocused(false);
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();

    characterNameSearchInputRef.current!.value = "";
  };

  const handleSort = (key: MetricKey) => {
    setSearchResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rows: sortRowsByMetric(prev.rows, key),
      };
    });
  };

  return (
    <div>
      <div className="py-16">
        <div className="mx-0">
          <div className="bg-search-bg container mx-auto sm:rounded-4xl">
            <div className="flex justify-center">
              <h2 className="bg-bar my-8 flex w-7xl flex-col items-center justify-center bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgb(20,20,20)_6px,rgb(20,20,20)_12px)] px-2 py-16 text-center text-2xl leading-12 font-bold text-white sm:mx-4">
                <span>イナズマイレブン</span>
                <span>英雄たちのヴィクトリーロード</span>
                <span>非公式データベース</span>
              </h2>
            </div>
            <SearchPart
              isPending={isPending}
              isInputFocused={isInputFocused}
              characterNameSearchInputRef={characterNameSearchInputRef}
              setIsInputFocused={setIsInputFocused}
              setIsComposing={setIsComposing}
              isComposing={isComposing}
              handleSearch={handleSearch}
            />
            <TabPart
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              maxLimit={maxLimit}
              setMaxLimit={setMaxLimit}
              searchResultMode={searchResultMode}
              setSearchResultMode={setSearchResultMode}
              viewTableColumn={viewTableColumn}
              changeViewTableColumn={changeViewTableColumn}
              canSort={!!searchResult?.rows?.length}
              handleSort={handleSort}
            />
          </div>
        </div>
        <TablePart
          searchResult={searchResult}
          viewTableColumn={viewTableColumn}
          setSearchResult={setSearchResult}
        />
      </div>
    </div>
  );
}

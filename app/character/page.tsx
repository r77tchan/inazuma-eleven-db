"use client";

import { CharacterCard, ICON_FIELDS } from "./CharacterCard";
import {
  FILTER_OPTIONS,
  INFO_FIELD_OPTIONS,
  SORT_FIELD_OPTIONS,
  useCharacterPage,
} from "./useCharacterPage";
import type { FilterKey } from "./useCharacterPage";

export default function CharacterPage() {
  const {
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
    totalCount,
    filteredCount,
    hasMore,
    sentinelRef,
  } = useCharacterPage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">キャラクター一覧</h1>

      <div className="mb-4 flex flex-col gap-3">
        <input
          type="text"
          placeholder="名前で検索..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-a-700 bg-a-950 text-a-0 placeholder:text-a-500 focus:border-a-400 w-full rounded-lg border px-4 py-2 focus:outline-none"
        />
        {(Object.keys(FILTER_OPTIONS) as FilterKey[]).map((filterKey) => {
          const { label, values } = FILTER_OPTIONS[filterKey];
          return (
            <div key={filterKey}>
              <p className="mb-1 inline-block rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                {label}
              </p>
              <div className="flex flex-wrap gap-1">
                {values.map((value) => {
                  const iconSrc = ICON_FIELDS[filterKey]?.[value];
                  return (
                    <button
                      key={value}
                      onClick={() => toggleFilter(filterKey, value)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        filters[filterKey].includes(value)
                          ? "bg-a-0 text-a-1000"
                          : "text-a-400 hover:text-a-200 bg-a-900 hover:bg-a-800"
                      }`}
                    >
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt={value}
                          width={16}
                          height={16}
                          className="h-4 w-4"
                        />
                      ) : (
                        value
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div>
          <p className="mb-1 inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-500 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
            表示名
          </p>
          <div className="flex gap-1">
            {(["fullName", "nickname"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setNameDisplay(mode)}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  nameDisplay === mode
                    ? "bg-a-0 text-a-1000"
                    : "text-a-400 hover:text-a-200 bg-a-900 hover:bg-a-800"
                }`}
              >
                {mode === "fullName" ? "フルネーム" : "ニックネーム"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-500 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
            表示情報
          </p>
          <div className="flex flex-wrap gap-1">
            {INFO_FIELD_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleInfoField(key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedInfoFields.includes(key)
                    ? "bg-a-0 text-a-1000"
                    : "text-a-400 hover:text-a-200 bg-a-900 hover:bg-a-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 inline-block rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-500 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
            並べ替え
          </p>
          <div className="flex flex-wrap gap-1">
            {SORT_FIELD_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSortChange(key)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sortField === key
                    ? "bg-a-0 text-a-1000"
                    : "text-a-400 hover:text-a-200 bg-a-900 hover:bg-a-800"
                }`}
              >
                {label}
                {sortField === key && (sortDirection === "asc" ? " ↑" : " ↓")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="border-a-500 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-a-500 text-sm">データを読み込み中...</p>
        </div>
      )}

      {error && <p className="py-12 text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <>
          <p className="text-a-500 mb-4 text-sm">
            {filteredCount !== totalCount
              ? `${filteredCount.toLocaleString()} 件ヒット（全 ${totalCount.toLocaleString()} 件）`
              : `全 ${totalCount.toLocaleString()} 件`}
          </p>

          <div className="flex flex-col gap-2">
            {visibleData.map((character) => (
              <CharacterCard
                key={character.characterNo}
                character={character}
                nameDisplay={nameDisplay}
                infoFields={selectedInfoFields}
              />
            ))}
          </div>

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

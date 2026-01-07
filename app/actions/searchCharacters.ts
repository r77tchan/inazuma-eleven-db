"use server";

import { unstable_cache } from "next/cache";

import { getScrapedCharacterDetailsRange } from "@/lib/db/getScrapedCharacterDetailsRange";
import type { ScrapedCharacterDetailRow } from "@/lib/types";

const PAGE_SIZE = 50;
const CACHE_CHUNK_SIZE = 300;

// 全角と半角スペースの削除
function normalizeQuery(value: string): string {
  return value.replace(/[\u0020\u3000]/g, "");
}

function normalizeTarget(value: string): string {
  // DB側の値にスペースが混ざっても検索できるように合わせる
  return normalizeQuery(value);
}

function joinFullNameName(row: ScrapedCharacterDetailRow): string {
  return row.full_name.map((n) => n.name).join("");
}

function joinFullNameRuby(row: ScrapedCharacterDetailRow): string {
  return row.full_name.map((n) => n.ruby).join("");
}

function joinNicknameName(row: ScrapedCharacterDetailRow): string {
  return row.nickname.map((n) => n.name).join("");
}

function joinNicknameRuby(row: ScrapedCharacterDetailRow): string {
  return row.nickname.map((n) => n.ruby).join("");
}

function getCharactersChunkCached(chunkIndex: number) {
  const safeChunkIndex = Number.isFinite(chunkIndex)
    ? Math.max(0, Math.trunc(chunkIndex))
    : 0;

  return unstable_cache(
    async (): Promise<ScrapedCharacterDetailRow[]> => {
      const offset = safeChunkIndex * CACHE_CHUNK_SIZE;
      return getScrapedCharacterDetailsRange(offset, CACHE_CHUNK_SIZE);
    },
    [`scraped_character_details:chunk:${safeChunkIndex}`],
    {
      tags: ["scraped_character_details"],
    },
  );
}

async function getAllCharactersCached(): Promise<ScrapedCharacterDetailRow[]> {
  const all: ScrapedCharacterDetailRow[] = [];
  for (let chunkIndex = 0; ; chunkIndex++) {
    const chunk = await getCharactersChunkCached(chunkIndex)();
    all.push(...chunk);
    if (chunk.length < CACHE_CHUNK_SIZE) break;
  }
  return all;
}

export type SearchCharactersResponse = {
  rows: ScrapedCharacterDetailRow[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export async function searchCharactersAction(
  rawQuery: string,
  page: number = 1,
): Promise<SearchCharactersResponse> {
  const normalizedQuery = normalizeQuery(rawQuery);
  const allRows = await getAllCharactersCached();

  // console.log(allRows.length);

  const filtered = normalizedQuery
    ? allRows.filter((row) => {
        const targets = [
          joinFullNameName(row),
          joinFullNameRuby(row),
          joinNicknameName(row),
          joinNicknameRuby(row),
        ].map(normalizeTarget);

        return targets.some((t) => t.includes(normalizedQuery));
      })
    : allRows;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Number.isFinite(page)
    ? Math.min(Math.max(1, Math.trunc(page)), totalPages)
    : 1;

  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE);

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return {
    rows,
    totalCount,
    totalPages,
    page: safePage,
  };
}

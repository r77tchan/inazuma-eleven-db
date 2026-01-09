"use server";

import { unstable_cache } from "next/cache";

import { getScrapedCharacterDetailsRange } from "@/lib/db/getScrapedCharacterDetailsRange";
import type { ScrapedCharacterDetailRow } from "@/lib/types";

const PAGE_SIZE = 50;
const CACHE_CHUNK_SIZE = 300;

// 全角と半角スペースの削除
function removeSpaces(value: string): string {
  return value.replace(/[\u0020\u3000]/g, "");
}

// 結合関数
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
  // サーバー関数の戻り値をキャッシュ（同じキーなら再実行しない）
  return unstable_cache(
    async (): Promise<ScrapedCharacterDetailRow[]> => {
      // キャッシュ対象の関数
      const offset = safeChunkIndex * CACHE_CHUNK_SIZE;
      return getScrapedCharacterDetailsRange(offset, CACHE_CHUNK_SIZE);
    },
    [`scraped_character_details:chunk:${safeChunkIndex}`], // キャッシュキー（safeChunkIndexごとに別キャッシュ）
    {
      tags: ["scraped_character_details"], // キャッシュ無効化用タグ
    },
  );
}

async function getAllCharactersCached(): Promise<ScrapedCharacterDetailRow[]> {
  const all: ScrapedCharacterDetailRow[] = [];
  // Supabaseには最大取得件数の制限があるため、チャンクに分けて全件取得する
  for (let chunkIndex = 0; ; chunkIndex++) {
    const chunk = await getCharactersChunkCached(chunkIndex)();
    all.push(...chunk);
    if (chunk.length < CACHE_CHUNK_SIZE) break; // 取得結果がチャンクサイズ未満の場合は最後のチャンクなので終了する
  }
  return all;
}

// 戻り値の型
export type SearchCharactersResponse = {
  rows: ScrapedCharacterDetailRow[];
  totalCount: number;
  totalPages: number;
  page: number;
};

export async function searchCharactersAction(
  characterNameSearchQuery: string,
  page: number = 1,
): Promise<SearchCharactersResponse> {
  const normalizedQuery = removeSpaces(characterNameSearchQuery);
  const allRows = await getAllCharactersCached();

  // console.log(allRows.length);

  // 取得結果を、フロントから送られた検索クエリでフィルタリングする
  // 文字列のfalsyは空文字の場合のみ
  const filtered = normalizedQuery
    ? allRows.filter((row) => {
        const targets = [
          joinFullNameName(row),
          joinFullNameRuby(row),
          joinNicknameName(row),
          joinNicknameRuby(row),
        ].map(removeSpaces);

        return targets.some((t) => t.includes(normalizedQuery)); // 部分一致
      })
    : allRows;

  // 戻り値用のページング計算
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Number.isFinite(page)
    ? Math.min(Math.max(1, Math.trunc(page)), totalPages)
    : 1;

  const start = (safePage - 1) * PAGE_SIZE;
  const rows = filtered.slice(start, start + PAGE_SIZE); // ページに対応する分だけ切り出す

  // await new Promise((resolve) => setTimeout(resolve, 5000));

  return {
    rows,
    totalCount,
    totalPages,
    page: safePage,
  };
}

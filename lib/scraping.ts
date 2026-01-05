import "server-only";
import * as cheerio from "cheerio";

import type { CharacterUrl, ScrapingResult } from "@/lib/types/scraping";

// 対象のベースURL
const baseUrl = "https://zukan.inazuma.jp/";

// Fetchの共通オプション
const fetchOptions: RequestInit = {
  method: "GET",
  headers: {
    "user-agent": "inazuma-eleven-db-scraping/1.0",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    referer: "https://zukan.inazuma.jp/",
  },
  cache: "no-store",
};

// 相対パスを絶対パスに変換する関数
function normalizeHref(rootUrl: string, href: string): string {
  try {
    return new URL(href, rootUrl).toString();
  } catch {
    return href;
  }
}

// 「/chara_list」の総ページ数を取得する関数
async function getTotalPageNumber(): Promise<number> {
  const response = await fetch(`${baseUrl}chara_list/`, fetchOptions);

  if (!response.ok) {
    throw new Error(
      `総ページ数の取得に失敗しました: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const pagination = $(".pagination").first();
  if (pagination.length === 0) {
    throw new Error(".pagination が見つかりませんでした");
  }

  const li = pagination.children("li").eq(-2); // 直下の子要素(li)の「後ろから2番目」を取る
  if (li.length === 0) {
    throw new Error(".pagination の li を取得できませんでした");
  }

  const pageText = li.find("a").first().text().replace(/\s+/g, " ").trim();
  if (!pageText) {
    throw new Error("総ページ数のテキストが空でした");
  }

  const totalPageNumber = Number.parseInt(pageText, 10);
  if (!Number.isFinite(totalPageNumber)) {
    throw new Error(`総ページ数が数値に変換できませんでした: ${pageText}`);
  }

  return totalPageNumber;
}

// chara_listページからキャラクター詳細ページのURLとキャラクター番号を取得する関数（totalPageNumberページ分全て）
async function getUrlList(totalPageNumber: number): Promise<CharacterUrl[]> {
  const characterUrlList: CharacterUrl[] = [];

  for (let i = 1; i <= totalPageNumber - totalPageNumber + 1; i++) {
    const pageUrl = `${baseUrl}chara_list/?page=${i}`;

    const response = await fetch(pageUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `URLリストの取得に失敗しました: ${pageUrl} (${response.status})`,
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const tmpCharacterUrlList: CharacterUrl[] = $(".nameBox > p > a")
      .map((_, element) => {
        const href = $(element).attr("href");
        if (!href) return null;

        const td = $(element).closest("td");
        const characterNo = td.prev("td").text().replace(/\s+/g, " ").trim();

        return {
          detailUrl: normalizeHref(baseUrl, href),
          characterNo,
        } satisfies CharacterUrl; // 型検証
      })
      .get() // cheerioオブジェクトを配列に変換
      .filter((item): item is CharacterUrl => item !== null); // nullを除外

    characterUrlList.push(...tmpCharacterUrlList);
  }

  return characterUrlList;
}

// 各キャラクター詳細ページから必要な情報を取得する関数
async function getDetailList(characterUrlList: CharacterUrl[]): Promise<void> {
  for (const character of characterUrlList) {
    const response = await fetch(character.detailUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `キャラクター詳細の取得に失敗しました: ${character.detailUrl} (${response.status})`,
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ここで必要な情報を抽出する処理を追加できます
    // 例: const name = $(".character-name").text().trim();
  }
}

// スクレイピングを実行するメイン関数
export async function runScraping(): Promise<ScrapingResult> {
  const totalPageNumber = await getTotalPageNumber();
  const characterUrlList = await getUrlList(totalPageNumber);
  const characterDetailList = await getDetailList(characterUrlList);

  return {
    characterUrlList,
    totalListCount: characterUrlList.length,
    fetchedAt: new Date().toISOString(),
  };
}

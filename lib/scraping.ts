import "server-only";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import type {
  CharacterDetail,
  CharacterName,
  CharacterUrl,
  ScrapingResult,
} from "@/lib/types/scraping";

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

// テキストの正規化（連続する空白を1つにまとめ、前後の空白を削除）
function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Cheerio要素からテキストのみを取得する関数（タグの削除）
function getText($root: cheerio.Cheerio<AnyNode>): string {
  return normalizeText($root.text());
}

// Cheerio要素から指定の属性値をテキストで取得する関数
function getAttr($root: cheerio.Cheerio<AnyNode>, name: string): string {
  const value = $root.attr(name);
  return value ? normalizeText(value) : "";
}

// Cheerio要素からHTMLを取得する関数（<br>タグを保持）
function getHtmlPreserveBr($root: cheerio.Cheerio<AnyNode>): string {
  const html = $root.html();
  if (!html) return "";
  return html
    .replace(/<br\s*\/?\s*>/gi, "<br>")
    .replace(/\r?\n|\t/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// 名前とルビのペアを解析する関数
function parseRubySpan(
  $: cheerio.CheerioAPI,
  $span: cheerio.Cheerio<AnyNode>,
): CharacterName[] {
  const result: CharacterName[] = [];

  $span.find("ruby").each((_, rubyEl) => {
    const $ruby = $(rubyEl);

    const baseText = normalizeText(
      $ruby.clone().children("rt").remove().end().text(),
    );
    if (!baseText) return;

    const rubyText = normalizeText($ruby.children("rt").first().text());

    result.push({
      name: baseText,
      ruby: rubyText,
    });
  });

  return result;
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

  // デバッグ用: 1ページのみ処理する場合
  // for (let i = 1; i <= 1; i++) {
  for (let i = 1; i <= totalPageNumber; i++) {
    console.log(`phase1を実行中: ${i} / ${totalPageNumber}`);

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
async function getDetailList(
  characterUrlList: CharacterUrl[],
): Promise<CharacterDetail[]> {
  const characterDetailList: CharacterDetail[] = [];

  let count = 0;
  for (const character of characterUrlList) {
    console.log(`phase2を実行中: ${++count} / ${characterUrlList.length}`);

    const response = await fetch(character.detailUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `キャラクター詳細の取得に失敗しました: ${character.detailUrl} (${response.status})`,
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const $nameBox = $(".charaListBox").first().find(".nameBox").first();
    const nickname = parseRubySpan($, $("span.nickname").first());
    const fullName = parseRubySpan($, $nameBox.find("span.name").first());

    const imageUrl = normalizeHref(
      baseUrl,
      getAttr($(".lBox figure picture img").first(), "src"),
    );

    const works = getText($(".appearedWorks dd").first());
    const description = getHtmlPreserveBr($(".description").first());

    const $paramLis = $(".param").first().find("li");

    const position = getText(
      $paramLis.eq(0).find("dl").eq(0).find("dd").find("p").first(),
    );
    const element = getText(
      $paramLis.eq(0).find("dl").eq(1).find("dd").find("p").first(),
    );

    const getParamStat = (liIndex: number): string =>
      getText(
        $paramLis
          .eq(liIndex)
          .find("dd")
          .find("table tbody tr")
          .eq(1)
          .find("td")
          .first(),
      );

    const kick = getParamStat(1);
    const control = getParamStat(2);
    const technique = getParamStat(3);
    const pressure = getParamStat(4);
    const physical = getParamStat(5);
    const agility = getParamStat(6);
    const intelligence = getParamStat(7);

    const $basicLis = $(".basic").first().find("li");
    const generation = getText($basicLis.eq(0).find("dd").first());
    const schoolYear = getText($basicLis.eq(1).find("dd").first());
    const gender = getText($basicLis.eq(2).find("dd").first());
    const characterRole = getText($basicLis.eq(3).find("dd").first());

    characterDetailList.push({
      detailUrl: character.detailUrl,
      characterNo: character.characterNo,
      nickname,
      fullName,
      imageUrl,
      works,
      description,
      position,
      element,
      kick,
      control,
      technique,
      pressure,
      physical,
      agility,
      intelligence,
      generation,
      schoolYear,
      gender,
      characterRole,
    });
  }

  return characterDetailList;
}

// スクレイピングを実行するメイン関数
export async function runScraping(): Promise<ScrapingResult> {
  const totalPageNumber = await getTotalPageNumber();
  const characterUrlList = await getUrlList(totalPageNumber);
  const characterDetailList = await getDetailList(characterUrlList);

  return {
    characterDetailList,
    totalListCount: characterDetailList.length,
    fetchedAt: new Date().toISOString(),
  };
}

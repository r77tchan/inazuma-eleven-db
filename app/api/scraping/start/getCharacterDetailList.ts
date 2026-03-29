import type {
  ScrapedCharacterDetail,
  CharacterName,
  CharacterHowToGet,
  CharacterHowToGetDetail,
  ScrapedCharacterIndex,
} from "@/lib/types";
import { baseUrl, fetchOptions } from "./runScraping";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { toAbsoluteUrl } from "@/lib/utils";

// 連続する空白を1つに、前後の空白を削除
function cleanWhiteSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// brタグの書き方を置換で統一、改行タブ削除、連続空白を1つに、前後の空白を削除
function cleanHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?\s*>/gi, "<br>")
    .replace(/\r?\n|\t/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// パラメーター用数値変換
function toIntOrNull(text: string): number | null {
  if (!text) return null;

  const value = Number.parseInt(text, 10);
  return Number.isFinite(value) ? value : null;
}

// span要素内の<ruby>タグから、CharacterNameの配列（姓名）を作成する関数
function makeCharacterName(
  $: cheerio.CheerioAPI,
  $span: cheerio.Cheerio<AnyNode>,
): CharacterName[] {
  const result: CharacterName[] = [];

  // 全ての<ruby>タグを取得しループ
  $span.find("ruby").each((_, rubyEl) => {
    const $ruby = $(rubyEl); // cheerioオブジェクトに変換

    // <ruby>円堂<rt>えんどう</rt></ruby>から、rtを削除することで、漢字のみを残す
    const baseText = cleanWhiteSpace(
      $ruby.clone().children("rt").remove().end().text(),
    );
    if (!baseText) return;

    // <ruby>円堂<rt>えんどう</rt></ruby>から、rtのみを抽出してふりがなを取得する
    const rubyText = cleanWhiteSpace($ruby.children("rt").first().text());

    result.push({
      name: baseText,
      ruby: rubyText,
    });
  });

  return result;
}

// 入手方法から、CharacterHowToGetの配列を作成する関数
function makeHowToGetList(
  $: cheerio.CheerioAPI,
  $root: cheerio.Cheerio<AnyNode>,
): CharacterHowToGet[] {
  return $root
    .children("dl")
    .toArray()
    .map((dl) => {
      const $dl = $(dl);
      const title = cleanWhiteSpace($dl.children("dt").first().text());
      const details: CharacterHowToGetDetail[] = $dl
        .children("dd")
        .toArray()
        .map((dd) => {
          const $dd = $(dd);
          const description =
            cleanWhiteSpace($dd.children("p").first().text()) || null;
          const items = $dd
            .find("li")
            .toArray()
            .map((li) => cleanWhiteSpace($(li).text()))
            .filter(Boolean);

          return {
            description,
            items,
          };
        })
        .filter((detail) => detail.description || detail.items.length > 0);

      return {
        title,
        details,
      };
    })
    .filter((entry) => entry.title);
}

export default async function getCharacterDetailList(
  characterIndexList: ScrapedCharacterIndex[],
): Promise<ScrapedCharacterDetail[]> {
  const fetchedAt = new Date().toISOString();
  const characterDetailList: ScrapedCharacterDetail[] = [];

  let count = 0;
  for (const character of characterIndexList) {
    console.log(
      `詳細ページより選手データを取得中: ${++count} / ${characterIndexList.length}`,
    );

    const response = await fetch(character.detailUrl, fetchOptions);
    if (!response.ok) {
      throw new Error(
        `キャラクター詳細の取得に失敗しました: ${character.detailUrl} (${response.status})`,
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // const $nameBox = $(".charaListBox").first().find(".nameBox").first();
    // const fullName = makeCharacterName($, $nameBox.find("span.name").first());
    const nickname = makeCharacterName($, $("span.nickname").first());

    const imageUrl = toAbsoluteUrl(
      baseUrl,
      cleanWhiteSpace($(".lBox figure picture img").first().attr("src") ?? ""),
    );

    const works = cleanWhiteSpace($(".appearedWorks dd").first().text());
    const description = cleanHtml($(".description").first().html());
    const howToGet = makeHowToGetList(
      $,
      $(".getTxt").first().children("dd").first(),
    );

    const $paramLis = $(".param").first().find("li");

    const position = cleanWhiteSpace(
      $paramLis.eq(0).find("dl").eq(0).find("dd").find("p").first().text(),
    );
    const element = cleanWhiteSpace(
      $paramLis.eq(0).find("dl").eq(1).find("dd").find("p").first().text(),
    );

    const getParamStat = (liIndex: number): number | null =>
      toIntOrNull(
        cleanWhiteSpace(
          $paramLis
            .eq(liIndex)
            .find("dd")
            .find("table tbody tr")
            .eq(1)
            .find("td")
            .first()
            .text(),
        ),
      );

    const kick = getParamStat(1);
    const control = getParamStat(2);
    const technique = getParamStat(3);
    const pressure = getParamStat(4);
    const physical = getParamStat(5);
    const agility = getParamStat(6);
    const intelligence = getParamStat(7);

    const $basicLis = $(".basic").first().find("li");
    const generation = cleanWhiteSpace(
      $basicLis.eq(0).find("dd").first().text(),
    );
    const schoolYear = cleanWhiteSpace(
      $basicLis.eq(1).find("dd").first().text(),
    );
    const gender = cleanWhiteSpace($basicLis.eq(2).find("dd").first().text());
    const characterRole = cleanWhiteSpace(
      $basicLis.eq(3).find("dd").first().text(),
    );

    characterDetailList.push({
      detailUrl: character.detailUrl,
      characterNo: character.characterNo,
      team: character.team,
      worksFlags: character.worksFlags,
      nickname,
      fullName: character.fullName,
      howToGet,
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
      fetchedAt,
    });
  }

  console.log(
    `詳細ページより選手データの取得が完了しました: 計 ${characterDetailList.length} 件`,
  );
  return characterDetailList;
}

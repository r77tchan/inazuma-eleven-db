import type {
  CharacterName,
  ScrapedCharacterIndex,
  WorksFlags,
} from "@/lib/types";
import { toAbsoluteUrl } from "@/lib/utils";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { baseUrl, fetchOptions } from "./runScraping";

function cleanWhiteSpace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function cleanHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<br\s*\/?\s*>/gi, "<br>")
    .replace(/\r?\n|\t/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function splitBrText(text: string | null | undefined): string[] {
  return cleanHtml(text)
    .split("<br>")
    .map((value) => cleanWhiteSpace(value))
    .filter(Boolean);
}

function makeCharacterName($nameBox: cheerio.Cheerio<AnyNode>): CharacterName {
  return {
    name: cleanWhiteSpace($nameBox.find("span.name").first().text()),
    ruby: cleanWhiteSpace($nameBox.find("span.rubi").first().text()),
  };
}

function makeWorksFlags($secondRow: cheerio.Cheerio<AnyNode>): WorksFlags {
  const flags = $secondRow
    .children("td")
    .toArray()
    .map((td) => cleanWhiteSpace(cheerio.load(td).root().text()) === "○");

  return {
    ie1: flags[0] ?? false,
    ie2: flags[1] ?? false,
    ie3: flags[2] ?? false,
    go1: flags[3] ?? false,
    go2: flags[4] ?? false,
    go3: flags[5] ?? false,
    ars: flags[6] ?? false,
    ori: flags[7] ?? false,
    vic: flags[8] ?? false,
  };
}

export default async function getCharacterIndexList(
  totalPageNumber: number,
): Promise<ScrapedCharacterIndex[]> {
  const characterList: ScrapedCharacterIndex[] = [];

  // デバッグ用
  // for (let i = 1; i <= 1; i++) {
  for (let i = 1; i <= totalPageNumber; i++) {
    console.log(
      `一覧ページより詳細ページのURLを取得中: ${i} / ${totalPageNumber}`,
    );

    const fetchUrl = `${baseUrl}chara_list/?page=${i}`;
    const response = await fetch(fetchUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(
        `一覧ページより詳細ページのURLの取得に失敗しました: ${fetchUrl} (${response.status})`,
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const pageItems = $(".charaListResult > table > tbody")
      .toArray()
      .map((tbody) => {
        const $tbody = $(tbody);
        const $firstRow = $tbody.children("tr").eq(0);
        const $secondRow = $tbody.children("tr").eq(1);

        if ($firstRow.length === 0 || $secondRow.length === 0) return null;

        const $nameCell = $firstRow.children("td").eq(2);
        const $nameLink = $nameCell.find(".nameBox > p > a").first();
        const href = $nameLink.attr("href");

        if (!href) return null;

        const detailUrl = toAbsoluteUrl(baseUrl, href);
        const characterNo = cleanWhiteSpace(
          $firstRow.children("td").eq(1).text(),
        );
        const fullName = makeCharacterName($nameCell);
        const team = splitBrText($firstRow.children("td").eq(11).html());
        const worksFlags = makeWorksFlags($secondRow);

        return {
          detailUrl,
          characterNo,
          fullName,
          team,
          worksFlags,
        };
      })
      .filter((item): item is ScrapedCharacterIndex => item !== null);

    characterList.push(...pageItems);
  }

  console.log(
    `一覧ページより詳細ページのURLの取得が完了しました: 計 ${characterList.length} 件`,
  );
  return characterList;
}

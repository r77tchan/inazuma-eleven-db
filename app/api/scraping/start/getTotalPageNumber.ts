import { baseUrl, fetchOptions } from "./runScraping";
import * as cheerio from "cheerio";

export default async function getTotalPageNumber(): Promise<number> {
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

  console.log(
    `総ページ数を取得しました: 結果は ${totalPageNumber} ページでした`,
  );
  return totalPageNumber;
}

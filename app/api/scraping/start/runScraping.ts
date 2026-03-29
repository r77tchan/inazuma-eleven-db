import type { ScrapedCharacterDetail } from "@/lib/types";
import getTotalPageNumber from "./getTotalPageNumber";
import getCharacterIndexList from "./getCharacterIndexList";
import getCharacterDetailList from "./getCharacterDetailList";

export const baseUrl = "https://zukan.inazuma.jp/";

export const fetchOptions: RequestInit = {
  method: "GET",
  headers: {
    "user-agent": "inazuma-eleven-db-scraping/1.0",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "ja,en-US;q=0.9,en;q=0.8",
    referer: "https://zukan.inazuma.jp/",
  },
  cache: "no-store",
};

export default async function runScraping(): Promise<ScrapedCharacterDetail[]> {
  const totalPageNumber = await getTotalPageNumber();
  const characterIndexList = await getCharacterIndexList(totalPageNumber);
  const characterDetailList = await getCharacterDetailList(characterIndexList);
  return characterDetailList;
}

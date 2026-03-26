import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { runScraping } from "@/lib/scraping";
import { upsertScrapedCharacterDetails } from "@/lib/db/upsertScrapedCharacterDetails";

function stopService() {
  return NextResponse.json(
    { message: "スクレイピングサービスは停止中です" },
    { status: 503 },
  );
}

export async function POST() {
  try {
    return stopService();

    const result = await runScraping();
    await upsertScrapedCharacterDetails(result.characterDetailList);

    // 検索側の unstable_cache(tags: ["scraped_character_details"]) を破棄して作り直す
    revalidateTag("scraped_character_details", "default");

    return NextResponse.json(
      { message: "スクレイピングを実行しDBに保存しました", result },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.log(`【エラー】route.ts => ${message}`);
    return NextResponse.json(
      { message: "スクレイピングまたはDB保存に失敗しました", error: message },
      { status: 500 },
    );
  }
}

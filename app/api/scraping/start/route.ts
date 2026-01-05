import { NextResponse } from "next/server";

import { runScraping } from "@/lib/scraping";

export async function POST() {
  const result = await runScraping();
  return NextResponse.json(
    { message: "スクレイピングを実行しました", result },
    { status: 200 },
  );
}

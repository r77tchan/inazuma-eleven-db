import { NextResponse } from "next/server";
import { createApiFailureResponse } from "@/lib/api";

import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import getAllScrapedCharacterDetails from "./getAllScrapedCharacterDetails";

export type ApiGetDbDataSuccess = {
  message: string;
  dbData: ScrapedCharacterDetailWithMetrics[];
};

export async function GET() {
  try {
    const data = await getAllScrapedCharacterDetails();

    return NextResponse.json<ApiGetDbDataSuccess>(
      {
        message: "DBからデータを取得しました",
        dbData: data,
      },
      { status: 200 }, // OK
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

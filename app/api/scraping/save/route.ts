import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkIsLocal } from "@/app/api/checkIsLocal";
import {
  createApiErrorResponse,
  createApiFailureResponse,
  createLocalOnlyErrorResponse,
} from "@/lib/api";

import { SCRAPED_CHARACTER_DETAILS_CACHE_TAG } from "@/lib/db/scraped-character-details/cache";
import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import { upsertScrapedCharacterDetails } from "@/lib/db/scraped-character-details/upsertScrapedCharacterDetails";

export type ApiSaveDbDataRequest = {
  scrapedData: ScrapedCharacterDetailWithMetrics[];
};

export type ApiSaveDbDataSuccess = {
  message: string;
  savedCount: number;
};

export async function POST(request: Request) {
  try {
    if (!checkIsLocal()) {
      return createLocalOnlyErrorResponse();
    }

    const body = (await request.json()) as Partial<ApiSaveDbDataRequest>;
    const scrapedData = body.scrapedData;

    if (!Array.isArray(scrapedData) || scrapedData.length === 0) {
      return createApiErrorResponse(
        "保存対象のスクレイピングデータがありません",
        400,
      );
    }

    await upsertScrapedCharacterDetails(scrapedData);
    revalidateTag(SCRAPED_CHARACTER_DETAILS_CACHE_TAG, { expire: 0 });

    return NextResponse.json<ApiSaveDbDataSuccess>(
      {
        message: "DBにデータを保存しました",
        savedCount: scrapedData.length,
      },
      { status: 200 }, // OK
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

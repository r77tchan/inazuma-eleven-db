import { NextResponse } from "next/server";
import { checkIsLocal } from "@/app/api/checkIsLocal";
import {
  createApiFailureResponse,
  createLocalOnlyErrorResponse,
} from "@/lib/api";
import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import runScraping from "./runScraping";
import addCharacterMetrics from "./addCharacterMetrics";

export type ApiStartSuccess = {
  message: string;
  scrapedData: ScrapedCharacterDetailWithMetrics[];
};

export async function POST() {
  try {
    if (!checkIsLocal()) {
      return createLocalOnlyErrorResponse();
    }

    const characterDetailList = await runScraping();
    const characterDetailListWithMetrics =
      addCharacterMetrics(characterDetailList);

    return NextResponse.json<ApiStartSuccess>(
      {
        message: "inagleのスクレイピングを実行しました",
        scrapedData: characterDetailListWithMetrics,
      },
      { status: 200 }, // OK
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

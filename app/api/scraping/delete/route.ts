import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { checkIsLocal } from "@/app/api/checkIsLocal";
import {
  createApiFailureResponse,
  createLocalOnlyErrorResponse,
} from "@/lib/api";
import { SCRAPED_CHARACTER_DETAILS_CACHE_TAG } from "@/lib/db/cache";
import { truncateScrapedCharacterDetails } from "@/lib/db/truncateScrapedCharacterDetails";

export type ApiDeleteDbDataSuccess = {
  message: string;
  deletedCount: number;
};

export async function DELETE() {
  try {
    if (!checkIsLocal()) {
      return createLocalOnlyErrorResponse();
    }

    const deletedCount = await truncateScrapedCharacterDetails();
    revalidateTag(SCRAPED_CHARACTER_DETAILS_CACHE_TAG, { expire: 0 });

    return NextResponse.json<ApiDeleteDbDataSuccess>(
      {
        message: "DBデータを空の状態に戻しました",
        deletedCount,
      },
      { status: 200 },
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

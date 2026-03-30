import { NextResponse } from "next/server";

import { checkIsLocal } from "@/app/api/checkIsLocal";
import {
  createApiFailureResponse,
  createLocalOnlyErrorResponse,
} from "@/lib/api";
import type { PlayerMasterEntry } from "@/lib/types";

import { getPlayerMasterEntries } from "./getPlayerMasterEntries";

export type ApiPlayerMasterFetchSuccess = {
  message: string;
  entries: PlayerMasterEntry[];
};

export async function POST() {
  try {
    if (!checkIsLocal()) {
      return createLocalOnlyErrorResponse();
    }

    const entries = await getPlayerMasterEntries();

    return NextResponse.json<ApiPlayerMasterFetchSuccess>(
      {
        message: `選手マスタを取得しました (${entries.length}件)`,
        entries,
      },
      { status: 200 },
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

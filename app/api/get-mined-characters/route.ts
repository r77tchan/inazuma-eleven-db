import { NextResponse } from "next/server";
import { createApiFailureResponse } from "@/lib/api";

import type { MinedCharacterRow } from "@/lib/types";

import getAllMinedCharacters from "./getAllMinedCharacters";

export type ApiGetMinedCharactersSuccess = {
  message: string;
  data: MinedCharacterRow[];
};

export async function GET() {
  try {
    const data = await getAllMinedCharacters();

    return NextResponse.json<ApiGetMinedCharactersSuccess>(
      {
        message: "マイニングデータを取得しました",
        data,
      },
      { status: 200 },
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

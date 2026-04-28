import { NextResponse } from "next/server";
import { createApiFailureResponse } from "@/lib/api";
import type { MinedCharacterListView } from "@/lib/types";
import getAllCharactersList from "./getAllCharactersList";

export type ApiGetCharactersListSuccess = {
  message: string;
  data: MinedCharacterListView[];
};

export async function GET() {
  try {
    const data = await getAllCharactersList();

    return NextResponse.json<ApiGetCharactersListSuccess>(
      {
        message: "キャラクター一覧を取得しました",
        data,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

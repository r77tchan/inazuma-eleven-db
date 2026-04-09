import { NextResponse } from "next/server";
import { createApiFailureResponse } from "@/lib/api";
import type { MinedSkillListView } from "@/lib/types";
import getAllSkillsList from "./getAllSkillsList";

export type ApiGetSkillsListSuccess = {
  message: string;
  data: MinedSkillListView[];
};

export async function GET() {
  try {
    const data = await getAllSkillsList();

    return NextResponse.json<ApiGetSkillsListSuccess>(
      {
        message: "必殺技一覧を取得しました",
        data,
      },
      { status: 200 },
    );
  } catch (e) {
    return createApiFailureResponse(e);
  }
}

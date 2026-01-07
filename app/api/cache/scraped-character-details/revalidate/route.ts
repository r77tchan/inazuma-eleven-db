import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  // ローカル用途でも、誤って公開されると危険なので簡易ガード
  const secret = process.env.CACHE_REVALIDATE_SECRET;
  const provided = request.headers.get("x-revalidate-secret");

  if (secret && provided !== secret) {
    return NextResponse.json({ message: "不正なリクエスト" }, { status: 401 });
  }

  revalidateTag("scraped_character_details", "default");

  return NextResponse.json(
    { message: "キャッシュを再検証しました", tag: "scraped_character_details" },
    { status: 200 },
  );
}

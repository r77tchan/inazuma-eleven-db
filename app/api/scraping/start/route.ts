import { NextResponse } from "next/server";

import { runHelloProgram } from "@/lib/helloProgram";

export async function POST() {
  await runHelloProgram();
  return NextResponse.json(
    { message: "プログラムが実行されました" },
    { status: 200 },
  );
}

import { NextResponse } from "next/server";

export type ApiFailure = {
  errorMessage: string;
};

export function createApiErrorResponse(message: string, status: number) {
  return NextResponse.json<ApiFailure>(
    {
      errorMessage: message,
    },
    { status },
  );
}

export function createApiFailureResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`エラー => ${message}`);

  return createApiErrorResponse(message, 500); // 500 Internal Server Error
}

export function createLocalOnlyErrorResponse() {
  return createApiErrorResponse(
    "無効なリクエストです。「.env.local」 で IS_LOCAL=true を設定した環境でのみ実行できます。",
    503,
  ); // 503 Service Unavailable
}

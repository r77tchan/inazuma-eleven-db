import "server-only";

/**
 * Supabase クエリをリトライ付きで実行する。
 * Cloudflare のレート制限等で一時的に失敗した場合に指数バックオフで再試行する。
 */
export async function withRetry<T>(
  fn: () => PromiseLike<{ data: T; error: { message: string } | null }>,
  label: string,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { data, error } = await fn();
    if (!error) return data as T;
    if (attempt < maxRetries) {
      const delay = 1000 * 2 ** attempt;
      console.warn(
        `[${label}] attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
      );
      await new Promise((r) => setTimeout(r, delay));
    } else {
      throw new Error(
        `${label} failed after ${maxRetries + 1} attempts: ${error.message}`,
      );
    }
  }
  throw new Error(`${label}: unreachable`);
}

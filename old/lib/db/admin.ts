import "server-only";
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `環境変数 ${name} が未設定です。.env.local に設定してください。`,
    );
  }
  return value;
}

export const supabaseAdmin = createClient(
  requireEnv("DB_PROJECT_URL"),
  requireEnv("DB_SECRET_API_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

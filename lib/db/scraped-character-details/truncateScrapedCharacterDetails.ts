import "server-only";

import { supabaseAdmin } from "@/lib/db/admin";

export async function truncateScrapedCharacterDetails(): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc(
    "truncate_scraped_character_details",
  );

  if (error) {
    throw new Error(`Supabase truncate failed: ${error.message}`);
  }

  return Number(data ?? 0);
}
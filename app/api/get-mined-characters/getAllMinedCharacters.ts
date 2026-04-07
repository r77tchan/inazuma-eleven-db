import "server-only";

import { getMinedCharactersRange } from "@/lib/db/mined/mined-characters/getMinedCharactersRange";
import type { MinedCharacterRow } from "@/lib/types";

const CHUNK_SIZE = 300;

export default async function getAllMinedCharacters(): Promise<
  MinedCharacterRow[]
> {
  const allRows: MinedCharacterRow[] = [];

  for (let chunkIndex = 0; ; chunkIndex++) {
    const offset = chunkIndex * CHUNK_SIZE;
    const chunk = await getMinedCharactersRange(offset, CHUNK_SIZE);
    allRows.push(...chunk);

    if (chunk.length < CHUNK_SIZE) {
      break;
    }
  }

  return allRows;
}

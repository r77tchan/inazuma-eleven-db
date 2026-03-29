import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

export type DiffResult = {
  onlyInScraped: ScrapedCharacterDetailWithMetrics[];
  onlyInDb: ScrapedCharacterDetailWithMetrics[];
  different: {
    scraped: ScrapedCharacterDetailWithMetrics;
    db: ScrapedCharacterDetailWithMetrics;
    differentFields: string[];
  }[];
};

const ignoredDiffFieldNames = new Set(["fetchedAt"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectDifferentFields(
  scrapedValue: unknown,
  dbValue: unknown,
  path = "",
): string[] {
  if (Object.is(scrapedValue, dbValue)) {
    return [];
  }

  if (Array.isArray(scrapedValue) && Array.isArray(dbValue)) {
    if (scrapedValue.length !== dbValue.length) {
      return path ? [path] : [];
    }

    const differentFields = new Set<string>();
    scrapedValue.forEach((item, index) => {
      const nextPath = path ? `${path}[${index}]` : `[${index}]`;
      collectDifferentFields(item, dbValue[index], nextPath).forEach(
        (field) => {
          differentFields.add(field);
        },
      );
    });

    return [...differentFields];
  }

  if (isRecord(scrapedValue) && isRecord(dbValue)) {
    const differentFields = new Set<string>();
    const keys = new Set([
      ...Object.keys(scrapedValue),
      ...Object.keys(dbValue),
    ]);

    keys.forEach((key) => {
      if (ignoredDiffFieldNames.has(key)) {
        return;
      }

      const nextPath = path ? `${path}.${key}` : key;
      collectDifferentFields(scrapedValue[key], dbValue[key], nextPath).forEach(
        (field) => {
          differentFields.add(field);
        },
      );
    });

    return [...differentFields];
  }

  return path ? [path] : ["値"];
}

export function computeDiff(
  scraped: ScrapedCharacterDetailWithMetrics[],
  db: ScrapedCharacterDetailWithMetrics[],
): DiffResult {
  const scrapedMap = new Map(
    scraped.map((character) => [character.characterNo, character]),
  );
  const dbMap = new Map(
    db.map((character) => [character.characterNo, character]),
  );

  const onlyInScraped = scraped.filter(
    (character) => !dbMap.has(character.characterNo),
  );
  const onlyInDb = db.filter(
    (character) => !scrapedMap.has(character.characterNo),
  );

  const different: DiffResult["different"] = [];
  for (const [characterNo, scrapedCharacter] of scrapedMap) {
    const dbCharacter = dbMap.get(characterNo);
    if (!dbCharacter) {
      continue;
    }

    const differentFields = collectDifferentFields(
      scrapedCharacter,
      dbCharacter,
    );
    if (differentFields.length > 0) {
      different.push({
        scraped: scrapedCharacter,
        db: dbCharacter,
        differentFields,
      });
    }
  }

  return { onlyInScraped, onlyInDb, different };
}

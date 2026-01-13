import type { ScrapedCharacterDetailRow } from "@/lib/types";

export type MetricKey =
  | "totalStatus"
  | "shootAT"
  | "focusAT"
  | "focusDF"
  | "scrambleAT"
  | "scrambleDF"
  | "wallDF"
  | "KP";

type MetricRow = Pick<
  ScrapedCharacterDetailRow,
  | "kick"
  | "control"
  | "technique"
  | "pressure"
  | "physical"
  | "agility"
  | "intelligence"
  | "character_no"
>;

export function getMetricValue(row: MetricRow, key: MetricKey): number | null {
  switch (key) {
    case "totalStatus": {
      const {
        kick,
        control,
        technique,
        pressure,
        physical,
        agility,
        intelligence,
      } = row;
      if (
        kick == null ||
        control == null ||
        technique == null ||
        pressure == null ||
        physical == null ||
        agility == null ||
        intelligence == null
      ) {
        return null;
      }
      return (
        kick +
        control +
        technique +
        pressure +
        physical +
        agility +
        intelligence
      );
    }
    case "shootAT": {
      const { kick, control } = row;
      if (kick == null || control == null) return null;
      return kick + control;
    }
    case "focusAT": {
      const { technique, control, kick } = row;
      if (technique == null || control == null || kick == null) return null;
      return Math.floor(technique + control + kick * 0.5);
    }
    case "focusDF": {
      const { technique, intelligence, agility } = row;
      if (technique == null || intelligence == null || agility == null)
        return null;
      return Math.floor(technique + intelligence + agility * 0.5);
    }
    case "scrambleAT": {
      const { intelligence, physical } = row;
      if (intelligence == null || physical == null) return null;
      return intelligence + physical;
    }
    case "scrambleDF": {
      const { intelligence, pressure } = row;
      if (intelligence == null || pressure == null) return null;
      return intelligence + pressure;
    }
    case "wallDF": {
      const { physical, pressure } = row;
      if (physical == null || pressure == null) return null;
      return physical + pressure;
    }
    case "KP": {
      const { agility, physical, pressure } = row;
      if (agility == null || physical == null || pressure == null) return null;
      return agility * 4 + physical * 3 + pressure * 2;
    }
  }
}

function compareCharacterNoAsc(a: number | null, b: number | null): number {
  const an = a ?? Number.MAX_SAFE_INTEGER;
  const bn = b ?? Number.MAX_SAFE_INTEGER;
  return an - bn;
}

export function sortRowsByMetric(
  rows: ScrapedCharacterDetailRow[],
  key: MetricKey,
): ScrapedCharacterDetailRow[] {
  const copy = rows.slice();
  copy.sort((a, b) => {
    const av = getMetricValue(a, key);
    const bv = getMetricValue(b, key);

    if (av == null && bv == null) {
      return compareCharacterNoAsc(a.character_no, b.character_no);
    }
    if (av == null) return 1;
    if (bv == null) return -1;

    if (bv !== av) return bv - av; // 降順（大きいほど上）

    return compareCharacterNoAsc(a.character_no, b.character_no);
  });
  return copy;
}

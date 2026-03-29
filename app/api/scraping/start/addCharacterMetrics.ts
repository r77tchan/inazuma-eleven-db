/*
totalStatusは、kick + control + technique + pressure + physical + agility + intelligence
shootATは、kick + control
focusATは、technique + control + (kick / 2)
focusDFは、technique + intelligence + (agility / 2)
scrambleATは、intelligence + physical
scrambleDFは、intelligence + pressure
wallDFは、physical + pressure
KPは、(agility * 4) + (physical * 3) + (pressure * 2)
*/

import type {
  ScrapedCharacterDetail,
  ScrapedCharacterDetailWithMetrics,
} from "@/lib/types";

function sumOrNull(...values: Array<number | null>): number | null {
  let total = 0;

  for (const value of values) {
    if (value == null) {
      return null;
    }

    total += value;
  }

  return total;
}

export default function addCharacterMetrics(
  characterDetailList: ScrapedCharacterDetail[],
): ScrapedCharacterDetailWithMetrics[] {
  return characterDetailList.map((characterDetail) => {
    const {
      kick,
      control,
      technique,
      pressure,
      physical,
      agility,
      intelligence,
    } = characterDetail;

    const totalStatus = sumOrNull(
      kick,
      control,
      technique,
      pressure,
      physical,
      agility,
      intelligence,
    );
    const shootAT = sumOrNull(kick, control);
    const focusAT =
      technique == null || control == null || kick == null
        ? null
        : technique + control + kick / 2;
    const focusDF =
      technique == null || intelligence == null || agility == null
        ? null
        : technique + intelligence + agility / 2;
    const scrambleAT = sumOrNull(intelligence, physical);
    const scrambleDF = sumOrNull(intelligence, pressure);
    const wallDF = sumOrNull(physical, pressure);
    const KP =
      agility == null || physical == null || pressure == null
        ? null
        : agility * 4 + physical * 3 + pressure * 2;

    return {
      ...characterDetail,
      totalStatus,
      shootAT,
      focusAT,
      focusDF,
      scrambleAT,
      scrambleDF,
      wallDF,
      KP,
    };
  });
}

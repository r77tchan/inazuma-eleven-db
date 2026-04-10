import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getCharacterDetail,
  getAllCharacterIds,
  getAllStatusTypeData,
  getSkillInfoByIds,
  getAuraInfoByIds,
} from "@/app/api/get-character-detail/getCharacterDetail";
import CharacterDetailContent from "./CharacterDetailContent";

export async function generateStaticParams() {
  const ids = await getAllCharacterIds();
  return ids.map((id) => ({ character_id: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ character_id: string }>;
}): Promise<Metadata> {
  const { character_id } = await params;
  const character = await getCharacterDetail(decodeURIComponent(character_id));

  if (!character) {
    return { title: "選手情報 - イナズマイレブン DB" };
  }

  return {
    title: `${character.full_name} | 選手情報 - イナズマイレブン DB`,
    description: `${character.position}「${character.full_name}」の情報ページです。`,
  };
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ character_id: string }>;
}) {
  const { character_id } = await params;
  const character = await getCharacterDetail(decodeURIComponent(character_id));

  if (!character) {
    notFound();
  }

  // スキルスロットのIDを全て収集
  const allSlotIds = [
    character.normal_slot_1,
    character.normal_slot_2,
    character.normal_slot_3,
    character.normal_default_slot_4,
    character.normal_default_slot_5,
    character.normal_default_slot_6,
    character.normal_branch_slot_4,
    character.normal_branch_slot_5,
    character.normal_branch_slot_6,
  ].filter((id): id is string => id !== null);

  // スキルIDとオーラIDを分離
  const skillIds = allSlotIds.filter(
    (id) => id.startsWith("wh") || id.startsWith("rh"),
  );
  const auraIds = allSlotIds.filter(
    (id) => !id.startsWith("wh") && !id.startsWith("rh"),
  );

  const [statusTypeData, skillInfoMap, auraInfoMap] = await Promise.all([
    getAllStatusTypeData(),
    getSkillInfoByIds(skillIds),
    getAuraInfoByIds(auraIds),
  ]);

  return (
    <CharacterDetailContent
      character={character}
      statusTypeCalcStats={statusTypeData.calcStats}
      statMax={statusTypeData.statMax}
      skillInfoMap={skillInfoMap}
      auraInfoMap={auraInfoMap}
    />
  );
}

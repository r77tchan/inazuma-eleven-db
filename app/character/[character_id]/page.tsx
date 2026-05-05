import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getCharacterDetail,
  getAllCharacterIds,
  getAllStatusTypeData,
  getSkillInfoByIds,
  getAuraInfoByIds,
  getVoicesByCharacterId,
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
    return { title: "イナイレDB - 選手詳細" };
  }

  return {
    title: `イナイレDB - ${character.full_name}`,
    description: `${character.description}`,
    openGraph: character.image_url
      ? { images: [{ url: character.image_url }] }
      : undefined,
    twitter: character.image_url
      ? { card: "summary", images: [character.image_url] }
      : undefined,
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

  // ボイス情報を取得
  const voiceEntries = await getVoicesByCharacterId(
    decodeURIComponent(character_id),
  );
  const voiceSkillIds = voiceEntries
    .filter((v) => v.kind === "skill")
    .map((v) => v.id);
  const voiceAuraIds = voiceEntries
    .filter((v) => v.kind === "aura")
    .map((v) => v.id);
  const [voiceSkillInfoMap, voiceAuraInfoMap] = await Promise.all([
    getSkillInfoByIds(voiceSkillIds),
    getAuraInfoByIds(voiceAuraIds),
  ]);

  const filteredVoiceEntries = voiceEntries.filter(
    (v) => v.kind !== "skill" || v.id in voiceSkillInfoMap,
  );

  return (
    <CharacterDetailContent
      character={character}
      statusTypeCalcStats={statusTypeData.calcStats}
      statMax={statusTypeData.statMax}
      skillInfoMap={skillInfoMap}
      auraInfoMap={auraInfoMap}
      voiceEntries={filteredVoiceEntries}
      voiceSkillInfoMap={voiceSkillInfoMap}
      voiceAuraInfoMap={voiceAuraInfoMap}
    />
  );
}

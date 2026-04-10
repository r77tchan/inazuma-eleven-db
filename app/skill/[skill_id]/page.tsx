import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getSkillDetail,
  getAllSkillIds,
  getVoiceCharactersBySkillId,
  getAuraByAuraId,
} from "@/app/api/get-skill-detail/getSkillDetail";
import type { AuraInfo } from "@/app/api/get-skill-detail/getSkillDetail";
import SkillDetailContent from "./SkillDetailContent";

export async function generateStaticParams() {
  const ids = await getAllSkillIds();
  return ids.map((id) => ({ skill_id: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ skill_id: string }>;
}): Promise<Metadata> {
  const { skill_id } = await params;
  const skill = await getSkillDetail(decodeURIComponent(skill_id));

  if (!skill) {
    return { title: "イナイレDB - 必殺技詳細" };
  }

  return {
    title: `イナイレDB - ${skill.name}`,
    description: `${skill.description}`,
    openGraph: skill.image_url
      ? { images: [{ url: skill.image_url }] }
      : undefined,
    twitter: skill.image_url
      ? { card: "summary", images: [skill.image_url] }
      : undefined,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ skill_id: string }>;
}) {
  const { skill_id } = await params;
  const skill = await getSkillDetail(decodeURIComponent(skill_id));

  if (!skill) {
    notFound();
  }

  const voiceCharacters = await getVoiceCharactersBySkillId(
    decodeURIComponent(skill_id),
  );

  // 化身/ソウル技の場合、aura情報を取得
  let auraInfo: AuraInfo | null = null;
  if ((skill.is_keshin || skill.is_soul) && skill.aura_id) {
    auraInfo = await getAuraByAuraId(skill.aura_id);
  }

  return (
    <SkillDetailContent
      skill={skill}
      voiceCharacters={voiceCharacters}
      auraInfo={auraInfo}
    />
  );
}

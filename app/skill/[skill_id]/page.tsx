import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getSkillDetail,
  getAllSkillIds,
  getVoiceCharactersBySkillId,
  getAurasByAuraIds,
} from "@/app/api/get-skill-detail/getSkillDetail";
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

  // 化身/ソウル技の場合、aura情報を取得 (aura_id は「、」区切りで複数IDが入りうる)
  const auraIds =
    (skill.is_keshin || skill.is_soul) && skill.aura_id
      ? skill.aura_id
          .split("、")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const auraInfos = await getAurasByAuraIds(auraIds);

  return (
    <SkillDetailContent
      skill={skill}
      voiceCharacters={voiceCharacters}
      auraInfos={auraInfos}
    />
  );
}

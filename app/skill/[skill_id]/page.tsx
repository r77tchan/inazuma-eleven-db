import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getSkillDetail,
  getAllSkillIds,
  getVoiceCharactersBySkillId,
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
    return { title: "必殺技情報 - イナズマイレブン DB" };
  }

  return {
    title: `${skill.name} | 必殺技情報 - イナズマイレブン DB`,
    description: `${skill.type}「${skill.name}」の情報ページです。`,
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

  return <SkillDetailContent skill={skill} voiceCharacters={voiceCharacters} />;
}

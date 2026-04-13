import type { MetadataRoute } from "next";

import { getAllCharacterIds } from "@/app/api/get-character-detail/getCharacterDetail";
import { getAllSkillIds } from "@/app/api/get-skill-detail/getSkillDetail";

const BASE_URL = "https://inazuma-eleven-db.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/character`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/skill`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // キャラクター詳細ページ（SSG）
  const characterIds = await getAllCharacterIds();
  const characterPages: MetadataRoute.Sitemap = characterIds.map((id) => ({
    url: `${BASE_URL}/character/${encodeURIComponent(id)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 必殺技詳細ページ（SSG）
  const skillIds = await getAllSkillIds();
  const skillPages: MetadataRoute.Sitemap = skillIds.map((id) => ({
    url: `${BASE_URL}/skill/${encodeURIComponent(id)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...characterPages, ...skillPages];
}

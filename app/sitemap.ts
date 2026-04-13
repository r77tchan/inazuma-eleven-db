import type { MetadataRoute } from "next";

import { getAllCharacterIds } from "@/app/api/get-character-detail/getCharacterDetail";
import { getAllSkillIds } from "@/app/api/get-skill-detail/getSkillDetail";

const BASE_URL = "https://inazuma-eleven-db.vercel.app";

/**
 * サイトマップインデックスを生成。
 * id=0: 静的ページ, id=1: キャラクター詳細, id=2: 必殺技詳細
 * → /sitemap/0.xml, /sitemap/1.xml, /sitemap/2.xml
 */
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  // id=0: 静的ページ
  if (id === 0) {
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
      },
      {
        url: `${BASE_URL}/character`,
        lastModified: new Date(),
      },
      {
        url: `${BASE_URL}/skill`,
        lastModified: new Date(),
      },
    ];
  }

  // id=1: キャラクター詳細ページ
  if (id === 1) {
    const characterIds = await getAllCharacterIds();
    return characterIds.map((cid) => ({
      url: `${BASE_URL}/character/${encodeURIComponent(cid)}`,
      lastModified: new Date(),
    }));
  }

  // id=2: 必殺技詳細ページ
  const skillIds = await getAllSkillIds();
  return skillIds.map((sid) => ({
    url: `${BASE_URL}/skill/${encodeURIComponent(sid)}`,
    lastModified: new Date(),
  }));
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/character-old/", "/scraping/", "/api/"],
    },
    sitemap: [
      "https://inazuma-eleven-db.vercel.app/sitemap.xml",
      "https://inazuma-eleven-db.vercel.app/sitemap/0.xml",
      "https://inazuma-eleven-db.vercel.app/sitemap/1.xml",
      "https://inazuma-eleven-db.vercel.app/sitemap/2.xml",
    ],
  };
}

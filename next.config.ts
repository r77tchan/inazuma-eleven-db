import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // public/img 配下はデプロイでファイル名が変わらない前提の固定アセット。
        // Vercel デフォルトの max-age=0 だと PV ごとに全アイコンの再検証が
        // Edge Requests として課金されるため、ブラウザに1年キャッシュさせる
        source: "/img/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  experimental: {
    staticGenerationRetryCount: 3,
    staticGenerationMaxConcurrency: 4,
  },
};

export default nextConfig;

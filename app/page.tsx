import Link from "next/link";

const heroTitleLines = [
  "イナズマイレブン",
  "英雄たちのヴィクトリーロード",
  "非公式データベース",
];

export default function Home() {
  return (
    <div>
      {/* メインビジュアル */}
      <section className="text-a-1000 relative isolate overflow-hidden bg-[linear-gradient(135deg,var(--hero-bg-1)_0%,var(--hero-bg-2)_45%,var(--hero-bg-3)_100%)] px-6 py-20 sm:px-10 sm:py-28">
        <div className="absolute top-0 -left-20 h-56 w-56 rounded-full bg-red-500/18 blur-3xl" />
        <div className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-sky-400/16 blur-3xl" />
        <div className="via-a-700/60 absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent to-transparent" />

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl leading-[1.4] font-bold tracking-normal text-white sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.2]">
            {heroTitleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 text-xs font-semibold tracking-[0.28em] text-gray-300 uppercase sm:text-sm">
            Inazuma Eleven Database
          </p>
        </div>
      </section>

      {/* カードセクション */}
      <section className="mx-auto mb-16 max-w-3xl px-4 pt-12">
        <h3 className="mb-6 text-xl font-bold">DBを閲覧</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/character"
            className="group border-a-800 hover:border-a-600 rounded-xl border p-6 transition hover:shadow-lg"
          >
            <img
              src="https://dxi4wb638ujep.cloudfront.net/1/k/d/w/dwho-wi8ruk.webp"
              alt="キャラクター"
              className="mb-4 size-18"
            />
            <h4 className="mb-2 text-lg font-bold">キャラクター</h4>
            <p className="text-a-500 mb-4 text-sm">ボイス情報未実装</p>
            <span className="bg-a-900 group-hover:bg-a-800 inline-block rounded-md px-4 py-2 text-sm font-medium transition">
              詳しく見る →
            </span>
          </Link>

          <Link
            href="/skill"
            className="group border-a-800 hover:border-a-600 rounded-xl border p-6 transition hover:shadow-lg"
          >
            <img
              src="https://dxi4wb638ujep.cloudfront.net/1/k/a/d/adammie74y0.webp"
              alt="必殺技"
              className="mb-4 size-18"
            />
            <h4 className="mb-2 text-lg font-bold">必殺技</h4>
            <p className="text-a-500 mb-4 text-sm">ボイス情報未実装</p>
            <span className="bg-a-900 group-hover:bg-a-800 inline-block rounded-md px-4 py-2 text-sm font-medium transition">
              詳しく見る →
            </span>
          </Link>
        </div>
      </section>

      {/* 更新履歴 */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <h3 className="mb-4 text-xl font-bold">更新履歴</h3>
        <ul className="text-a-500 space-y-2 text-sm">
          <li>
            <time dateTime="2026-04-09">2026-04-09</time>: 必殺技ページ作成
          </li>
          <li>
            <time dateTime="2026-04-08">2026-04-08</time>:
            キャラクターページのリニューアル
          </li>
          <li>
            <time dateTime="2026-03-31">2026-03-31</time>:
            オリオン後半アップデート収録
          </li>
        </ul>
      </section>
    </div>
  );
}

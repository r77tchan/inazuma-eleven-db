import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="bg-amber-100 p-4 font-bold">メインページ</h1>
      <nav className="bg-blue-100 p-4">
        <div>tmpナビゲーション</div>
        <ul className="ml-4 list-inside list-disc text-blue-800 underline marker:text-black">
          <li>
            <Link href="/">ホーム</Link>
          </li>
          <li>
            <Link href="/404">404</Link>
          </li>
          <li>
            <Link href="/scraping">スクレイピング</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

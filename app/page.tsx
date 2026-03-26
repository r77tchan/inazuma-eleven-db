import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="p-4">
        <Link href="/273293298" className="underline underline-offset-4">
          Not Found
        </Link>
      </div>
      <div className="p-4">
        <Link href="/scraping" className="underline underline-offset-4">
          Scraping
        </Link>
      </div>
    </div>
  );
}

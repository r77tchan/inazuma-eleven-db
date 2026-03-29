import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-bar text-white">
      <h1 className="text-2xl font-bold">
        <Link href="/" className="inline-block p-4 hover:bg-gray-700">
          イナイレDB
        </Link>
      </h1>
    </header>
  );
}

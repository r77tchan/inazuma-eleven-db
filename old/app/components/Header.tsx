import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-bar">
      <h1 className="text-2xl font-bold text-white">
        <Link href="/" className="inline-block px-4 py-4 hover:bg-gray-700">
          イナイレDB
        </Link>
      </h1>
    </header>
  );
}

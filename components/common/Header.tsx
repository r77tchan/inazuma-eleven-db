import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-a-0 text-a-1000">
      <h1 className="text-2xl font-bold">
        <Link href="/" className="hover:bg-a-300 inline-block p-4">
          イナイレDB
        </Link>
      </h1>
    </header>
  );
}

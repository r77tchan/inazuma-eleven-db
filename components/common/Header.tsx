import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="bg-bar flex items-center justify-between text-white">
      <h1 className="text-2xl font-bold">
        <Link href="/" prefetch={false} className="inline-block p-4 hover:bg-gray-700">
          イナイレDB
        </Link>
      </h1>
      <div className="pr-4">
        <ThemeToggle />
      </div>
    </header>
  );
}

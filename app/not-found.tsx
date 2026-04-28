import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex items-center justify-center px-4 py-16">
      <div className="text-center">
        <p className="text-a-500 text-sm">404</p>
        <h2 className="mt-2 text-3xl font-bold">ページが見つかりません</h2>
        <p className="text-a-500 mt-4 text-sm">
          URL が間違っているか、ページが移動した可能性があります。
        </p>
        <Link
          href="/"
          prefetch={false}
          className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
        >
          トップへ戻る
        </Link>
      </div>
    </section>
  );
}

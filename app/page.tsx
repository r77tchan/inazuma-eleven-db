import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="mx-2 py-16">
        <div className="container mx-auto rounded-4xl border">
          <div className="flex justify-center">
            <h2 className="bg-bar mx-4 my-8 flex w-7xl flex-col items-center justify-center bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgb(20,20,20)_6px,rgb(20,20,20)_12px)] px-2 py-16 text-2xl leading-12 font-bold text-white">
              <span>イナズマイレブン</span>
              <span>英雄たちのヴィクトリーロード</span>
              <span>非公式データベース</span>
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="border-search-border mx-4 my-8 flex w-7xl rounded-4xl border shadow-[0_0_0_2px_var(--color-search-border-shadow)]">
              <input
                type="text"
                className="flex-1 rounded-4xl rounded-r-none p-4 outline-none"
                placeholder="イナイレDBでキャラクター名またはニックネーム／よみがなを検索"
              />
              <button className="bg-search-button-background rounded-4xl rounded-l-none px-8 py-4 font-bold hover:cursor-pointer hover:brightness-95 active:brightness-90">
                検索
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

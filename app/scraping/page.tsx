"use client";
import { useState } from "react";

import type { ScrapingResult } from "@/lib/types/scraping";

export default function ScrapingPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [characterData, setCharacterData] = useState<ScrapingResult | null>(
    null,
  );

  const handleStartScraping = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/scraping/start", {
        method: "POST",
      });
      console.log(res);
      const data = await res.json();
      console.log(data);

      setCharacterData(data.result);

      if (!res.ok) throw new Error("Failed to start scraping");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <h1 className="bg-green-100 p-4 font-bold">スクレイピングページ</h1>
      <p className="bg-pink-100 p-4">
        ここでは、スクレイピングに関する情報やツールを提供しています。
      </p>
      <div className="flex justify-center p-4">
        <button
          className="border bg-amber-100 p-2 hover:scale-105 hover:cursor-pointer hover:bg-amber-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-amber-100"
          onClick={handleStartScraping}
          disabled={isRunning}
        >
          {isRunning ? "処理中..." : "スクレイピング開始"}
        </button>
      </div>
      <div className="p-4">
        <h2>スクレイピング結果:</h2>
        <p>取得件数: {characterData?.totalListCount}</p>
        <p>取得日時: {characterData?.fetchedAt}</p>
        {characterData?.characterUrlList.map((character) => (
          <ul key={character.characterNo} className="p-4">
            <li>キャラクター番号: {character.characterNo}</li>
            <li>
              詳細URL:{" "}
              <a
                href={character.detailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {character.detailUrl}
              </a>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
}

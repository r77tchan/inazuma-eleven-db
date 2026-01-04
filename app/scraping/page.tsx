"use client";
import { useState } from "react";

export default function ScrapingPage() {
  const [isRunning, setIsRunning] = useState(false);

  const handleStartScraping = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/scraping/start", {
        method: "POST",
      });
      console.log(res);
      const data = await res.json();
      console.log(data);

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
    </div>
  );
}

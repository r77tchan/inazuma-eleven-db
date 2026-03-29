"use client";

import { useState } from "react";

import type { ApiGetDbDataSuccess } from "@/app/api/get-db-data/route";
import type { ApiDeleteDbDataSuccess } from "@/app/api/scraping/delete/route";
import type {
  ApiSaveDbDataRequest,
  ApiSaveDbDataSuccess,
} from "@/app/api/scraping/save/route";
import type { ApiStartSuccess } from "@/app/api/scraping/start/route";
import type { ApiFailure } from "@/lib/api";
import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import { computeDiff, type DiffResult } from "./diff";

type ApiRequestOptions<TSuccess> = {
  url: string;
  method: "GET" | "POST" | "DELETE";
  loadingMessage: string;
  requestBody?: unknown;
  onSuccess: (data: TSuccess) => void;
};

export function useScrapingPage() {
  const [isServerProcessing, setIsServerProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<
    ScrapedCharacterDetailWithMetrics[] | null
  >(null);
  const [dbData, setDbData] = useState<
    ScrapedCharacterDetailWithMetrics[] | null
  >(null);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const showClientError = (error: unknown) => {
    setMessage(`クライアント側で問題が発生しました。\n ${error}`);
  };

  const outputToConsole = (data: unknown, outputMessage: string) => {
    console.log(data);
    setMessage(outputMessage);
  };

  const runApiRequest = async <TSuccess>({
    url,
    method,
    loadingMessage,
    requestBody,
    onSuccess,
  }: ApiRequestOptions<TSuccess>) => {
    setIsServerProcessing(true);
    setMessage(loadingMessage);

    try {
      const response = await fetch(url, {
        method,
        headers: requestBody
          ? {
              "Content-Type": "application/json",
            }
          : undefined,
        body: requestBody ? JSON.stringify(requestBody) : undefined,
      });

      if (response.ok) {
        const data: TSuccess = await response.json();
        onSuccess(data);
      } else {
        const errorData: ApiFailure = await response.json();
        setMessage(errorData.errorMessage);
      }
    } catch (error) {
      showClientError(error);
    } finally {
      setIsServerProcessing(false);
    }
  };

  const handleStartScraping = async () => {
    await runApiRequest<ApiStartSuccess>({
      url: "/api/scraping/start",
      method: "POST",
      loadingMessage: "inagleのスクレイピング中...",
      onSuccess: (data) => {
        setScrapedData(data.scrapedData);
        setMessage(data.message);
      },
    });
  };

  const handleScrapedDataConsoleOutput = () => {
    outputToConsole(
      scrapedData,
      "inagleのスクレイピング結果をコンソールに出力しました。開発者ツールのコンソールを確認してください。",
    );
  };

  const handleDbDataConsoleOutput = () => {
    outputToConsole(
      dbData,
      "DBデータをコンソールに出力しました。開発者ツールのコンソールを確認してください。",
    );
  };

  const handleDbDataOutput = async () => {
    await runApiRequest<ApiGetDbDataSuccess>({
      url: "/api/get-db-data",
      method: "GET",
      loadingMessage: "DBデータを取得中...",
      onSuccess: (data) => {
        setDbData(data.dbData);
        setMessage(data.message);
      },
    });
  };

  const handleShowDiff = () => {
    if (!scrapedData || !dbData) {
      return;
    }

    setDiffResult(computeDiff(scrapedData, dbData));
    setMessage("差分を表示しました。");
  };

  const handleSaveScrapedData = async () => {
    if (!scrapedData || scrapedData.length === 0) {
      setMessage("先に保存対象のスクレイピングデータを取得してください");
      return;
    }

    const requestBody = {
      scrapedData,
    } satisfies ApiSaveDbDataRequest;

    await runApiRequest<ApiSaveDbDataSuccess>({
      url: "/api/scraping/save",
      method: "POST",
      loadingMessage: "スクレイピングデータをDBへ保存中...",
      requestBody,
      onSuccess: (data) => {
        setMessage(`${data.message} (${data.savedCount}件)`);
      },
    });
  };

  const handleDeleteDbData = async () => {
    if (!window.confirm("DBデータをすべて削除します。よろしいですか？")) {
      setMessage("DBデータ削除をキャンセルしました。");
      return;
    }

    await runApiRequest<ApiDeleteDbDataSuccess>({
      url: "/api/scraping/delete",
      method: "DELETE",
      loadingMessage: "DBデータを全削除中...",
      onSuccess: (data) => {
        setDbData([]);
        setDiffResult(null);
        setMessage(`${data.message} (${data.deletedCount}件)`);
      },
    });
  };

  return {
    isServerProcessing,
    message,
    scrapedData,
    dbData,
    diffResult,
    handleStartScraping,
    handleScrapedDataConsoleOutput,
    handleDbDataOutput,
    handleDbDataConsoleOutput,
    handleShowDiff,
    handleDeleteDbData,
    handleSaveScrapedData,
  };
}

"use client";

import { useState } from "react";

import type { ApiPlayerMasterFetchSuccess } from "@/app/api/google-sheets/player-master/fetch/route";
import type { ApiFailure } from "@/lib/api";
import type {
  PlayerMasterEntry,
  ScrapedCharacterDetailWithMetrics,
} from "@/lib/types";

function parsePlayerMasterId(id: string): number | null {
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
}

function compareDbAndPlayerMaster(
  dbData: ScrapedCharacterDetailWithMetrics[],
  playerMasterData: PlayerMasterEntry[],
): void {
  const dbMap = new Map(dbData.map((d) => [Number(d.characterNo), d]));

  const pmMap = new Map<number, PlayerMasterEntry>();
  const pmSkipped: string[] = [];

  for (const entry of playerMasterData) {
    const numId = parsePlayerMasterId(entry.id);
    if (numId === null) {
      pmSkipped.push(entry.id);
      continue;
    }
    pmMap.set(numId, entry);
  }

  if (pmSkipped.length > 0) {
    console.log("[スキップ] 数値変換できなかった選手マスタID:", pmSkipped);
  }

  // 片方にしか存在しないID
  const onlyInDb: number[] = [];
  for (const id of dbMap.keys()) {
    if (!pmMap.has(id)) onlyInDb.push(id);
  }
  const onlyInPm: number[] = [];
  for (const id of pmMap.keys()) {
    if (!dbMap.has(id)) onlyInPm.push(id);
  }

  if (onlyInDb.length > 0) {
    console.log(`[inagleDBのみに存在] ${onlyInDb.length}件:`, onlyInDb);
  }
  if (onlyInPm.length > 0) {
    console.log(`[選手マスタのみに存在] ${onlyInPm.length}件:`, onlyInPm);
  }

  // 選手マスタ内で同一IDなのに gender/element/position が不一致
  const pmInternalInconsistent: number[] = [];
  for (const [numId, entry] of pmMap) {
    if (entry.variants.length <= 1) continue;
    const first = entry.variants[0];
    const hasInconsistency = entry.variants.some(
      (v) =>
        v.gender !== first.gender ||
        v.element !== first.element ||
        v.position !== first.position,
    );
    if (hasInconsistency) {
      pmInternalInconsistent.push(numId);
    }
  }
  if (pmInternalInconsistent.length > 0) {
    console.log(
      `[選手マスタ内不整合] 同一IDでgender/element/positionが異なる ${pmInternalInconsistent.length}件:`,
      pmInternalInconsistent,
    );
  }

  // 両方に存在するIDで gender/element/position が不一致
  const mismatchIds: { id: number; fields: string[] }[] = [];
  for (const [numId, dbChar] of dbMap) {
    const pmEntry = pmMap.get(numId);
    if (!pmEntry) continue;

    const pmFirst = pmEntry.variants[0];
    const diffFields: string[] = [];

    if (dbChar.gender !== pmFirst.gender) diffFields.push("gender");
    if (dbChar.element !== pmFirst.element) diffFields.push("element");
    if (dbChar.position !== pmFirst.position) diffFields.push("position");

    if (diffFields.length > 0) {
      mismatchIds.push({ id: numId, fields: diffFields });
    }
  }
  if (mismatchIds.length > 0) {
    console.log(`[DB⇔選手マスタ不一致] ${mismatchIds.length}件:`, mismatchIds);
  }

  if (
    onlyInDb.length === 0 &&
    onlyInPm.length === 0 &&
    pmInternalInconsistent.length === 0 &&
    mismatchIds.length === 0
  ) {
    console.log("[比較結果] 差異なし");
  }
}

export function useGoogleSheetsImport(
  dbData: ScrapedCharacterDetailWithMetrics[] | null,
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [playerMasterData, setPlayerMasterData] = useState<
    PlayerMasterEntry[] | null
  >(null);

  const handleFetchPlayerMaster = async () => {
    setIsProcessing(true);
    setMessage("Google Sheets から選手マスタを取得中...");

    try {
      const response = await fetch("/api/google-sheets/player-master/fetch", {
        method: "POST",
      });

      if (response.ok) {
        const data: ApiPlayerMasterFetchSuccess = await response.json();
        setPlayerMasterData(data.entries);
        setMessage(data.message);
      } else {
        const errorData: ApiFailure = await response.json();
        setMessage(errorData.errorMessage);
      }
    } catch (error) {
      setMessage(`クライアント側で問題が発生しました。\n ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayerMasterConsoleOutput = () => {
    console.log(playerMasterData);
    setMessage(
      "選手マスタデータをコンソールに出力しました。開発者ツールのコンソールを確認してください。",
    );
  };

  const handleCompareDbAndPlayerMaster = () => {
    if (!dbData || !playerMasterData) return;
    compareDbAndPlayerMaster(dbData, playerMasterData);
    setMessage(
      "inagleDBデータと選手マスタの比較結果をコンソールに出力しました。開発者ツールのコンソールを確認してください。",
    );
  };

  return {
    isProcessing,
    message,
    playerMasterData,
    handleFetchPlayerMaster,
    handlePlayerMasterConsoleOutput,
    handleCompareDbAndPlayerMaster,
  };
}

import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import { useGoogleSheetsImport } from "./useGoogleSheetsImport";

const buttonClassName =
  "cursor-pointer border p-2 hover:opacity-50 disabled:cursor-not-allowed disabled:border-red-500 disabled:hover:opacity-100";

type GoogleSheetsImportSectionProps = {
  dbData: ScrapedCharacterDetailWithMetrics[] | null;
};

export function GoogleSheetsImportSection({
  dbData,
}: GoogleSheetsImportSectionProps) {
  const {
    isProcessing,
    message,
    playerMasterData,
    handleFetchPlayerMaster,
    handlePlayerMasterConsoleOutput,
    handleCompareDbAndPlayerMaster,
  } = useGoogleSheetsImport(dbData);

  return (
    <section className="border-t pt-4">
      <h2 className="pl-4 text-lg font-bold">Google Sheets 取り込み</h2>
      <p className="pt-4 pl-4">
        <button
          className={buttonClassName}
          onClick={handleFetchPlayerMaster}
          disabled={isProcessing}
        >
          選手マスタ取得
        </button>
      </p>
      <p className="pt-4 pl-4">
        <button
          className={buttonClassName}
          onClick={handlePlayerMasterConsoleOutput}
          disabled={!playerMasterData}
        >
          選手マスタ出力
        </button>
      </p>
      <p className="pt-4 pl-4">
        <button
          className={buttonClassName}
          onClick={handleCompareDbAndPlayerMaster}
          disabled={!dbData || !playerMasterData}
        >
          inagleDBデータと選手マスタの比較
        </button>
      </p>
      <p className="pt-4 pl-4">{message ?? ""}</p>
    </section>
  );
}

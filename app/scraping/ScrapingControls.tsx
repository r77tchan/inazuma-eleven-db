type ActionButtonProps = {
  label: string;
  onClick: () => void;
  disabled: boolean;
};

type ScrapingControlsProps = {
  isServerProcessing: boolean;
  hasScrapedData: boolean;
  hasDbData: boolean;
  message: string | null;
  onStartScraping: () => void;
  onScrapedDataConsoleOutput: () => void;
  onDbDataOutput: () => void;
  onDbDataConsoleOutput: () => void;
  onDeleteDbData: () => void;
  onSaveScrapedData: () => void;
  onShowDiff: () => void;
};

const buttonClassName =
  "cursor-pointer border p-2 hover:opacity-50 disabled:cursor-not-allowed disabled:border-red-500 disabled:hover:opacity-100";

function ActionButton({ label, onClick, disabled }: ActionButtonProps) {
  return (
    <button className={buttonClassName} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}

export function ScrapingControls({
  isServerProcessing,
  hasScrapedData,
  hasDbData,
  message,
  onStartScraping,
  onScrapedDataConsoleOutput,
  onDbDataOutput,
  onDbDataConsoleOutput,
  onDeleteDbData,
  onSaveScrapedData,
  onShowDiff,
}: ScrapingControlsProps) {
  return (
    <>
      <p className="pt-4 pl-4">
        <ActionButton
          label="inagleのスクレイピング開始"
          onClick={onStartScraping}
          disabled={isServerProcessing}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="inagleのスクレイピング結果出力"
          onClick={onScrapedDataConsoleOutput}
          disabled={!hasScrapedData}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="DBデータ取得"
          onClick={onDbDataOutput}
          disabled={isServerProcessing}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="DBデータ出力"
          onClick={onDbDataConsoleOutput}
          disabled={!hasDbData}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="DBデータ全削除"
          onClick={onDeleteDbData}
          disabled={isServerProcessing}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="inagleのスクレイピングデータをDBへ保存"
          onClick={onSaveScrapedData}
          disabled={isServerProcessing || !hasScrapedData}
        />
      </p>
      <p className="pt-4 pl-4">
        <ActionButton
          label="スクレイピングデータとDBデータの差分表示"
          onClick={onShowDiff}
          disabled={!hasScrapedData || !hasDbData}
        />
      </p>
      <p className="pt-4 pl-4">{message ?? ""}</p>
    </>
  );
}

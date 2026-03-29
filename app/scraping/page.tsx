"use client";

import { DiffResultView } from "./DiffResultView";
import { ScrapingControls } from "./ScrapingControls";
import { useScrapingPage } from "./useScrapingPage";

export default function ScrapingPage() {
  const {
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
  } = useScrapingPage();

  return (
    <div>
      <ScrapingControls
        isServerProcessing={isServerProcessing}
        hasScrapedData={Boolean(scrapedData)}
        hasDbData={Boolean(dbData)}
        message={message}
        onStartScraping={handleStartScraping}
        onScrapedDataConsoleOutput={handleScrapedDataConsoleOutput}
        onDbDataOutput={handleDbDataOutput}
        onDbDataConsoleOutput={handleDbDataConsoleOutput}
        onDeleteDbData={handleDeleteDbData}
        onSaveScrapedData={handleSaveScrapedData}
        onShowDiff={handleShowDiff}
      />
      {diffResult && <DiffResultView diffResult={diffResult} />}
    </div>
  );
}

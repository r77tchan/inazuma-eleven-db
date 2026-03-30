import "server-only";

import type { PlayerMasterEntry, PlayerMasterVariant } from "@/lib/types";

const SPREADSHEET_ID = "1Bu-Hb5n33wNFaWkh4xMUpbMQ6JCijB9Ub4O79KSUsB4";
const SHEET_NAME = "選手マスタV4";

function buildSheetCsvUrl(): string {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: SHEET_NAME,
    range: "B3:H",
    headers: "0",
  });

  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`;
}

/**
 * RFC 4180 準拠の CSV パーサー。
 * Google Sheets の gviz/tq?tqx=out:csv 出力を想定。
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let i = 0;

  while (i <= text.length) {
    if (i === text.length) {
      if (row.length > 0) {
        rows.push(row);
      }
      break;
    }

    let field: string;

    if (text[i] === '"') {
      // Quoted field
      i++;
      field = "";
      while (i < text.length) {
        if (text[i] === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          field += text[i];
          i++;
        }
      }
    } else {
      // Unquoted field
      field = "";
      while (
        i < text.length &&
        text[i] !== "," &&
        text[i] !== "\r" &&
        text[i] !== "\n"
      ) {
        field += text[i];
        i++;
      }
    }

    row.push(field);

    if (i < text.length && text[i] === ",") {
      i++;
    } else {
      rows.push(row);
      row = [];
      if (i < text.length && text[i] === "\r") i++;
      if (i < text.length && text[i] === "\n") i++;
    }
  }

  return rows.filter((r) => !(r.length === 1 && r[0] === ""));
}

function groupByIdToEntries(rows: string[][]): PlayerMasterEntry[] {
  const grouped = new Map<string, PlayerMasterVariant[]>();

  for (const row of rows) {
    const [id, name, gender, element, position, build, note] = row;
    if (!id) continue;

    const variant: PlayerMasterVariant = {
      name: name ?? "",
      gender: gender ?? "",
      element: element ?? "",
      position: position ?? "",
      build: build ?? "",
      note: note ?? "",
    };

    const existing = grouped.get(id);
    if (existing) {
      existing.push(variant);
    } else {
      grouped.set(id, [variant]);
    }
  }

  return Array.from(grouped.entries()).map(([id, variants]) => ({
    id,
    variants,
  }));
}

export async function getPlayerMasterEntries(): Promise<PlayerMasterEntry[]> {
  const url = buildSheetCsvUrl();

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Google Sheets の取得に失敗しました (HTTP ${response.status})`,
    );
  }

  const csvText = await response.text();
  const rows = parseCsv(csvText);

  return groupByIdToEntries(rows);
}

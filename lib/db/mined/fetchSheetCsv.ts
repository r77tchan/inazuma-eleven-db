const SPREADSHEET_ID = "1ZzyVqqn_B40N-JdzyHlJnhG10frryI79Q8xnTgz2Zgs";

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

/**
 * Google Sheets からCSVを取得してパースする。
 * 1行目をヘッダー、2行目以降をデータとして返す。
 */
export async function fetchSheetAsRecords(
  sheetName: string,
): Promise<Record<string, string>[]> {
  const params = new URLSearchParams({
    tqx: "out:csv",
    sheet: sheetName,
  });
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params.toString()}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Google Sheets の取得に失敗しました (HTTP ${response.status}): sheet=${sheetName}`,
    );
  }

  const csvText = await response.text();
  const allRows = parseCsv(csvText);

  if (allRows.length === 0) {
    return [];
  }

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = row[j] ?? "";
    }
    return record;
  });
}

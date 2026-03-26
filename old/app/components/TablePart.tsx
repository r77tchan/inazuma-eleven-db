import type { SearchCharactersResponse } from "@/app/actions/searchCharacters";
import type { MetricKey } from "@/lib/characterMetrics";
import { getMetricValue } from "@/lib/characterMetrics";
import Image from "next/image";
import React, { memo, useRef } from "react";

type TablePartProps = {
  searchResult: SearchCharactersResponse | null;
  viewTableColumn: { [key: string]: boolean };
  setSearchResult: React.Dispatch<
    React.SetStateAction<SearchCharactersResponse | null>
  >;
};

const TablePart = memo(function TablePart({
  searchResult,
  viewTableColumn,
  setSearchResult,
}: TablePartProps) {
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const rafIdRef = useRef<number | null>(null);
  const latestClientXRef = useRef(0);

  const applyDragScroll = () => {
    rafIdRef.current = null;
    if (!isDraggingRef.current) return;
    const el = tableScrollRef.current;
    if (!el) return;

    const dx = latestClientXRef.current - dragStartXRef.current;
    el.scrollLeft = dragStartScrollLeftRef.current - dx;
  };

  const onTablePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // タッチはブラウザ標準スクロールに任せる
    if (e.pointerType !== "mouse") return;
    // 左クリック以外は無視
    if (e.button !== 0) return;

    // ボタン等の操作要素上ではドラッグ開始しない（クリックを優先）
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, select, textarea, label")) return;

    const el = tableScrollRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    latestClientXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    // ポインターキャプチャを設定（テーブル外にポインターが出てもポインターイベントを受け取る）
    el.setPointerCapture(e.pointerId);

    // テキスト選択を完全に抑止
    e.preventDefault();
  };

  const onTablePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    if (pointerIdRef.current !== e.pointerId) return;
    const el = tableScrollRef.current;
    if (!el) return;

    latestClientXRef.current = e.clientX;
    if (rafIdRef.current == null) {
      rafIdRef.current = window.requestAnimationFrame(applyDragScroll);
    }
    // ドラッグ中のテキスト選択を抑える
    e.preventDefault();
  };

  const endTableDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    pointerIdRef.current = null;

    if (rafIdRef.current != null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    const el = tableScrollRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const formatMetric = (
    row: Parameters<typeof getMetricValue>[0],
    key: MetricKey,
  ) => {
    const v = getMetricValue(row, key);
    return v == null ? "-" : v;
  };

  return searchResult ? (
    <div className="mt-8">
      <div
        className="mx-auto w-fit max-w-full cursor-grab overflow-x-auto select-none active:cursor-grabbing"
        ref={tableScrollRef}
        onPointerDown={onTablePointerDown}
        onPointerMove={onTablePointerMove}
        onPointerUp={endTableDrag}
        onPointerCancel={endTableDrag}
      >
        <table className="mx-auto border-collapse border text-center whitespace-nowrap">
          <thead>
            <tr className="*:border *:p-2">
              {viewTableColumn["remove"] && <th>除外</th>}
              <th>No.</th>
              <th>名前</th>
              <th>ニックネーム</th>
              {viewTableColumn["gender"] && <th>性別</th>}
              {viewTableColumn["element"] && <th>属性</th>}
              {viewTableColumn["position"] && <th>ポジション</th>}
              {viewTableColumn["kick"] && <th>キック</th>}
              {viewTableColumn["control"] && <th>コントロール</th>}
              {viewTableColumn["technique"] && <th>テクニック</th>}
              {viewTableColumn["pressure"] && <th>プレッシャー</th>}
              {viewTableColumn["physical"] && <th>フィジカル</th>}
              {viewTableColumn["agility"] && <th>アジリティ</th>}
              {viewTableColumn["intelligence"] && <th>インテリジェンス</th>}
              {viewTableColumn["totalStatus"] && <th>ステータス合計</th>}
              {viewTableColumn["shootAT"] && <th>シュートAT</th>}
              {viewTableColumn["focusAT"] && <th>フォーカスAT</th>}
              {viewTableColumn["focusDF"] && <th>フォーカスDF</th>}
              {viewTableColumn["scrambleAT"] && <th>スクランブルAT</th>}
              {viewTableColumn["scrambleDF"] && <th>スクランブルDF</th>}
              {viewTableColumn["wallDF"] && <th>城壁DF</th>}
              {viewTableColumn["KP"] && <th>KP</th>}
            </tr>
          </thead>
          <tbody>
            {searchResult.rows.map((row) => (
              <tr
                key={row.character_no}
                className="hover:bg-search-border-shadow *:border *:p-2"
              >
                {viewTableColumn["remove"] && (
                  <td>
                    <button
                      className="grid h-7 w-7 place-items-center bg-red-500 font-bold text-white hover:cursor-pointer hover:brightness-95 active:brightness-90"
                      onClick={() => {
                        setSearchResult((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            rows: prev.rows.filter(
                              (r) => r.character_no !== row.character_no,
                            ),
                          };
                        });
                      }}
                      aria-label="除外"
                      title="除外"
                    >
                      ×
                    </button>
                  </td>
                )}
                <td>{row.character_no}</td>
                <td className="text-left">
                  <div className="inline-flex w-max items-center gap-3 whitespace-nowrap">
                    <img
                      src={row.image_url}
                      alt={row.full_name.map((n) => n.name).join("")}
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                      className="h-12 w-12 shrink-0"
                    />
                    <div className="flex w-max flex-col">
                      <div>{row.full_name.map((n) => n.name).join("")}</div>
                      <div className="text-xs">
                        {row.full_name.map((n) => n.ruby).join("")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-left">
                  <div className="flex w-max flex-col whitespace-nowrap">
                    <div>{row.nickname.map((n) => n.name).join("")}</div>
                    <div className="text-xs">
                      {row.nickname.map((n) => n.ruby).join("")}
                    </div>
                  </div>
                </td>
                {viewTableColumn["gender"] && <td>{row.gender}</td>}
                {viewTableColumn["element"] && <td>{row.element}</td>}
                {viewTableColumn["position"] && <td>{row.position}</td>}
                {viewTableColumn["kick"] && <td>{row.kick ?? "-"}</td>}
                {viewTableColumn["control"] && <td>{row.control ?? "-"}</td>}
                {viewTableColumn["technique"] && (
                  <td>{row.technique ?? "-"}</td>
                )}
                {viewTableColumn["pressure"] && <td>{row.pressure ?? "-"}</td>}
                {viewTableColumn["physical"] && <td>{row.physical ?? "-"}</td>}
                {viewTableColumn["agility"] && <td>{row.agility ?? "-"}</td>}
                {viewTableColumn["intelligence"] && (
                  <td>{row.intelligence ?? "-"}</td>
                )}
                {viewTableColumn["totalStatus"] && (
                  <td>{formatMetric(row, "totalStatus")}</td>
                )}
                {viewTableColumn["shootAT"] && (
                  <td>{formatMetric(row, "shootAT")}</td>
                )}
                {viewTableColumn["focusAT"] && (
                  <td>{formatMetric(row, "focusAT")}</td>
                )}
                {viewTableColumn["focusDF"] && (
                  <td>{formatMetric(row, "focusDF")}</td>
                )}
                {viewTableColumn["scrambleAT"] && (
                  <td>{formatMetric(row, "scrambleAT")}</td>
                )}
                {viewTableColumn["scrambleDF"] && (
                  <td>{formatMetric(row, "scrambleDF")}</td>
                )}
                {viewTableColumn["wallDF"] && (
                  <td>{formatMetric(row, "wallDF")}</td>
                )}
                {viewTableColumn["KP"] && <td>{formatMetric(row, "KP")}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;
});

TablePart.displayName = "TablePart";

export default TablePart;

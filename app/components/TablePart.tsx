import type { SearchCharactersResponse } from "@/app/actions/searchCharacters";
import Image from "next/image";
import React, { useRef } from "react";

export default function TablePart({
  searchResult,
  viewTableColumn,
  setSearchResult,
}: {
  searchResult: SearchCharactersResponse | null;
  viewTableColumn: { [key: string]: boolean };
  setSearchResult: React.Dispatch<
    React.SetStateAction<SearchCharactersResponse | null>
  >;
}) {
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);

  const onTablePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // タッチはブラウザ標準スクロールに任せる
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;

    // ボタン等の操作要素上ではドラッグ開始しない（クリックを優先）
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, select, textarea, label")) return;

    const el = tableScrollRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);

    // テキスト選択を完全に抑止
    e.preventDefault();
  };

  const onTablePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = tableScrollRef.current;
    if (!el) return;

    const dx = e.clientX - dragStartXRef.current;
    el.scrollLeft = dragStartScrollLeftRef.current - dx;
    // ドラッグ中のテキスト選択を抑える
    e.preventDefault();
  };

  const endTableDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const el = tableScrollRef.current;
    if (el) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const formatShootAT = (kick: number | null, control: number | null) => {
    if (kick == null || control == null) return "-";
    return kick + control;
  };

  const formatFocusAT = (
    technique: number | null,
    control: number | null,
    kick: number | null,
  ) => {
    if (technique == null || control == null || kick == null) return "-";
    return Math.floor(technique + control + kick * 0.5);
  };

  const formatFocusDF = (
    technique: number | null,
    intelligence: number | null,
    agility: number | null,
  ) => {
    if (technique == null || intelligence == null || agility == null)
      return "-";
    return Math.floor(technique + intelligence + agility * 0.5);
  };

  const formatScrambleAT = (
    intelligence: number | null,
    physical: number | null,
  ) => {
    if (intelligence == null || physical == null) return "-";
    return intelligence + physical;
  };

  const formatScrambleDF = (
    intelligence: number | null,
    pressure: number | null,
  ) => {
    if (intelligence == null || pressure == null) return "-";
    return intelligence + pressure;
  };

  const formatWallDF = (physical: number | null, pressure: number | null) => {
    if (physical == null || pressure == null) return "-";
    return physical + pressure;
  };

  const formatKP = (
    agility: number | null,
    physical: number | null,
    pressure: number | null,
  ) => {
    if (agility == null || physical == null || pressure == null) return "-";
    return agility * 4 + physical * 3 + pressure * 2;
  };

  const formatStatusTotal = (row: {
    kick: number | null;
    control: number | null;
    technique: number | null;
    pressure: number | null;
    physical: number | null;
    agility: number | null;
    intelligence: number | null;
  }) => {
    const {
      kick,
      control,
      technique,
      pressure,
      physical,
      agility,
      intelligence,
    } = row;
    if (
      kick == null ||
      control == null ||
      technique == null ||
      pressure == null ||
      physical == null ||
      agility == null ||
      intelligence == null
    ) {
      return "-";
    }
    return (
      kick + control + technique + pressure + physical + agility + intelligence
    );
  };

  return searchResult ? (
    <div
      className="mt-8 cursor-grab overflow-x-auto select-none active:cursor-grabbing"
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
                  <Image
                    src={row.image_url}
                    alt={row.full_name.map((n) => n.name).join("")}
                    width={48}
                    height={48}
                    sizes="48px"
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
              {viewTableColumn["technique"] && <td>{row.technique ?? "-"}</td>}
              {viewTableColumn["pressure"] && <td>{row.pressure ?? "-"}</td>}
              {viewTableColumn["physical"] && <td>{row.physical ?? "-"}</td>}
              {viewTableColumn["agility"] && <td>{row.agility ?? "-"}</td>}
              {viewTableColumn["intelligence"] && (
                <td>{row.intelligence ?? "-"}</td>
              )}
              {viewTableColumn["totalStatus"] && (
                <td>
                  {formatStatusTotal({
                    kick: row.kick,
                    control: row.control,
                    technique: row.technique,
                    pressure: row.pressure,
                    physical: row.physical,
                    agility: row.agility,
                    intelligence: row.intelligence,
                  })}
                </td>
              )}
              {viewTableColumn["shootAT"] && (
                <td>{formatShootAT(row.kick, row.control)}</td>
              )}
              {viewTableColumn["focusAT"] && (
                <td>{formatFocusAT(row.technique, row.control, row.kick)}</td>
              )}
              {viewTableColumn["focusDF"] && (
                <td>
                  {formatFocusDF(row.technique, row.intelligence, row.agility)}
                </td>
              )}
              {viewTableColumn["scrambleAT"] && (
                <td>{formatScrambleAT(row.intelligence, row.physical)}</td>
              )}
              {viewTableColumn["scrambleDF"] && (
                <td>{formatScrambleDF(row.intelligence, row.pressure)}</td>
              )}
              {viewTableColumn["wallDF"] && (
                <td>{formatWallDF(row.physical, row.pressure)}</td>
              )}
              {viewTableColumn["KP"] && (
                <td>{formatKP(row.agility, row.physical, row.pressure)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
}

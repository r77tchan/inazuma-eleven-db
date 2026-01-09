"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { searchCharactersAction } from "@/app/actions/searchCharacters";
import type { SearchCharactersResponse } from "@/app/actions/searchCharacters";
import Image from "next/image";

export default function Home() {
  const characterNameSearchInputRef = useRef<HTMLInputElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const [selectedTab, setSelectedTab] = useState<"history" | "options">(
    "history",
  );
  const [viewTableColumn, setViewTableColumn] = useState<{
    [key: string]: boolean;
  }>({
    remove: false,
    gender: false,
    element: false,
    position: false,
    kick: false,
    control: false,
    technique: false,
    pressure: false,
    physical: false,
    agility: false,
    intelligence: false,
    totalStatus: true,
    shootAT: true,
    focusAT: true,
    focusDF: true,
    scrambleAT: true,
    scrambleDF: true,
    wallDF: true,
    KP: true,
  });
  const [searchResultMode, setSearchResultMode] = useState<
    "overwrite" | "append"
  >("overwrite");
  const [maxLimit, setMaxLimit] = useState<"50" | "200" | "unlimited">("50");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [searchResult, setSearchResult] =
    useState<SearchCharactersResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const changeViewTableColumn = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setViewTableColumn((prev) => {
      return {
        ...prev,
        [name]: checked,
      };
    });
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

  const handleSearch = async () => {
    if (isPending) return;

    const characterNameSearchInputRefQuery =
      characterNameSearchInputRef.current?.value ?? "";
    startTransition(async () => {
      const result = await searchCharactersAction(
        characterNameSearchInputRefQuery,
        maxLimit === "unlimited" ? undefined : Number(maxLimit),
      );
      if (searchResultMode === "overwrite") {
        setSearchResult(result);
      } else if (searchResultMode === "append") {
        setSearchResult((prev) => {
          if (!prev) return result;
          const existingNos = new Set(
            prev.rows
              .map((r) => r.character_no)
              .filter((n): n is number => n != null),
          );

          const dedupedNextRows = result.rows.filter((r) => {
            const no = r.character_no;
            if (no == null) return true;
            if (existingNos.has(no)) return false;
            existingNos.add(no);
            return true;
          });
          return {
            ...result,
            rows: [...prev.rows, ...dedupedNextRows],
          };
        });
      }
      console.log("searchCharactersAction result:", result);
    });

    characterNameSearchInputRef.current?.blur();
    setIsInputFocused(false);
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();

    characterNameSearchInputRef.current!.value = "";
  };

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

  return (
    <div>
      <div className="py-16">
        <div className="mx-0">
          <div className="bg-search-bg container mx-auto sm:rounded-4xl">
            <div className="flex justify-center">
              <h2 className="bg-bar my-8 flex w-7xl flex-col items-center justify-center bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgb(20,20,20)_6px,rgb(20,20,20)_12px)] px-2 py-16 text-center text-2xl leading-12 font-bold text-white sm:mx-4">
                <span>イナズマイレブン</span>
                <span>英雄たちのヴィクトリーロード</span>
                <span>非公式データベース</span>
              </h2>
            </div>
            <div className="flex justify-center">
              <div
                className={`border-search-border mx-2 my-8 flex w-7xl rounded-4xl border sm:mx-4 ${
                  isPending
                    ? "shadow-[0_0_0_4px_var(--color-search-border-shadow-disabled)]"
                    : isInputFocused
                      ? "shadow-[0_0_0_4px_var(--color-search-border-shadow-active)]"
                      : "shadow-[0_0_0_2px_var(--color-search-border-shadow)]"
                }`}
              >
                <input
                  type="text"
                  className="bg-background flex-1 rounded-4xl rounded-r-none p-4 outline-none"
                  placeholder="イナイレDBでキャラクター名またはニックネーム／よみがなを検索"
                  ref={characterNameSearchInputRef}
                  disabled={isPending}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(e) => {
                    // IME変換確定のEnterでは検索しない
                    if (e.key !== "Enter") return;
                    if (isComposing || e.nativeEvent.isComposing) return;
                    handleSearch();
                  }}
                />
                <button
                  className="bg-search-button-background rounded-4xl rounded-l-none px-8 py-4 font-bold hover:cursor-pointer hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
                  onClick={handleSearch}
                  type="button"
                  disabled={isPending}
                >
                  <span className="flex items-center gap-2">
                    {isPending ? (
                      <span
                        className="border-search-border h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                        aria-label="読み込み中"
                      />
                    ) : null}
                    <span>{isPending ? "検索中" : "検索"}</span>
                  </span>
                </button>
              </div>
            </div>
            <div className="mx-2 pb-8 sm:mx-4">
              <div className="flex">
                <div
                  className={`border-tab-border border p-2 font-bold hover:cursor-pointer ${
                    selectedTab === "history"
                      ? "bg-background border-b-0 hover:brightness-95 active:brightness-90"
                      : "bg-tab-button hover:brightness-85 active:brightness-80"
                  }`}
                  onClick={() => setSelectedTab("history")}
                >
                  更新履歴
                </div>
                <div
                  className={`border-tab-border border border-l-0 p-2 font-bold hover:cursor-pointer ${
                    selectedTab === "options"
                      ? "bg-background border-b-0 hover:brightness-95 active:brightness-90"
                      : "bg-tab-button hover:brightness-85 active:brightness-80"
                  }`}
                  onClick={() => setSelectedTab("options")}
                >
                  オプション
                </div>
                <div className="border-tab-border flex-1 border-b"></div>
              </div>
              <div className="border-tab-border bg-background border border-t-0 p-2">
                {selectedTab === "history" && (
                  <div>
                    <ul>
                      <li>準備中</li>
                      <li>aaa</li>
                      <li>aaa</li>
                      <li>aaa</li>
                    </ul>
                  </div>
                )}
                {selectedTab === "options" && (
                  <>
                    <div>
                      <p>最大取得数</p>
                      <div className="p-2 *:inline-block *:p-2">
                        <label>
                          <input
                            type="radio"
                            name="max-limit"
                            value="50"
                            checked={maxLimit === "50"}
                            onChange={() => setMaxLimit("50")}
                          />
                          50件
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="max-limit"
                            value="200"
                            checked={maxLimit === "200"}
                            onChange={() => setMaxLimit("200")}
                          />
                          200件
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="max-limit"
                            value="unlimited"
                            checked={maxLimit === "unlimited"}
                            onChange={() => setMaxLimit("unlimited")}
                          />
                          無制限
                        </label>
                      </div>
                    </div>
                    <div>
                      <p>検索結果をテーブルに</p>
                      <div className="p-2 *:inline-block *:p-2">
                        <label>
                          <input
                            type="radio"
                            name="search-result-mode"
                            value="overwrite"
                            checked={searchResultMode === "overwrite"}
                            onChange={() => setSearchResultMode("overwrite")}
                          />
                          上書き
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="search-result-mode"
                            value="append"
                            checked={searchResultMode === "append"}
                            onChange={() => setSearchResultMode("append")}
                          />
                          追加
                        </label>
                      </div>
                    </div>
                    <div>
                      <p>表示する列</p>
                      <div className="p-2 *:inline-block *:p-2">
                        <label>
                          <input
                            type="checkbox"
                            name="remove"
                            checked={viewTableColumn["remove"]}
                            onChange={changeViewTableColumn}
                          />
                          除外ボタン
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="gender"
                            checked={viewTableColumn["gender"]}
                            onChange={changeViewTableColumn}
                          />
                          性別
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="element"
                            checked={viewTableColumn["element"]}
                            onChange={changeViewTableColumn}
                          />
                          属性
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="position"
                            checked={viewTableColumn["position"]}
                            onChange={changeViewTableColumn}
                          />
                          ポジション
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="kick"
                            checked={viewTableColumn["kick"]}
                            onChange={changeViewTableColumn}
                          />
                          キック
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="control"
                            checked={viewTableColumn["control"]}
                            onChange={changeViewTableColumn}
                          />
                          コントロール
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="technique"
                            checked={viewTableColumn["technique"]}
                            onChange={changeViewTableColumn}
                          />
                          テクニック
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="pressure"
                            checked={viewTableColumn["pressure"]}
                            onChange={changeViewTableColumn}
                          />
                          プレッシャー
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="physical"
                            checked={viewTableColumn["physical"]}
                            onChange={changeViewTableColumn}
                          />
                          フィジカル
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="agility"
                            checked={viewTableColumn["agility"]}
                            onChange={changeViewTableColumn}
                          />
                          アジリティ
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="intelligence"
                            checked={viewTableColumn["intelligence"]}
                            onChange={changeViewTableColumn}
                          />
                          インテリジェンス
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="totalStatus"
                            checked={viewTableColumn["totalStatus"]}
                            onChange={changeViewTableColumn}
                          />
                          ステータス合計
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="shootAT"
                            checked={viewTableColumn["shootAT"]}
                            onChange={changeViewTableColumn}
                          />
                          シュートAT
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="focusAT"
                            checked={viewTableColumn["focusAT"]}
                            onChange={changeViewTableColumn}
                          />
                          フォーカスAT
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="focusDF"
                            checked={viewTableColumn["focusDF"]}
                            onChange={changeViewTableColumn}
                          />
                          フォーカスDF
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="scrambleAT"
                            checked={viewTableColumn["scrambleAT"]}
                            onChange={changeViewTableColumn}
                          />
                          スクランブルAT
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="scrambleDF"
                            checked={viewTableColumn["scrambleDF"]}
                            onChange={changeViewTableColumn}
                          />
                          スクランブルDF
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="wallDF"
                            checked={viewTableColumn["wallDF"]}
                            onChange={changeViewTableColumn}
                          />
                          城壁DF
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            name="KP"
                            checked={viewTableColumn["KP"]}
                            onChange={changeViewTableColumn}
                          />
                          KP
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {searchResult ? (
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
                    {viewTableColumn["control"] && (
                      <td>{row.control ?? "-"}</td>
                    )}
                    {viewTableColumn["technique"] && (
                      <td>{row.technique ?? "-"}</td>
                    )}
                    {viewTableColumn["pressure"] && (
                      <td>{row.pressure ?? "-"}</td>
                    )}
                    {viewTableColumn["physical"] && (
                      <td>{row.physical ?? "-"}</td>
                    )}
                    {viewTableColumn["agility"] && (
                      <td>{row.agility ?? "-"}</td>
                    )}
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
                      <td>
                        {formatFocusAT(row.technique, row.control, row.kick)}
                      </td>
                    )}
                    {viewTableColumn["focusDF"] && (
                      <td>
                        {formatFocusDF(
                          row.technique,
                          row.intelligence,
                          row.agility,
                        )}
                      </td>
                    )}
                    {viewTableColumn["scrambleAT"] && (
                      <td>
                        {formatScrambleAT(row.intelligence, row.physical)}
                      </td>
                    )}
                    {viewTableColumn["scrambleDF"] && (
                      <td>
                        {formatScrambleDF(row.intelligence, row.pressure)}
                      </td>
                    )}
                    {viewTableColumn["wallDF"] && (
                      <td>{formatWallDF(row.physical, row.pressure)}</td>
                    )}
                    {viewTableColumn["KP"] && (
                      <td>
                        {formatKP(row.agility, row.physical, row.pressure)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

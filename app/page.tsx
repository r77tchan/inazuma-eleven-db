"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";

import { searchCharactersAction } from "@/app/actions/searchCharacters";
import type { SearchCharactersResponse } from "@/app/actions/searchCharacters";
import Image from "next/image";

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const [selectedTab, setSelectedTab] = useState<"history" | "options">(
    "history",
  );
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [searchResult, setSearchResult] =
    useState<SearchCharactersResponse | null>(null);
  const [isPending, startTransition] = useTransition();

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

    const query = inputRef.current?.value ?? "";
    startTransition(async () => {
      const result = await searchCharactersAction(query, 1);
      setSearchResult(result);
      console.log("searchCharactersAction result:", result);
    });

    inputRef.current?.blur();
    setIsInputFocused(false);
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  };

  const onTablePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // タッチはブラウザ標準スクロールに任せる
    if (e.pointerType !== "mouse") return;
    if (e.button !== 0) return;

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
                  ref={inputRef}
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
                  検索オプション
                </div>
                <div className="border-tab-border flex-1 border-b"></div>
              </div>
              <div className="border-tab-border bg-background border border-t-0 p-2">
                {selectedTab === "history" && (
                  <div>
                    <ul>
                      <li>aaa</li>
                      <li>aaa</li>
                      <li>aaa</li>
                      <li>aaa</li>
                    </ul>
                  </div>
                )}
                {selectedTab === "options" && (
                  <div>
                    <p>表示列</p>
                    <label>
                      <input type="checkbox" name="gender" />
                      性別
                    </label>
                  </div>
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
                  <th>No.</th>
                  <th>名前</th>
                  <th>ニックネーム</th>
                  <th>性別</th>
                  <th>属性</th>
                  <th>ポジション</th>
                  <th>キック</th>
                  <th>コントロール</th>
                  <th>テクニック</th>
                  <th>プレッシャー</th>
                  <th>フィジカル</th>
                  <th>アジリティ</th>
                  <th>インテリジェンス</th>
                  <th>ステータス合計</th>
                  <th>シュートAT</th>
                  <th>フォーカスAT</th>
                  <th>フォーカスDF</th>
                  <th>スクランブルAT</th>
                  <th>スクランブルDF</th>
                  <th>城壁DF</th>
                  <th>KP</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.rows.map((row) => (
                  <tr
                    key={row.character_no}
                    className="hover:bg-search-border-shadow *:border *:p-2"
                  >
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
                    <td>{row.gender}</td>
                    <td>{row.element}</td>
                    <td>{row.position}</td>
                    <td>{row.kick ?? "-"}</td>
                    <td>{row.control ?? "-"}</td>
                    <td>{row.technique ?? "-"}</td>
                    <td>{row.pressure ?? "-"}</td>
                    <td>{row.physical ?? "-"}</td>
                    <td>{row.agility ?? "-"}</td>
                    <td>{row.intelligence ?? "-"}</td>
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
                    <td>{formatShootAT(row.kick, row.control)}</td>
                    <td>
                      {formatFocusAT(row.technique, row.control, row.kick)}
                    </td>
                    <td>
                      {formatFocusDF(
                        row.technique,
                        row.intelligence,
                        row.agility,
                      )}
                    </td>
                    <td>{formatScrambleAT(row.intelligence, row.physical)}</td>
                    <td>{formatScrambleDF(row.intelligence, row.pressure)}</td>
                    <td>{formatWallDF(row.physical, row.pressure)}</td>
                    <td>{formatKP(row.agility, row.physical, row.pressure)}</td>
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

import { useState } from "react";

import type { MetricKey } from "@/lib/characterMetrics";

export default function TabPart({
  selectedTab,
  setSelectedTab,
  maxLimit,
  setMaxLimit,
  searchResultMode,
  setSearchResultMode,
  viewTableColumn,
  changeViewTableColumn,
  canSort,
  handleSort,
}: {
  selectedTab: "history" | "options";
  setSelectedTab: (tab: "history" | "options") => void;
  maxLimit: "50" | "200" | "unlimited";
  setMaxLimit: (limit: "50" | "200" | "unlimited") => void;
  searchResultMode: "overwrite" | "append";
  setSearchResultMode: (mode: "overwrite" | "append") => void;
  viewTableColumn: { [key: string]: boolean };
  changeViewTableColumn: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canSort: boolean;
  handleSort: (key: MetricKey) => void;
}) {
  const [sortKey, setSortKey] = useState<MetricKey>("totalStatus");

  return (
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
            <div>
              <p>並べ替え</p>
              <div className="flex flex-wrap gap-2 p-2">
                <select
                  className="border p-2"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as MetricKey)}
                >
                  <option value="totalStatus">ステータス合計</option>
                  <option value="shootAT">シュートAT</option>
                  <option value="focusAT">フォーカスAT</option>
                  <option value="focusDF">フォーカスDF</option>
                  <option value="scrambleAT">スクランブルAT</option>
                  <option value="scrambleDF">スクランブルDF</option>
                  <option value="wallDF">城壁DF</option>
                  <option value="KP">KP</option>
                </select>
                <button
                  className="bg-tab-exe-button rounded border p-2 hover:cursor-pointer hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
                  type="button"
                  disabled={!canSort}
                  onClick={() => handleSort(sortKey)}
                >
                  実行
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

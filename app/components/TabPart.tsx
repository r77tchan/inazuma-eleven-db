import { useEffect, useState, useTransition } from "react";
import type { ChangeEvent } from "react";

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
  changeViewTableColumn: (name: string, checked: boolean) => void;
  canSort: boolean;
  handleSort: (key: MetricKey) => void;
}) {
  const [sortKey, setSortKey] = useState<MetricKey>("totalStatus");
  const [isSortingPending, startSortingTransition] = useTransition();
  const [, startViewColumnTransition] = useTransition();
  const [localViewTableColumn, setLocalViewTableColumn] =
    useState(viewTableColumn);

  useEffect(() => {
    setLocalViewTableColumn(viewTableColumn);
  }, [viewTableColumn]);

  const handleViewColumnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLocalViewTableColumn((prev) => {
      return {
        ...prev,
        [name]: checked,
      };
    });
    startViewColumnTransition(() => changeViewTableColumn(name, checked));
  };

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
                    checked={localViewTableColumn["remove"]}
                    onChange={handleViewColumnChange}
                  />
                  除外ボタン
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="gender"
                    checked={localViewTableColumn["gender"]}
                    onChange={handleViewColumnChange}
                  />
                  性別
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="element"
                    checked={localViewTableColumn["element"]}
                    onChange={handleViewColumnChange}
                  />
                  属性
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="position"
                    checked={localViewTableColumn["position"]}
                    onChange={handleViewColumnChange}
                  />
                  ポジション
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="kick"
                    checked={localViewTableColumn["kick"]}
                    onChange={handleViewColumnChange}
                  />
                  キック
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="control"
                    checked={localViewTableColumn["control"]}
                    onChange={handleViewColumnChange}
                  />
                  コントロール
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="technique"
                    checked={localViewTableColumn["technique"]}
                    onChange={handleViewColumnChange}
                  />
                  テクニック
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="pressure"
                    checked={localViewTableColumn["pressure"]}
                    onChange={handleViewColumnChange}
                  />
                  プレッシャー
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="physical"
                    checked={localViewTableColumn["physical"]}
                    onChange={handleViewColumnChange}
                  />
                  フィジカル
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="agility"
                    checked={localViewTableColumn["agility"]}
                    onChange={handleViewColumnChange}
                  />
                  アジリティ
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="intelligence"
                    checked={localViewTableColumn["intelligence"]}
                    onChange={handleViewColumnChange}
                  />
                  インテリジェンス
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="totalStatus"
                    checked={localViewTableColumn["totalStatus"]}
                    onChange={handleViewColumnChange}
                  />
                  ステータス合計
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="shootAT"
                    checked={localViewTableColumn["shootAT"]}
                    onChange={handleViewColumnChange}
                  />
                  シュートAT
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="focusAT"
                    checked={localViewTableColumn["focusAT"]}
                    onChange={handleViewColumnChange}
                  />
                  フォーカスAT
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="focusDF"
                    checked={localViewTableColumn["focusDF"]}
                    onChange={handleViewColumnChange}
                  />
                  フォーカスDF
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="scrambleAT"
                    checked={localViewTableColumn["scrambleAT"]}
                    onChange={handleViewColumnChange}
                  />
                  スクランブルAT
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="scrambleDF"
                    checked={localViewTableColumn["scrambleDF"]}
                    onChange={handleViewColumnChange}
                  />
                  スクランブルDF
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="wallDF"
                    checked={localViewTableColumn["wallDF"]}
                    onChange={handleViewColumnChange}
                  />
                  城壁DF
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="KP"
                    checked={localViewTableColumn["KP"]}
                    onChange={handleViewColumnChange}
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
                  className="bg-tab-exe-button flex items-center gap-2 rounded border p-2 hover:cursor-pointer hover:brightness-95 active:brightness-90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
                  type="button"
                  aria-busy={isSortingPending}
                  disabled={!canSort || isSortingPending}
                  onClick={() =>
                    startSortingTransition(() => handleSort(sortKey))
                  }
                >
                  {isSortingPending && (
                    <span
                      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                      aria-hidden="true"
                    />
                  )}
                  {isSortingPending ? "実行中" : "実行"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

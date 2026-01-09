export default function SearchPart({
  isPending,
  isInputFocused,
  characterNameSearchInputRef,
  setIsInputFocused,
  setIsComposing,
  isComposing,
  handleSearch,
}: {
  isPending: boolean;
  isInputFocused: boolean;
  characterNameSearchInputRef: React.RefObject<HTMLInputElement | null>;
  setIsInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>;
  isComposing: boolean;
  handleSearch: () => void;
}) {
  return (
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
  );
}

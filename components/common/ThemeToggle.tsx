"use client";

import { useEffect, useState } from "react";
import { IoSunny, IoMoon } from "react-icons/io5";
import { HiComputerDesktop } from "react-icons/hi2";

type Theme = "light" | "auto" | "dark";

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("auto");

  // 初期化: localStorage から読み込み
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "auto") {
      setTheme(stored);
    }
  }, []);

  // テーマ変更時に適用 + auto モード時のシステム変更監視
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "auto") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("auto");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <IoSunny size={14} />, label: "ライト" },
    {
      value: "auto",
      icon: <HiComputerDesktop size={14} />,
      label: "自動",
    },
    { value: "dark", icon: <IoMoon size={14} />, label: "ダーク" },
  ];

  return (
    <div className="flex items-center rounded-full border border-white/20 p-0.5">
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          title={label}
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            theme === value
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

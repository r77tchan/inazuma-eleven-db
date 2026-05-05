"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type {
  MinedCharacterDetailView,
  CharacterStats,
  CharacterHowToGet,
  WorksFlags,
} from "@/lib/types";
import type { CalcStatusResult } from "@/lib/calcStatus";
import type {
  SkillSlotInfo,
  AuraSlotInfo,
  VoiceEntry,
} from "@/app/api/get-character-detail/getCharacterDetail";

// =============================================
// アイコンマッピング
// =============================================

const ELEMENT_ICON: Record<string, string> = {
  風: "/img/icons/elements/wind.webp",
  林: "/img/icons/elements/forest.webp",
  火: "/img/icons/elements/fire.webp",
  山: "/img/icons/elements/mountain.webp",
};

const ELEMENT_BG: Record<string, string> = {
  風: "#2476b1",
  林: "#329b36",
  火: "#9f2121",
  山: "#976626",
};

const POSITION_ICON: Record<string, string> = {
  FW: "/img/icons/position/fw.webp",
  MF: "/img/icons/position/mf.webp",
  DF: "/img/icons/position/df.webp",
  GK: "/img/icons/position/gk.webp",
};

const BUILD_ICON: Record<string, string> = {
  正義: "/img/icons/builds/justice.webp",
  テンション: "/img/icons/builds/tension.webp",
  カウンター: "/img/icons/builds/counter.webp",
  キズナ: "/img/icons/builds/bond.webp",
  ラフ: "/img/icons/builds/rough_play.webp",
  必殺: "/img/icons/builds/breach.webp",
};

const BUILD_ICON_DARK: Record<string, string> = {
  正義: "/img/icons/builds/justice-dark.webp",
  テンション: "/img/icons/builds/tension-dark.webp",
  カウンター: "/img/icons/builds/counter-dark.webp",
  キズナ: "/img/icons/builds/bond-dark.webp",
  ラフ: "/img/icons/builds/rough_play-dark.webp",
  必殺: "/img/icons/builds/breach-dark.webp",
};

const BUILD_NAME: Record<string, string> = {
  正義: "正義",
  テンション: "テンション",
  カウンター: "カウンター",
  キズナ: "キズナ",
  ラフ: "ラフプレー",
  必殺: "ひっさつ",
};

const STAT_ICON: Record<string, string> = {
  kick: "/img/icons/stats/kick.webp",
  control: "/img/icons/stats/control.webp",
  technique: "/img/icons/stats/technique.webp",
  pressure: "/img/icons/stats/pressure.webp",
  physical: "/img/icons/stats/physical.webp",
  intelligence: "/img/icons/stats/intelligence.webp",
  agility: "/img/icons/stats/agility.webp",
};

const STAT_ICON_DARK: Record<string, string> = {
  kick: "/img/icons/stats/kick_dark.webp",
  control: "/img/icons/stats/control_dark.webp",
  technique: "/img/icons/stats/technique_dark.webp",
  pressure: "/img/icons/stats/pressure_dark.webp",
  physical: "/img/icons/stats/physical_dark.webp",
  intelligence: "/img/icons/stats/intelligence_dark.webp",
  agility: "/img/icons/stats/agility_dark.webp",
};

const STAT_LABEL: Record<string, string> = {
  kick: "キック",
  control: "コントロール",
  technique: "テクニック",
  pressure: "プレッシャー",
  physical: "フィジカル",
  intelligence: "インテリジェンス",
  agility: "アジリティ",
};

const STAT_LABEL_SHORT: Record<string, string> = {
  kick: "キック",
  control: "コントロール",
  technique: "テクニック",
  pressure: "プレッシャー",
  physical: "フィジカル",
  intelligence: "インテリ",
  agility: "アジリティ",
};

const TYPE_ICON: Record<string, string> = {
  シュート技: "/img/icons/skills/shoot.webp",
  オフェンス技: "/img/icons/skills/offense.webp",
  ディフェンス技: "/img/icons/skills/defense.webp",
  キーパー技: "/img/icons/skills/keeper.webp",
};

const OPTION_ICON: Record<string, string> = {
  ロングシュート: "/img/icons/skills/long_shoot.webp",
  カウンターシュート: "/img/icons/skills/counter_shoot.webp",
  シュートブロック: "/img/icons/skills/shoot_block.webp",
};

// スキルスロット: 属性別グラデーション (参考プロジェクト準拠)
const SKILL_GRADIENT: Record<string, string> = {
  風: "linear-gradient(90deg, #1117, #56b2e870)",
  林: "linear-gradient(90deg, #1117, #69ff6970)",
  火: "linear-gradient(90deg, #1117, #f0303070)",
  山: "linear-gradient(90deg, #1117, #d0a05070)",
  無: "linear-gradient(90deg, #1117, #a12ec170)",
};

// オーラタイプ → アイコン
const AURA_TYPE_ICON: Record<string, string> = {
  化身: "/img/icons/super_skills/keshin.webp",
  覚醒パワー: "/img/icons/super_skills/awakening_power.webp",
  モードチェンジ: "/img/icons/super_skills/mode_change.webp",
  ソウル: "/img/icons/super_skills/soul.webp",
  ミキシトランス: "/img/icons/super_skills/mixi_trans.webp",
  化身アームド: "/img/icons/super_skills/keshin_armed.webp",
};

const WORKS_LIST: {
  key: keyof WorksFlags;
  icon: string;
  iconDark: string;
  label: string;
}[] = [
  {
    key: "ie1",
    icon: "/img/icons/works/icn_ie1.png",
    iconDark: "/img/icons/works/icn_ie1_dark.png",
    label: "IE1",
  },
  {
    key: "ie2",
    icon: "/img/icons/works/icn_ie2.png",
    iconDark: "/img/icons/works/icn_ie2_dark.png",
    label: "IE2",
  },
  {
    key: "ie3",
    icon: "/img/icons/works/icn_ie3.png",
    iconDark: "/img/icons/works/icn_ie3_dark.png",
    label: "IE3",
  },
  {
    key: "go1",
    icon: "/img/icons/works/icn_go1.png",
    iconDark: "/img/icons/works/icn_go1_dark.png",
    label: "GO1",
  },
  {
    key: "go2",
    icon: "/img/icons/works/icn_go2.png",
    iconDark: "/img/icons/works/icn_go2_dark.png",
    label: "GO2",
  },
  {
    key: "go3",
    icon: "/img/icons/works/icn_go3.png",
    iconDark: "/img/icons/works/icn_go3_dark.png",
    label: "GO3",
  },
  {
    key: "ars",
    icon: "/img/icons/works/icn_ars.png",
    iconDark: "/img/icons/works/icn_ars_dark.png",
    label: "ARS",
  },
  {
    key: "ori",
    icon: "/img/icons/works/icn_ori.png",
    iconDark: "/img/icons/works/icn_ori_dark.png",
    label: "ORI",
  },
  {
    key: "vic",
    icon: "/img/icons/works/icn_vic.png",
    iconDark: "/img/icons/works/icn_vic_dark.png",
    label: "VIC",
  },
];

// 実数値の定義
type CalcStatKey = keyof CalcStatusResult;
const CALC_STATS: {
  key: CalcStatKey;
  label: string;
  formula: { stat: keyof CharacterStats; coeff?: number }[];
}[] = [
  {
    key: "shoot_at",
    label: "シュートAT",
    formula: [{ stat: "kick" }, { stat: "control" }],
  },
  {
    key: "focus_at",
    label: "フォーカスAT",
    formula: [
      { stat: "technique" },
      { stat: "control" },
      { stat: "kick", coeff: 0.5 },
    ],
  },
  {
    key: "focus_df",
    label: "フォーカスDF",
    formula: [
      { stat: "technique" },
      { stat: "intelligence" },
      { stat: "agility", coeff: 0.5 },
    ],
  },
  {
    key: "scramble_at",
    label: "スクランブルAT",
    formula: [{ stat: "intelligence" }, { stat: "physical" }],
  },
  {
    key: "scramble_df",
    label: "スクランブルDF",
    formula: [{ stat: "intelligence" }, { stat: "pressure" }],
  },
  {
    key: "wall_df",
    label: "城壁DF",
    formula: [{ stat: "pressure" }, { stat: "physical" }],
  },
  {
    key: "kp",
    label: "KP",
    formula: [
      { stat: "agility", coeff: 4 },
      { stat: "physical", coeff: 3 },
      { stat: "pressure", coeff: 2 },
    ],
  },
];

// レーダーチャートのステータス順 (参考プロジェクトと同じ順)
const RADAR_ORDER: (keyof CharacterStats)[] = [
  "kick",
  "control",
  "pressure",
  "physical",
  "agility",
  "intelligence",
  "technique",
];

// =============================================
// ヘルパーコンポーネント
// =============================================

function ThemedIcon({
  light,
  dark,
  alt,
  size,
  className,
}: {
  light: string;
  dark: string;
  alt: string;
  size: number;
  className?: string;
}) {
  return (
    <>
      <img
        src={light}
        alt={alt}
        width={size}
        height={size}
        className={`hidden dark:block ${className ?? ""}`}
      />
      <img
        src={dark}
        alt={alt}
        width={size}
        height={size}
        className={`block dark:hidden ${className ?? ""}`}
      />
    </>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-a-400 mb-3 border-b pb-1 text-lg font-bold">
      {children}
    </h2>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-a-700 bg-a-900 rounded-lg border p-3 text-center">
      <div className="text-a-400 mb-1 text-xs">{label}</div>
      <div className="text-a-100 text-sm">{value}</div>
    </div>
  );
}

// =============================================
// レーダーチャート (参考プロジェクト準拠)
// =============================================

const CHART_SIZE = 280;
const CHART_PADDING = 26;
const CHART_RINGS = 5;
const CHART_OUTER_MARGIN = 80;
const CHART_LABEL_OFFSET = 14;
const CHART_ICON_SIZE = 36;
const CHART_ICON_OFFSET = -24;

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

function normalizeToFirstRing(v: number, max: number) {
  if (max <= 0) return 0;
  return clamp01(v / max);
}

function RadarChart({
  stats,
  statMax,
}: {
  stats: CharacterStats;
  statMax: CharacterStats;
}) {
  const uid = useId();
  const n = RADAR_ORDER.length;
  const cx = CHART_SIZE / 2;
  const cy = CHART_SIZE / 2;
  const r = Math.max(0, CHART_SIZE / 2 - CHART_PADDING);
  const startAngle = -Math.PI / 2;

  const geom = useMemo(() => {
    const axes = RADAR_ORDER.map((key, i) => {
      const angle = startAngle + (2 * Math.PI * i) / n;
      const ox = cx + r * Math.cos(angle);
      const oy = cy + r * Math.sin(angle);
      const lx = cx + (r + CHART_LABEL_OFFSET) * Math.cos(angle);
      const ly = cy + (r + CHART_LABEL_OFFSET) * Math.sin(angle);
      const ix = cx + (r + CHART_ICON_OFFSET) * Math.cos(angle);
      const iy = cy + (r + CHART_ICON_OFFSET) * Math.sin(angle);
      return { key, angle, ox, oy, lx, ly, ix, iy };
    });

    const polygonPoints = axes.map((a) => {
      const t = normalizeToFirstRing(stats[a.key], statMax[a.key]);
      return {
        x: cx + r * t * Math.cos(a.angle),
        y: cy + r * t * Math.sin(a.angle),
      };
    });

    const ringPolygons = Array.from({ length: CHART_RINGS }, (_, idx) => {
      const t = (idx + 1) / CHART_RINGS;
      return axes.map((a) => ({
        x: cx + r * t * Math.cos(a.angle),
        y: cy + r * t * Math.sin(a.angle),
      }));
    });

    return { axes, polygonPoints, ringPolygons };
  }, [stats, statMax]);

  const vbX = -CHART_OUTER_MARGIN;
  const vbW = CHART_SIZE + CHART_OUTER_MARGIN * 2;
  const vb = `${vbX} ${vbX} ${vbW} ${vbW}`;

  const valueFontSize = 35;
  const labelFontSize = 11;
  const blockGap = 4;

  function getBlockPlacement(angle: number, lx: number, ly: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const H = valueFontSize + blockGap + labelFontSize;
    const anchor = Math.abs(cos) < 0.25 ? "middle" : cos > 0 ? "start" : "end";
    let yTop = ly - H / 2;
    if (sin < -0.25) yTop = ly - H;
    else if (sin > 0.25) yTop = ly;
    return { anchor, yTop };
  }

  const pts = (arr: { x: number; y: number }[]) =>
    arr.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <svg
      viewBox={vb}
      className="mx-auto w-full max-w-[280px]"
      role="img"
      aria-label="レーダーチャート"
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.1} />
        </linearGradient>
      </defs>
      {/* リング */}
      <g stroke="#60a5fa" strokeOpacity={0.2} fill="none">
        {geom.ringPolygons.map((ring, i) => (
          <polygon key={i} points={pts(ring)} />
        ))}
      </g>
      {/* 軸 */}
      <g stroke="#60a5fa" strokeOpacity={0.2}>
        {geom.axes.map((a) => (
          <line key={a.key} x1={cx} y1={cy} x2={a.ox} y2={a.oy} />
        ))}
      </g>
      {/* データ多角形 */}
      <polygon
        points={pts(geom.polygonPoints)}
        fill={`url(#${uid}-fill)`}
        stroke="#60a5fa"
        strokeOpacity={0.85}
        strokeWidth={2}
      />
      {/* 頂点ドット */}
      <g fill="#60a5fa">
        {geom.polygonPoints.map((p, i) => (
          <circle key={RADAR_ORDER[i]} cx={p.x} cy={p.y} r={3} opacity={0.9} />
        ))}
      </g>
      {/* アイコン */}
      <g opacity={0.95}>
        {geom.axes.map((a) => {
          const iconWhite = STAT_ICON[a.key];
          const iconDark = STAT_ICON_DARK[a.key];
          if (!iconWhite) return null;
          const x = a.ix - CHART_ICON_SIZE / 2;
          const y = a.iy - CHART_ICON_SIZE / 2;
          return (
            <g key={a.key}>
              <image
                href={iconWhite}
                x={x}
                y={y}
                width={CHART_ICON_SIZE}
                height={CHART_ICON_SIZE}
                preserveAspectRatio="xMidYMid meet"
                opacity={0.3}
                className="hidden dark:block"
                style={{ pointerEvents: "none" }}
              />
              <image
                href={iconDark}
                x={x}
                y={y}
                width={CHART_ICON_SIZE}
                height={CHART_ICON_SIZE}
                preserveAspectRatio="xMidYMid meet"
                opacity={0.3}
                className="block dark:hidden"
                style={{ pointerEvents: "none" }}
              />
            </g>
          );
        })}
      </g>
      {/* ラベル(値 + 名前) */}
      <g
        fill="currentColor"
        opacity={0.92}
        style={{ userSelect: "none", fontVariantNumeric: "tabular-nums" }}
      >
        {geom.axes.map((a) => {
          const { anchor, yTop } = getBlockPlacement(a.angle, a.lx, a.ly);
          const yValue = yTop + valueFontSize;
          const yLabel = yTop + valueFontSize + blockGap + labelFontSize;
          return (
            <g key={a.key}>
              <text
                x={a.lx}
                y={yValue}
                textAnchor={anchor as "start" | "middle" | "end"}
                fontSize={valueFontSize}
                fontWeight={800}
                opacity={0.95}
              >
                {stats[a.key]}
              </text>
              <text
                x={a.lx}
                y={yLabel}
                textAnchor={anchor as "start" | "middle" | "end"}
                fontSize={labelFontSize}
                opacity={0.9}
              >
                {STAT_LABEL_SHORT[a.key]}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// =============================================
// スキルスロット行 (参考プロジェクト準拠)
// =============================================

function SkillSlotRow({
  skillId,
  slotNumber,
  info,
}: {
  skillId: string | null;
  slotNumber: number;
  info?: SkillSlotInfo;
}) {
  if (!skillId) {
    return (
      <div className="flex h-10 items-center rounded-xl border border-black/15 px-3 opacity-50 dark:border-white/35" />
    );
  }

  const gradient = info
    ? (SKILL_GRADIENT[info.element] ?? "linear-gradient(90deg, #1117, #8885)")
    : "linear-gradient(90deg, #1117, #8885)";

  return (
    <Link
      href={`/skill/${encodeURIComponent(skillId)}`}
      prefetch={false}
      className="flex h-10 items-center justify-between rounded-xl border border-black/15 bg-clip-padding px-2 hover:border-black dark:border-white/35 dark:hover:border-white"
      style={{
        backgroundImage: gradient,
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {info && TYPE_ICON[info.type] && (
          <img
            src={TYPE_ICON[info.type]}
            alt={info.type}
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
        )}
        {info && ELEMENT_ICON[info.element] && (
          <img
            src={ELEMENT_ICON[info.element]}
            alt={info.element}
            width={20}
            height={20}
            className="h-5 w-5 shrink-0"
          />
        )}
        <span className="min-w-0 truncate text-sm font-semibold">
          {info?.name ?? skillId}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-[0.7rem]">
        {info?.option && OPTION_ICON[info.option] && (
          <img
            src={OPTION_ICON[info.option]}
            alt={info.option}
            width={20}
            height={20}
            className="h-5 w-5"
          />
        )}
        {info?.tension_normal != null && (
          <div
            className="flex items-end text-[#c05a20] dark:text-[#f08030]"
            style={{ opacity: 0.9 }}
          >
            <span className="text-xl leading-none font-semibold tabular-nums">
              {info.tension_normal}
            </span>
            <span className="ml-0.5">T</span>
          </div>
        )}
        {info?.power_normal != null && (
          <div className="flex items-end gap-1">
            <span className="opacity-80">威力</span>
            <span className="text-2xl leading-none font-semibold tabular-nums">
              {info.power_normal}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// =============================================
// オーラスロット行
// =============================================

function AuraSlotRow({
  auraId,
  info,
}: {
  auraId: string;
  info?: AuraSlotInfo;
}) {
  const gradient = info
    ? (SKILL_GRADIENT[info.element] ?? "linear-gradient(90deg, #1117, #8885)")
    : "linear-gradient(90deg, #1117, #8885)";

  return (
    <div
      className="flex h-10 items-center rounded-xl border border-black/15 bg-clip-padding px-2 dark:border-white/35"
      style={{
        backgroundImage: gradient,
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        {info && AURA_TYPE_ICON[info.type] && (
          <img
            src={AURA_TYPE_ICON[info.type]}
            alt={info.type}
            width={24}
            height={24}
            className="h-6 w-6 shrink-0"
          />
        )}
        {info && ELEMENT_ICON[info.element] && (
          <img
            src={ELEMENT_ICON[info.element]}
            alt={info.element}
            width={20}
            height={20}
            className="h-5 w-5 shrink-0"
          />
        )}
        <span className="min-w-0 truncate text-sm font-semibold">
          {info?.name ?? auraId}
        </span>
      </div>
    </div>
  );
}

// =============================================
// メインコンポーネント
// =============================================

export default function CharacterDetailContent({
  character: c,
  statusTypeCalcStats,
  statMax,
  skillInfoMap,
  auraInfoMap,
  voiceEntries,
  voiceSkillInfoMap,
  voiceAuraInfoMap,
}: {
  character: MinedCharacterDetailView;
  statusTypeCalcStats: CalcStatusResult[];
  statMax: CharacterStats;
  skillInfoMap: Record<string, SkillSlotInfo>;
  auraInfoMap: Record<string, AuraSlotInfo>;
  voiceEntries: VoiceEntry[];
  voiceSkillInfoMap: Record<string, SkillSlotInfo>;
  voiceAuraInfoMap: Record<string, AuraSlotInfo>;
}) {
  const [variant, setVariant] = useState<"default" | "branch">("default");
  const [howToGetOpen, setHowToGetOpen] = useState(false);

  const bgColor = ELEMENT_BG[c.element] ?? "#444";

  const currentStats: CharacterStats =
    variant === "default" ? c.default_status : c.branch_status;
  const currentCalc: Record<string, number> = {
    shoot_at: variant === "default" ? c.default_shoot_at : c.branch_shoot_at,
    focus_at: variant === "default" ? c.default_focus_at : c.branch_focus_at,
    focus_df: variant === "default" ? c.default_focus_df : c.branch_focus_df,
    scramble_at:
      variant === "default" ? c.default_scramble_at : c.branch_scramble_at,
    scramble_df:
      variant === "default" ? c.default_scramble_df : c.branch_scramble_df,
    wall_df: variant === "default" ? c.default_wall_df : c.branch_wall_df,
    kp: variant === "default" ? c.default_kp : c.branch_kp,
  };
  const currentSlots = [
    c.normal_slot_1,
    c.normal_slot_2,
    c.normal_slot_3,
    ...(variant === "default"
      ? [
          c.normal_default_slot_4,
          c.normal_default_slot_5,
          c.normal_default_slot_6,
        ]
      : [
          c.normal_branch_slot_4,
          c.normal_branch_slot_5,
          c.normal_branch_slot_6,
        ]),
  ];

  // 順位計算: dense ranking (同率でも次の順位を詰める)
  const rankData: Record<string, { rank: number; total: number }> = {};
  for (const stat of CALC_STATS) {
    const myValue = currentCalc[stat.key];
    const uniqueValues = [
      ...new Set(statusTypeCalcStats.map((s) => s[stat.key])),
    ];
    const rank = uniqueValues.filter((v) => v > myValue).length + 1;
    rankData[stat.key] = { rank, total: uniqueValues.length };
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <Link
        href="/character"
        prefetch={false}
        className="mb-2 inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
      >
        ← キャラクター一覧へ戻る
      </Link>
      <div className="flex flex-col gap-4">
        {/* ===== ヘッダー ===== */}
        <header className="flex gap-4 max-sm:flex-col max-sm:items-center">
          <div className="shrink-0">
            <div className="h-32 w-32 overflow-hidden rounded-t-lg">
              <img
                src={c.image_url}
                alt={c.full_name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div
              className="flex w-32 items-center justify-center gap-1 rounded-b-lg py-1"
              style={{ background: bgColor }}
            >
              {ELEMENT_ICON[c.element] && (
                <img
                  src={ELEMENT_ICON[c.element]}
                  alt={c.element}
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              )}
              <span className="text-sm font-bold text-white">{c.nickname}</span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-end max-sm:w-full max-sm:items-center">
            <div className="flex flex-wrap items-end gap-2 max-sm:justify-center">
              <div className="flex flex-col-reverse">
                <h1 className="text-2xl font-extrabold">{c.full_name}</h1>
                <div className="text-a-500 text-center text-[0.6rem]">
                  {c.full_name_ruby}
                </div>
              </div>
              {c.physique && (
                <img
                  src={`/img/icons/gender/${c.physique}.png`}
                  alt={c.physique}
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              )}
              {POSITION_ICON[c.position] && (
                <img
                  src={POSITION_ICON[c.position]}
                  alt={c.position}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              )}
              {c.sub_position &&
                c.sub_position !== c.position &&
                POSITION_ICON[c.sub_position] && (
                  <img
                    src={POSITION_ICON[c.sub_position]}
                    alt={c.sub_position}
                    width={24}
                    height={24}
                    className="h-6 w-6 opacity-60"
                  />
                )}
              <div className="flex items-center gap-2">
                <span className="text-a-500 text-xs">
                  No. {c.inagle_no ?? "-"}
                </span>
                <div className="bg-a-800 flex overflow-hidden rounded-full text-xs font-medium">
                  <button
                    onClick={() => setVariant("default")}
                    className={`cursor-pointer rounded-l-full border-y border-l px-3 py-1 ${
                      variant === "default"
                        ? "border-a-0 bg-a-0 text-a-1000"
                        : "text-a-400 hover:text-a-200 hover:border-a-500 border-transparent"
                    }`}
                  >
                    通常
                  </button>
                  <button
                    onClick={() => setVariant("branch")}
                    className={`cursor-pointer rounded-r-full border-y border-r px-3 py-1 ${
                      variant === "branch"
                        ? "border-a-0 bg-a-0 text-a-1000"
                        : "text-a-400 hover:text-a-200 hover:border-a-500 border-transparent"
                    }`}
                  >
                    分岐
                  </button>
                </div>
              </div>
            </div>
            <div className="border-a-700 bg-a-900 mt-2 w-full rounded-lg border p-3 text-sm leading-relaxed">
              {c.description
                ? c.description.split(/\\n|\n/).map((line, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))
                : ""}
            </div>
          </div>
        </header>

        {/* ===== ステータス(レーダー) + 習得スキル 2カラム ===== */}
        <section className="grid items-start gap-x-4 gap-y-1 max-md:grid-cols-1 md:[grid-auto-flow:column] md:grid-cols-[280px_1fr] md:grid-rows-[2.5rem_auto]">
          <h2 className="border-a-400 self-end border-b pb-1 text-lg font-bold">
            ステータス
          </h2>
          <div className="flex justify-center">
            <RadarChart stats={currentStats} statMax={statMax} />
          </div>

          <h2 className="border-a-400 mt-4 self-end border-b pb-1 text-lg font-bold md:mt-0">
            習得スキル
          </h2>
          <div className="flex flex-col gap-2">
            {currentSlots.map((slotId, i) => {
              if (!slotId) {
                return (
                  <SkillSlotRow key={i} skillId={null} slotNumber={i + 1} />
                );
              }
              const isSkill =
                slotId.startsWith("wh") || slotId.startsWith("rh");
              if (isSkill) {
                return (
                  <SkillSlotRow
                    key={i}
                    skillId={slotId}
                    slotNumber={i + 1}
                    info={skillInfoMap[slotId]}
                  />
                );
              }
              return (
                <AuraSlotRow
                  key={i}
                  auraId={slotId}
                  info={auraInfoMap[slotId]}
                />
              );
            })}
          </div>
        </section>

        {/* ===== 実数値 ===== */}
        <section>
          <SectionHeading>実数値</SectionHeading>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
            {CALC_STATS.map(({ key, label, formula }) => {
              const value = currentCalc[key];
              const rd = rankData[key];
              return (
                <div
                  key={key}
                  className="border-a-700 bg-a-950 flex flex-col rounded-lg border text-center"
                >
                  <div className="border-a-700 border-b px-2 py-1">
                    <div className="text-sm font-bold">{label}</div>
                    <div className="flex items-center justify-center gap-0.5 text-[0.65rem] opacity-50">
                      {formula.map((f, i) => (
                        <span key={i} className="flex items-center gap-0.5">
                          {i > 0 && <span>+</span>}
                          <ThemedIcon
                            light={STAT_ICON[f.stat]}
                            dark={STAT_ICON_DARK[f.stat]}
                            alt={STAT_LABEL[f.stat]}
                            size={14}
                            className="h-3.5 w-3.5"
                          />
                          {f.coeff != null && f.coeff !== 1 && (
                            <span>×{f.coeff}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="px-2 py-2">
                    <div className="text-2xl font-bold tabular-nums">
                      {value}
                    </div>
                    <div className="text-a-500 text-xs tabular-nums">
                      {rd.rank} / {rd.total}位
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== メインビルド ===== */}
        <section>
          <SectionHeading>メインビルド</SectionHeading>
          <div className="border-a-700 bg-a-950 flex items-center gap-3 rounded-lg border p-4">
            {BUILD_ICON[c.build_type] ? (
              <ThemedIcon
                light={BUILD_ICON[c.build_type]}
                dark={BUILD_ICON_DARK[c.build_type]}
                alt={c.build_type}
                size={48}
                className="h-12 w-12"
              />
            ) : (
              <div className="bg-a-800 flex h-12 w-12 items-center justify-center rounded text-xs">
                ?
              </div>
            )}
            <h3 className="text-lg font-bold">
              {(BUILD_NAME[c.build_type] ?? c.build_type) || "調査中"}
            </h3>
          </div>
        </section>

        {/* ===== 所属チーム + 基本情報 ===== */}
        <section className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <div>
            <SectionHeading>所属チーム</SectionHeading>
            <div className="border-a-700 bg-a-950 rounded-lg border p-3">
              {c.team && c.team.length > 0 ? (
                <ul className="flex flex-col gap-1">
                  {c.team.map((t, i) => (
                    <li key={i} className="text-a-200 text-sm">
                      {t}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-a-500 text-sm">情報なし</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <InfoCell label="年代区分" value={c.generation ?? "-"} />
            <InfoCell label="学年" value={c.school_year ?? "-"} />
          </div>
        </section>

        {/* ===== 登場作品 ===== */}
        <section>
          <SectionHeading>登場作品</SectionHeading>
          <div className="flex flex-wrap gap-3">
            {WORKS_LIST.map(({ key, icon, iconDark, label }) => {
              const active = c.works_flags?.[key] ?? false;
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <ThemedIcon
                    light={icon}
                    dark={iconDark}
                    alt={label}
                    size={40}
                    className={`h-10 w-10 object-contain ${!active ? "opacity-30 grayscale" : ""}`}
                  />
                  <span
                    className={`text-xs font-bold ${active ? "text-green-400" : "text-a-600"}`}
                  >
                    {active ? "○" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== 入手方法 (開閉式) ===== */}
        <section>
          <button
            onClick={() => setHowToGetOpen(!howToGetOpen)}
            className="border-a-400 mb-3 flex w-full cursor-pointer items-center justify-between border-b pb-1 text-left text-lg font-bold"
          >
            入手方法
            <svg
              className={`h-5 w-5 transition-transform ${howToGetOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {howToGetOpen && (
            <div className="flex flex-col gap-4">
              {c.how_to_get && c.how_to_get.length > 0 ? (
                c.how_to_get.map((method: CharacterHowToGet, mi: number) => (
                  <div key={mi} className="border-a-700 rounded-lg border p-4">
                    <h3 className="text-a-100 mb-2 text-sm font-bold">
                      {method.title}
                    </h3>
                    {method.details.map((detail, di) => (
                      <div
                        key={di}
                        className="border-a-800 mt-2 border-l-2 pl-3"
                      >
                        {detail.description && (
                          <p className="text-a-300 text-sm">
                            {detail.description}
                          </p>
                        )}
                        {detail.items.length > 0 && (
                          <ul className="text-a-400 mt-1 list-inside list-disc text-sm">
                            {detail.items.map((item, ii) => (
                              <li key={ii}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-a-500 text-sm">情報なし</div>
              )}
            </div>
          )}
        </section>

        {/* ===== ボイス情報 ===== */}
        <section>
          <SectionHeading>ボイス情報</SectionHeading>
          {voiceEntries.length === 0 ? (
            <div className="text-a-500 text-sm">情報なし</div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {voiceEntries.map((entry, i) => {
                const isSkill = entry.kind === "skill";
                if (isSkill) {
                  const info = voiceSkillInfoMap[entry.id];
                  const gradient = info
                    ? (SKILL_GRADIENT[info.element] ??
                      "linear-gradient(90deg, #1117, #8885)")
                    : "linear-gradient(90deg, #1117, #8885)";
                  const isLink =
                    entry.id.startsWith("wh") || entry.id.startsWith("rh");
                  const inner = (
                    <div className="flex min-w-0 items-center gap-2">
                      {info && TYPE_ICON[info.type] && (
                        <img
                          src={TYPE_ICON[info.type]}
                          alt={info.type}
                          width={24}
                          height={24}
                          className="h-6 w-6 shrink-0"
                        />
                      )}
                      {info && ELEMENT_ICON[info.element] && (
                        <img
                          src={ELEMENT_ICON[info.element]}
                          alt={info.element}
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0"
                        />
                      )}
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {info?.name ?? entry.id}
                      </span>
                      {info?.option && OPTION_ICON[info.option] && (
                        <img
                          src={OPTION_ICON[info.option]}
                          alt={info.option}
                          width={20}
                          height={20}
                          className="ml-auto h-5 w-5 shrink-0"
                        />
                      )}
                    </div>
                  );
                  return isLink ? (
                    <Link
                      key={i}
                      href={`/skill/${encodeURIComponent(entry.id)}`}
                      prefetch={false}
                      className="flex h-10 items-center rounded-xl border border-black/15 bg-clip-padding px-2 hover:border-black dark:border-white/35 dark:hover:border-white"
                      style={{
                        backgroundImage: gradient,
                      }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className="flex h-10 items-center rounded-xl border border-black/15 bg-clip-padding px-2 dark:border-white/35"
                      style={{
                        backgroundImage: gradient,
                      }}
                    >
                      {inner}
                    </div>
                  );
                } else {
                  const info = voiceAuraInfoMap[entry.id];
                  return <AuraSlotRow key={i} auraId={entry.id} info={info} />;
                }
              })}
            </div>
          )}
        </section>

        {/* ===== inagleリンク ===== */}
        {c.inagle_url && (
          <section>
            <SectionHeading>inagleリンク</SectionHeading>
            <div className="bg-a-900 rounded-lg p-4">
              <a
                href={c.inagle_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm break-all text-blue-500 underline underline-offset-2"
              >
                「{c.full_name}」を確認
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

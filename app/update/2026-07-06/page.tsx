import type { Metadata } from "next";
import Link from "next/link";

import {
  getSkillInfoByIds,
  getAuraInfoByIds,
  type SkillSlotInfo,
  type AuraSlotInfo,
} from "@/app/api/get-character-detail/getCharacterDetail";

import { getCharacterSummariesByIds } from "./getUpdatePageData";
import {
  ADDED_VOICES,
  REMOVED_VOICES,
  NEW_CHARACTER_IDS,
  type VoiceDiffEntry,
} from "./voiceDiff";

export const metadata: Metadata = {
  title: "イナイレDB - 2026/07/06 アップデート 新キャラ・ボイス変更",
  description:
    "2026年7月6日のアップデート（栄光への挑戦者たちアップデート）で追加された新キャラクターと、追加・削除されたスキルボイス・超次元ボイスのまとめ",
};

// =============================================
// アイコンマッピング
// =============================================

const TYPE_ICON: Record<string, string> = {
  シュート技: "/img/icons/skills/shoot.webp",
  オフェンス技: "/img/icons/skills/offense.webp",
  ディフェンス技: "/img/icons/skills/defense.webp",
  キーパー技: "/img/icons/skills/keeper.webp",
};

const AURA_TYPE_ICON: Record<string, string> = {
  化身: "/img/icons/super_skills/keshin.webp",
  覚醒パワー: "/img/icons/super_skills/awakening_power.webp",
  モードチェンジ: "/img/icons/super_skills/mode_change.webp",
  ソウル: "/img/icons/super_skills/soul.webp",
  ミキシトランス: "/img/icons/super_skills/mixi_trans.webp",
  化身アームド: "/img/icons/super_skills/keshin_armed.webp",
};

const ELEMENT_ICON: Record<string, string> = {
  風: "/img/icons/elements/wind.webp",
  林: "/img/icons/elements/forest.webp",
  火: "/img/icons/elements/fire.webp",
  山: "/img/icons/elements/mountain.webp",
};

const SKILL_GRADIENT: Record<string, string> = {
  風: "linear-gradient(90deg, #1117, #56b2e870)",
  林: "linear-gradient(90deg, #1117, #69ff6970)",
  火: "linear-gradient(90deg, #1117, #f0303070)",
  山: "linear-gradient(90deg, #1117, #d0a05070)",
  無: "linear-gradient(90deg, #1117, #a12ec170)",
};

const FALLBACK_GRADIENT = "linear-gradient(90deg, #1117, #8885)";

// =============================================
// 表示対象の調整
// =============================================

// 新キャラはボイス差分ではなく「新キャラクター」セクションに表示する
const NEW_CHARACTER_ID_SET = new Set(NEW_CHARACTER_IDS);

// このスキルだけが増えたキャラは、キャラごとではなく技ごとにまとめて表示する
const GROUP_BY_SKILL_IDS = new Set(["whk00555"]);

// =============================================
// キャラごとの差分グループ化
// =============================================

type CharacterVoiceDiff = {
  character_id: string;
  added: VoiceDiffEntry[];
  removed: VoiceDiffEntry[];
};

function groupByCharacter(
  added: VoiceDiffEntry[],
  removed: VoiceDiffEntry[],
): CharacterVoiceDiff[] {
  const map = new Map<string, CharacterVoiceDiff>();
  const get = (characterId: string) => {
    let group = map.get(characterId);
    if (!group) {
      group = { character_id: characterId, added: [], removed: [] };
      map.set(characterId, group);
    }
    return group;
  };

  for (const entry of added) get(entry.character_id).added.push(entry);
  for (const entry of removed) get(entry.character_id).removed.push(entry);

  return [...map.values()].sort((a, b) =>
    a.character_id.localeCompare(b.character_id),
  );
}

// =============================================
// ボイスのピル表示
// =============================================

function SkillVoicePill({
  skillId,
  info,
}: {
  skillId: string;
  info?: SkillSlotInfo;
}) {
  const gradient = info
    ? (SKILL_GRADIENT[info.element] ?? FALLBACK_GRADIENT)
    : FALLBACK_GRADIENT;
  const isLink = skillId.startsWith("wh") || skillId.startsWith("rh");

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
        {info?.name ?? skillId}
      </span>
    </div>
  );

  return isLink ? (
    <Link
      href={`/skill/${encodeURIComponent(skillId)}`}
      prefetch={false}
      className="flex h-10 items-center rounded-xl border border-black/15 bg-clip-padding px-2 hover:border-black dark:border-white/35 dark:hover:border-white"
      style={{ backgroundImage: gradient }}
    >
      {inner}
    </Link>
  ) : (
    <div
      className="flex h-10 cursor-not-allowed items-center rounded-xl border border-black/15 bg-clip-padding px-2 dark:border-white/35"
      style={{ backgroundImage: gradient }}
    >
      {inner}
    </div>
  );
}

function AuraVoicePill({
  auraId,
  info,
}: {
  auraId: string;
  info?: AuraSlotInfo;
}) {
  const gradient = info
    ? (SKILL_GRADIENT[info.element] ?? FALLBACK_GRADIENT)
    : FALLBACK_GRADIENT;

  return (
    <div
      className="flex h-10 cursor-not-allowed items-center rounded-xl border border-black/15 bg-clip-padding px-2 dark:border-white/35"
      style={{ backgroundImage: gradient }}
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

function VoicePill({
  entry,
  skillInfoMap,
  auraInfoMap,
}: {
  entry: VoiceDiffEntry;
  skillInfoMap: Record<string, SkillSlotInfo>;
  auraInfoMap: Record<string, AuraSlotInfo>;
}) {
  return entry.kind === "skill" ? (
    <SkillVoicePill skillId={entry.id} info={skillInfoMap[entry.id]} />
  ) : (
    <AuraVoicePill auraId={entry.id} info={auraInfoMap[entry.id]} />
  );
}

// =============================================
// ページ本体
// =============================================

export default async function Update20260706Page() {
  const addedVoices = ADDED_VOICES.filter(
    (e) => !NEW_CHARACTER_ID_SET.has(e.character_id),
  );
  const removedVoices = REMOVED_VOICES.filter(
    (e) => !NEW_CHARACTER_ID_SET.has(e.character_id),
  );

  const allGroups = groupByCharacter(addedVoices, removedVoices);

  // 「特定スキル1つだけが増えた」キャラは技ごとにまとめる
  const groupedBySkill = new Map<string, string[]>();
  const groups: CharacterVoiceDiff[] = [];
  for (const group of allGroups) {
    const only = group.added.length === 1 ? group.added[0] : null;
    if (
      group.removed.length === 0 &&
      only?.kind === "skill" &&
      GROUP_BY_SKILL_IDS.has(only.id)
    ) {
      const ids = groupedBySkill.get(only.id) ?? [];
      ids.push(group.character_id);
      groupedBySkill.set(only.id, ids);
    } else {
      groups.push(group);
    }
  }
  const skillGroups = [...groupedBySkill.entries()].map(
    ([skillId, characterIds]) => ({ skillId, characterIds }),
  );

  const allEntries = [...addedVoices, ...removedVoices];

  const [characterMap, skillInfoMap, auraInfoMap] = await Promise.all([
    getCharacterSummariesByIds([
      ...NEW_CHARACTER_IDS,
      ...allGroups.map((g) => g.character_id),
    ]),
    getSkillInfoByIds(
      allEntries.filter((e) => e.kind === "skill").map((e) => e.id),
    ),
    getAuraInfoByIds(
      allEntries.filter((e) => e.kind === "aura").map((e) => e.id),
    ),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        2026/07/06 アップデート 新キャラ・ボイス変更
      </h1>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold">新キャラクター</h2>
        <div className="grid grid-cols-3 gap-3">
          {NEW_CHARACTER_IDS.map((characterId) => {
            const character = characterMap[characterId];
            return (
              <Link
                key={characterId}
                href={`/character/${characterId}`}
                prefetch={false}
                className="border-a-800 flex flex-col items-center gap-3 rounded-xl border p-4 hover:border-black dark:hover:border-white"
              >
                {character?.image_url && (
                  <img
                    src={character.image_url}
                    alt={character.full_name}
                    width={112}
                    height={112}
                    className="w-full max-w-28 rounded"
                    loading="lazy"
                  />
                )}
                <span className="max-w-full truncate text-center font-bold">
                  {character?.full_name ?? characterId}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">ボイス変更</h2>
        <div className="space-y-4">
          {skillGroups.map(({ skillId, characterIds }) => (
            <section
              key={skillId}
              className="border-a-800 rounded-xl border p-4"
            >
              <h3 className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                増えたボイス
              </h3>
              <SkillVoicePill skillId={skillId} info={skillInfoMap[skillId]} />
              <p className="text-a-500 mt-3 mb-2 text-sm">
                対象キャラクター ({characterIds.length}人)
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {characterIds.map((characterId) => {
                  const character = characterMap[characterId];
                  return (
                    <Link
                      key={characterId}
                      href={`/character/${characterId}`}
                      prefetch={false}
                      className="flex items-center gap-2 hover:opacity-80"
                    >
                      {character?.image_url && (
                        <img
                          src={character.image_url}
                          alt={character.full_name}
                          width={48}
                          height={48}
                          className="shrink-0 rounded"
                          loading="lazy"
                        />
                      )}
                      <span className="min-w-0 truncate text-sm font-bold">
                        {character?.full_name ?? characterId}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

          {groups.map((group) => {
            const character = characterMap[group.character_id];
            return (
              <section
                key={group.character_id}
                className="border-a-800 rounded-xl border p-4"
              >
                <Link
                  href={`/character/${group.character_id}`}
                  prefetch={false}
                  className="mb-3 inline-flex items-center gap-3 hover:opacity-80"
                >
                  {character?.image_url && (
                    <img
                      src={character.image_url}
                      alt={character.full_name}
                      width={64}
                      height={64}
                      className="rounded"
                      loading="lazy"
                    />
                  )}
                  <span className="min-w-0 truncate font-bold">
                    {character?.full_name ?? group.character_id}
                  </span>
                </Link>

                {group.added.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      増えたボイス
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {group.added.map((entry) => (
                        <VoicePill
                          key={`${entry.kind}-${entry.id}`}
                          entry={entry}
                          skillInfoMap={skillInfoMap}
                          auraInfoMap={auraInfoMap}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {group.removed.length > 0 && (
                  <div className={group.added.length > 0 ? "mt-3" : ""}>
                    <h3 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">
                      消えたボイス
                    </h3>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {group.removed.map((entry) => (
                        <VoicePill
                          key={`${entry.kind}-${entry.id}`}
                          entry={entry}
                          skillInfoMap={skillInfoMap}
                          auraInfoMap={auraInfoMap}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

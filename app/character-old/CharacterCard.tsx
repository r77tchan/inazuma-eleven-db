import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import { INFO_FIELD_OPTIONS, type InfoFieldKey } from "./useCharacterPage";

const POSITION_ICON: Record<string, string> = {
  FW: "/img/icons/position/fw.webp",
  MF: "/img/icons/position/mf.webp",
  DF: "/img/icons/position/df.webp",
  GK: "/img/icons/position/gk.webp",
};

const ELEMENT_ICON: Record<string, string> = {
  風: "/img/icons/elements/wind.webp",
  林: "/img/icons/elements/forest.webp",
  火: "/img/icons/elements/fire.webp",
  山: "/img/icons/elements/mountain.webp",
};

const GENDER_ICON: Record<string, string> = {
  男: "/img/icons/gender/male.webp",
  女: "/img/icons/gender/female.webp",
};

export const ICON_FIELDS: Record<string, Record<string, string>> = {
  position: POSITION_ICON,
  element: ELEMENT_ICON,
  gender: GENDER_ICON,
};

type CharacterCardProps = {
  character: ScrapedCharacterDetailWithMetrics;
  nameDisplay: "fullName" | "nickname";
  infoFields: InfoFieldKey[];
};

export function CharacterCard({
  character,
  nameDisplay,
  infoFields,
}: CharacterCardProps) {
  const showNickname =
    nameDisplay === "nickname" && character.nickname.length > 0;
  const displayNameText = showNickname
    ? character.nickname.map((n) => n.name).join("")
    : character.fullName.name;
  const displayRubyText = showNickname
    ? character.nickname.map((n) => n.ruby).join("")
    : character.fullName.ruby;

  return (
    <div className="border-a-800 bg-a-950 flex gap-3 rounded-lg border p-3">
      {character.imageUrl && (
        <img
          src={character.imageUrl}
          alt={character.fullName.name}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded object-cover"
          loading="lazy"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold">{displayNameText}</span>
          {displayRubyText && (
            <span className="text-a-500 text-xs">{displayRubyText}</span>
          )}
        </div>
        <div className="text-a-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {infoFields.map((key) => {
            const option = INFO_FIELD_OPTIONS.find((o) => o.key === key);
            if (!option) return null;
            const value = character[key];
            if (value === null || value === undefined || value === "")
              return null;
            const iconMap = ICON_FIELDS[key];
            const iconSrc =
              iconMap && typeof value === "string" ? iconMap[value] : undefined;
            if (iconSrc) {
              return (
                <img
                  key={key}
                  src={iconSrc}
                  alt={String(value)}
                  width={16}
                  height={16}
                  className="h-4 w-4"
                />
              );
            }
            return (
              <span key={key}>
                {typeof value === "number"
                  ? `${option.label}: ${value}`
                  : value}
              </span>
            );
          })}
        </div>
      </div>
      <div className="text-a-500 shrink-0 text-xs">
        No.{character.characterNo}
      </div>
    </div>
  );
}

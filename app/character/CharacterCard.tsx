import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import { INFO_FIELD_OPTIONS, type InfoFieldKey } from "./useCharacterPage";

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
        <div className="text-a-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {infoFields.map((key) => {
            const option = INFO_FIELD_OPTIONS.find((o) => o.key === key);
            if (!option) return null;
            const value = character[key];
            if (value === null || value === undefined || value === "")
              return null;
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

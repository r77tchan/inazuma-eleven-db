import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

type CharacterCardProps = {
  character: ScrapedCharacterDetailWithMetrics;
  differentFields?: string[];
};

function formatNameWithRuby(name: string, ruby: string) {
  return ruby ? `${name}（${ruby}）` : name;
}

export function CharacterCard({
  character,
  differentFields,
}: CharacterCardProps) {
  const fullName = formatNameWithRuby(
    character.fullName.name,
    character.fullName.ruby,
  );
  const nicknames = character.nickname
    .map((nickname) => formatNameWithRuby(nickname.name, nickname.ruby))
    .join(", ");

  return (
    <div className="flex items-center gap-3 rounded border p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={character.imageUrl}
        alt={character.fullName.name}
        className="h-16 w-12 object-contain"
      />
      <div className="text-sm">
        <p className="font-bold">{character.characterNo}</p>
        <p>{fullName}</p>
        {nicknames && <p className="text-gray-400">{nicknames}</p>}
        {differentFields && differentFields.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-400">差分項目</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {differentFields.map((field) => (
                <span
                  key={field}
                  className="rounded border border-yellow-400 px-2 py-1 text-xs text-yellow-300"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

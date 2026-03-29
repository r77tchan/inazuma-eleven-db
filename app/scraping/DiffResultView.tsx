import type { ScrapedCharacterDetailWithMetrics } from "@/lib/types";

import type { DiffResult } from "./diff";
import { CharacterCard } from "./CharacterCard";

type CharacterSectionProps = {
  title: string;
  titleClassName: string;
  characters: ScrapedCharacterDetailWithMetrics[];
};

function CharacterSection({
  title,
  titleClassName,
  characters,
}: CharacterSectionProps) {
  return (
    <section>
      <h2 className={`mb-2 text-lg font-bold ${titleClassName}`}>{title}</h2>
      {characters.length === 0 ? (
        <p className="text-gray-500">なし</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <CharacterCard key={character.characterNo} character={character} />
          ))}
        </div>
      )}
    </section>
  );
}

type DiffResultViewProps = {
  diffResult: DiffResult;
};

export function DiffResultView({ diffResult }: DiffResultViewProps) {
  return (
    <div className="space-y-6 p-4">
      <CharacterSection
        title={`スクレイピングデータのみに存在（${diffResult.onlyInScraped.length}件）`}
        titleClassName="text-blue-400"
        characters={diffResult.onlyInScraped}
      />

      <CharacterSection
        title={`DBデータのみに存在（${diffResult.onlyInDb.length}件）`}
        titleClassName="text-green-400"
        characters={diffResult.onlyInDb}
      />

      <section>
        <h2 className="mb-2 text-lg font-bold text-yellow-400">
          データが異なるキャラクター（{diffResult.different.length}件）
        </h2>
        {diffResult.different.length === 0 ? (
          <p className="text-gray-500">なし</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {diffResult.different.map(({ scraped, differentFields }) => (
              <CharacterCard
                key={scraped.characterNo}
                character={scraped}
                differentFields={differentFields}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

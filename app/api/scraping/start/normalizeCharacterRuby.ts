// 現在未使用

import type { CharacterName } from "@/lib/types";

function removeMiddleDot(value: string): string {
  return value.replace(/・/g, "");
}

function isKatakanaOnly(value: string): boolean {
  return /^[\u30A0-\u30FF\u31F0-\u31FF\u30FC]+$/.test(value);
}

function katakanaToHiragana(value: string): string {
  return Array.from(value)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 0x30a1 && code <= 0x30f6) {
        return String.fromCharCode(code - 0x60);
      }
      return char;
    })
    .join("");
}

function normalizeRubyIfKatakanaName(item: CharacterName): CharacterName {
  const withoutDot = removeMiddleDot(item.name);
  if (!withoutDot) return item;
  if (!isKatakanaOnly(withoutDot)) return item;

  return {
    ...item,
    ruby: katakanaToHiragana(withoutDot),
  };
}

type HasCharacterNames = {
  nickname: CharacterName[];
  fullName: CharacterName;
};

// nickname と fullName を持つ型なら受け取れる最小条件。
// ほかのプロパティは T としてそのまま保持する。
export default function normalizeCharacterRuby<T extends HasCharacterNames>(
  characterDetailList: T[],
): T[] {
  // 戻り値も T[] にすることで、detailUrl や team などの型情報を失わない。
  return characterDetailList.map((characterDetail) => ({
    ...characterDetail,
    nickname: characterDetail.nickname.map(normalizeRubyIfKatakanaName),
    fullName: normalizeRubyIfKatakanaName(characterDetail.fullName),
  }));
}

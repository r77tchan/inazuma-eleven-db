import type { Metadata } from "next";
import CharacterListPage from "./CharacterListPage";

export const metadata: Metadata = {
  title: "イナイレDB - キャラクター一覧",
};

export default function CharacterPage() {
  return <CharacterListPage />;
}

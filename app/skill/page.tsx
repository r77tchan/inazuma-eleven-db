import type { Metadata } from "next";
import SkillListPage from "./SkillListPage";

export const metadata: Metadata = {
  title: "イナイレDB - 必殺技一覧",
};

export default function SkillPage() {
  return <SkillListPage />;
}

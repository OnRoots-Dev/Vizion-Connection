import type { Metadata } from "next";
import LpHomeClient from "./LpHomeClient";

export const metadata: Metadata = {
  title: "Vizion Connection — 積み重ねが、見える。応援が、届く。",
  description:
    "スポーツに関わるすべての人が、信頼でつながる場所。日々の記録も、応援も、出会いも——すべてがあなたの証明になる。",
};

/**
 * マーケティング LP — lp-prototype.html のデザイン言語を Next.js に移植。
 * Palette: lime #C8E800 / near-black #050608 / Bebas Neue + Noto Sans JP
 */
export default function MarketingHomePage() {
  return <LpHomeClient />;
}

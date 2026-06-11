"use client";

import dynamic from "next/dynamic";

// lottie-web はモジュール読込時に document を参照するため SSR では読み込まない
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export function HeroLottie({ className }: { className?: string }) {
  return (
    <Player
      autoplay
      loop
      src="/lottie/hero-flame-pulse.json"
      className={className}
      rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
    />
  );
}

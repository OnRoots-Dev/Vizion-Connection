"use client";

import dynamic from "next/dynamic";

// lottie-web はモジュール読込時に document を参照するため SSR では読み込まない
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false },
);

export function LottieAnim({
  src,
  loop = false,
  className,
  keepLastFrame = true,
}: {
  src: string;
  loop?: boolean;
  className?: string;
  keepLastFrame?: boolean;
}) {
  return (
    <Player
      autoplay
      loop={loop}
      keepLastFrame={keepLastFrame}
      src={src}
      className={className}
    />
  );
}

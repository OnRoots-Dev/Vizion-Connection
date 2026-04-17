"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  toSlug: string;
  roleColor: string;
  isLoggedIn: boolean;
  isOwn: boolean;
  initialCheerCount: number;
}

export default function CheerCtaButtonClient({
  toSlug,
  roleColor,
  isLoggedIn,
  isOwn,
  initialCheerCount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cheered, setCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(initialCheerCount);

  async function handleClick() {
    if (loading || cheered || isOwn) return;

    if (!isLoggedIn) {
      router.push("/register");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toSlug }),
      });

      const data: { success: boolean; cheerCount?: number } = await res.json();
      if (data.success && typeof data.cheerCount === "number") {
        setCheerCount(data.cheerCount);
        setCheered(true);
      } else if (res.status === 401) {
        router.push("/register");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || cheered || isOwn}
      className="w-full rounded-[14px] px-4 py-3 text-sm font-black tracking-wide transition will-change-transform disabled:opacity-60"
      style={
        cheered
          ? {
              background: `${roleColor}12`,
              border: `1px solid ${roleColor}30`,
              color: roleColor,
            }
          : {
              background: roleColor,
              border: `1px solid ${roleColor}55`,
              color: "#000",
            }
      }
    >
      {isOwn
        ? "自分のプロフィールにはCheerできません"
        : loading
          ? "送信中..."
          : cheered
            ? `Cheerしました · ${cheerCount.toLocaleString()}`
            : `このアスリートを応援する · ${cheerCount.toLocaleString()}`}
    </button>
  );
}

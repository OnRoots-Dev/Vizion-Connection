"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

export type TimelineRole = "All" | "Athlete" | "Trainer" | "Business" | "Crew";

export interface TimelineJourney {
  id: string;
  user_slug: string;
  content: string;
  condition_score: number | null;
  image_url: string | null;
  created_at: string;
  cheer_count: number;
  users: {
    display_name: string | null;
    role: string | null;
    avatar_url: string | null;
  } | null;
}

const conditionEmoji: Record<number, string> = {
  1: "😵",
  2: "😕",
  3: "🙂",
  4: "🔥",
  5: "🚀",
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "V";
}

function formatTime(value: string) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "NOW";
  if (minutes < 60) return `${minutes}M AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}D AGO`;
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function TimelineCard({
  journey,
  index,
  currentUserSlug,
}: {
  journey: TimelineJourney;
  index: number;
  currentUserSlug?: string | null;
}) {
  const [ripples, setRipples] = useState<number[]>([]);
  const displayName = journey.users?.display_name ?? journey.user_slug;
  const role = journey.users?.role ?? "Crew";
  const emoji = journey.condition_score ? conditionEmoji[journey.condition_score] ?? "✨" : "✨";
  const cheeredKey = `timeline-cheered:${journey.id}`;
  const instandKey = `instand:${journey.user_slug}`;
  const isOwnJourney = currentUserSlug != null && currentUserSlug === journey.user_slug;

  const [optimisticCheer, setOptimisticCheer] = useState(() => ({
    count: journey.cheer_count,
    cheered: typeof window !== "undefined" && window.localStorage.getItem(cheeredKey) === "1",
  }));

  const [isProcessing, setIsProcessing] = useState(false);

  const [isInStand, setIsInStand] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(instandKey) === "1";
  });

  async function handleCheer() {
    if (optimisticCheer.cheered || isProcessing) return;

    setIsProcessing(true);
    setOptimisticCheer((prev) => ({ count: prev.count + 1, cheered: true }));
    window.localStorage.setItem(cheeredKey, "1");

    const id = Date.now();
    setRipples((current) => [...current, id]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item !== id));
    }, 650);

    try {
      const res = await fetch("/api/cheer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toSlug: journey.user_slug }),
      });
      if (!res.ok) throw new Error("cheer failed");
    } catch {
      setOptimisticCheer((prev) => ({ count: prev.count - 1, cheered: false }));
      window.localStorage.removeItem(cheeredKey);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleInStand() {
    const prev = isInStand;
    const next = !prev;
    setIsInStand(next);
    window.localStorage.setItem(instandKey, next ? "1" : "0");

    try {
      const res = await (next
        ? fetch("/api/instand", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target_slug: journey.user_slug }),
          })
        : fetch(`/api/instand?target_slug=${encodeURIComponent(journey.user_slug)}`, {
            method: "DELETE",
          }));

      if (!res.ok && res.status !== 409) {
        // 409（既にフォロー済み）はそのまま維持、それ以外は戻す
        setIsInStand(prev);
        window.localStorage.setItem(instandKey, prev ? "1" : "0");
      }
    } catch {
      setIsInStand(prev);
      window.localStorage.setItem(instandKey, prev ? "1" : "0");
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.1 }}
      className="overflow-hidden rounded-lg border border-[color-mix(in_srgb,var(--electric)_16%,transparent)] bg-[var(--surface-2)]"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <span className="animate-pulse-ring absolute inset-0 rounded-full border border-[var(--pulse)] bg-[var(--pulse-dim)]" />
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--electric)_30%,transparent)] bg-[var(--surface-3)]">
              {journey.users?.avatar_url ? (
                <Image
                  src={journey.users.avatar_url}
                  alt={displayName}
                  fill
                  sizes="48px"
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--surface-3)] font-display text-lg text-[var(--electric)]">
                  {getInitial(displayName)}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl uppercase tracking-wide text-[var(--foreground)]">
                  {displayName}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <span>{role}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--electric)]" />
                  <span>{formatTime(journey.created_at)}</span>
                </div>
              </div>
              <span className="rounded-lg bg-[var(--surface-3)] px-2.5 py-1 text-lg" aria-label="condition score">
                {emoji}
              </span>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
              {journey.content}
            </p>
          </div>
        </div>

        {journey.image_url ? (
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-lg bg-[var(--surface-3)]">
            <Image
              src={journey.image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 672px"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] pt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleCheer()}
              disabled={optimisticCheer.cheered || isProcessing}
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-[var(--surface-3)] px-4 py-2 font-display text-sm uppercase tracking-wider text-[var(--foreground)] transition hover:bg-[var(--surface-4)] disabled:cursor-default disabled:text-[var(--electric)]"
            >
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <motion.span
                    key={ripple}
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--pulse-glow)]"
                  />
                ))}
              </AnimatePresence>
              <Heart className="relative h-4 w-4" fill={optimisticCheer.cheered ? "currentColor" : "none"} />
              <span className="relative">Cheer</span>
            </button>

            {!isOwnJourney && (
              <button
                type="button"
                onClick={() => void handleInStand()}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition"
                style={
                  isInStand
                    ? { background: "rgba(0,194,255,0.1)", color: "var(--electric)", border: "1px solid rgba(0,194,255,0.3)" }
                    : { background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)" }
                }
              >
                {isInStand ? "観戦中" : "IN STAND"}
              </button>
            )}
          </div>

          <motion.div
            key={optimisticCheer.count}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-mono text-sm text-[var(--electric)]"
          >
            {optimisticCheer.count} CHEERS
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { AdTier, SlotType } from "../constants/adSlots";

// TODO: connect to real ad inventory API — currently uses mock AdData
type AdData = {
  id: string;
  headline: string;
  bodyText?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
};

export function AdSlot({
  slotType,
  tier,
  ad,
  aboveFold,
}: {
  slotType: SlotType;
  tier: AdTier;
  ad: AdData;
  aboveFold?: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const isSlotA = slotType === "slot_a";
  const isLegacy = isSlotA && tier === "legacy";
  const isPresence = isSlotA && tier === "presence";
  const isSignal = slotType === "slot_b";
  const isLocal = slotType === "local_slot";

  const label = isLocal ? "広告" : "PR";

  const rootClass = (() => {
    if (isLegacy) {
      return "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl";
    }
    if (isPresence) {
      return "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg";
    }
    if (isSignal || isLocal) {
      return "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
    }
    return "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
  })();

  const positionClass = aboveFold ? "sticky top-0 z-30" : "relative";
  const aboveFoldSurfaceClass = aboveFold
    ? "backdrop-blur-sm bg-white/90 dark:bg-black/80"
    : "";

  const badgeClass = (() => {
    if (isLegacy) return "border-slate-900/15 bg-slate-900 text-white";
    if (isPresence) return "border-slate-900/10 bg-slate-900/90 text-white";
    return "border-slate-200 bg-slate-50 text-slate-600";
  })();

  if (dismissed) return null;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      aria-label="広告"
      data-ad-tier={tier}
      className={[positionClass, rootClass, aboveFoldSurfaceClass]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          {isLocal ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeClass}`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              LOCAL
            </span>
          ) : null}

          {isSignal ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeClass}`}
            >
              PR
            </span>
          ) : null}

          {isLegacy ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeClass}`}
            >
              LEGACY
            </span>
          ) : null}

          {isPresence ? (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${badgeClass}`}
            >
              PRESENCE
            </span>
          ) : null}

          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600"
          aria-label="広告を閉じる"
        >
          {isSignal ? "PR" : "広告"}
          <span className="text-slate-400">×</span>
        </button>
      </div>

      <div
        className={
          isSlotA
            ? "grid gap-4 p-5 sm:grid-cols-[180px_1fr]"
            : "grid gap-3 p-4 sm:grid-cols-[140px_1fr]"
        }
      >
        {ad.imageUrl ? (
          <Image
            src={ad.imageUrl}
            alt={ad.headline}
            width={isSlotA ? 360 : 280}
            height={isSlotA ? 120 : 92}
            unoptimized
            className={
              isSlotA
                ? "h-[120px] w-full rounded-xl object-cover"
                : "h-[92px] w-full rounded-xl object-cover"
            }
          />
        ) : (
          <div
            className={
              isSlotA
                ? "h-[120px] w-full rounded-xl bg-slate-100"
                : "h-[92px] w-full rounded-xl bg-slate-100"
            }
          />
        )}

        <div className="min-w-0">
          <p
            className={
              isSlotA
                ? "text-[18px] font-black text-slate-950"
                : "text-[15px] font-black text-slate-950"
            }
          >
            {ad.headline}
          </p>
          {ad.bodyText ? (
            <p
              className={
                isSlotA
                  ? "mt-2 line-clamp-2 text-sm leading-7 text-slate-600"
                  : "mt-2 line-clamp-2 text-sm leading-7 text-slate-600"
              }
            >
              {ad.bodyText}
            </p>
          ) : null}

          {ad.linkUrl ? (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={
                isSlotA
                  ? "mt-4 inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800"
                  : "mt-3 inline-flex w-fit rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800"
              }
            >
              詳細を見る
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

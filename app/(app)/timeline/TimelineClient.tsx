"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Radio } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { TimelineCard, type TimelineJourney, type TimelineRole } from "./TimelineCard";

const roles: TimelineRole[] = ["All", "Athlete", "Trainer", "Business", "Crew"];

type TimelineJourneyRow = Omit<TimelineJourney, "users"> & {
  users:
    | TimelineJourney["users"]
    | NonNullable<TimelineJourney["users"]>[]
    | null;
};

function normalizeJourney(row: TimelineJourneyRow): TimelineJourney {
  const users = Array.isArray(row.users) ? row.users[0] ?? null : row.users;
  return {
    ...row,
    users,
  };
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-lg border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] bg-[var(--surface-2)] p-4 sm:p-5"
    >
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-full bg-[var(--surface-3)]" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-1/2 rounded-lg bg-[var(--surface-3)]" />
          <div className="h-3 w-1/3 rounded-lg bg-[var(--surface-3)]" />
          <div className="h-16 rounded-lg bg-[var(--surface-3)]" />
        </div>
      </div>
    </motion.div>
  );
}

export default function TimelineClient({ currentUserSlug }: { currentUserSlug?: string | null }) {
  const [journeys, setJourneys] = useState<TimelineJourney[]>([]);
  const [activeRole, setActiveRole] = useState<TimelineRole>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = useCallback(async () => {
    setError(null);
    const { data, error: fetchError } = await supabaseBrowser
      .from("journeys")
      .select("id, user_slug, content, condition_score, image_url, created_at, cheer_count, users(display_name, role, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (fetchError) {
      setError("Timelineを読み込めませんでした。");
      setIsLoading(false);
      return;
    }

    setJourneys(((data ?? []) as unknown as TimelineJourneyRow[]).map(normalizeJourney));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchJourneys();

    const channel = supabaseBrowser
      .channel("timeline-journeys")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "journeys" },
        () => {
          void fetchJourneys();
        },
      )
      .subscribe();

    return () => {
      void supabaseBrowser.removeChannel(channel);
    };
  }, [fetchJourneys]);

  const filteredJourneys = useMemo(() => {
    if (activeRole === "All") return journeys;
    return journeys.filter((journey) => journey.users?.role?.toLowerCase() === activeRole.toLowerCase());
  }, [activeRole, journeys]);

  return (
    <main className="min-h-screen bg-[var(--surface-1)] px-4 py-6 text-[var(--foreground)]">
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] bg-[var(--surface-1)]/95 px-4 pb-4 pt-2 backdrop-blur">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-4xl uppercase tracking-wider text-[var(--foreground)]">
              TIMELINE
            </h1>
            <button
              type="button"
              aria-label="Filter timeline"
              className="rounded-lg bg-[var(--surface-2)] p-3 text-[var(--electric)] transition hover:bg-[var(--surface-3)]"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {roles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={[
                  "shrink-0 rounded-lg border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition",
                  activeRole === role
                    ? "border-[var(--electric)] bg-[var(--pulse-dim)] text-[var(--electric)]"
                    : "border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--surface-2)] text-[color-mix(in_srgb,var(--foreground)_58%,transparent)] hover:bg-[var(--surface-3)]",
                ].join(" ")}
              >
                {role}
              </button>
            ))}
          </nav>
        </header>

        {error ? (
          <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--electric)_20%,transparent)] bg-[var(--surface-2)] p-4 text-sm text-[var(--electric)]">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((item) => (
              <SkeletonCard key={item} index={item} />
            ))}
          </div>
        ) : filteredJourneys.length > 0 ? (
          <div className="space-y-4">
            {filteredJourneys.map((journey, index) => (
              <TimelineCard
                key={journey.id}
                journey={journey}
                index={index}
                currentUserSlug={currentUserSlug}
              />
            ))}
          </div>
        ) : (
          <section className="flex min-h-[58vh] flex-col items-center justify-center text-center">
            <div className="animate-pulse-beat mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--electric)] bg-[var(--pulse-dim)] text-[var(--electric)]">
              <Radio className="h-9 w-9" />
            </div>
            <h2 className="font-display text-3xl uppercase tracking-wide text-[var(--foreground)]">
              まだ活動がありません
            </h2>
            <p className="mt-3 text-sm text-[color-mix(in_srgb,var(--foreground)_58%,transparent)]">
              最初のJourneyを記録しましょう
            </p>
            <Link
              href="/dashboard?view=journey"
              className="mt-7 rounded-lg bg-[var(--electric)] px-5 py-3 font-display text-sm uppercase tracking-wider text-[var(--surface-1)] transition hover:opacity-90"
            >
              Journeyへ
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

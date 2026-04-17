import Link from "next/link";
import type { Metadata } from "next";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cheerランキング | Vizion Connection",
  description: "Vizion Connectionの公開Cheerランキング",
};

const ROLE_COLOR: Record<string, string> = {
  Athlete: "#C1272D",
  Trainer: "#1A7A4A",
  Members: "#B8860B",
  Business: "#1B3A8C",
};

function getRankIcon(rank: number) {
  if (rank === 1) return { icon: "♛", color: "#FFD600" };
  if (rank === 2) return { icon: "🥈", color: "#DCE7F5" };
  if (rank === 3) return { icon: "🥉", color: "#D8A06A" };
  return null;
}

async function getRanking(role?: string) {
  let query = supabaseServer
    .from("users")
    .select("slug, display_name, role, avatar_url, cheer_count, region, sport, is_founding_member")
    .eq("is_deleted", false)
    .eq("is_public", true)
    .order("cheer_count", { ascending: false })
    .limit(50);
  if (role) query = query.eq("role", role);
  const { data } = await query;
  return data ?? [];
}

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const users = await getRanking(role);
  const tabs = [
    { label: "全体", value: undefined },
    { label: "Athlete", value: "Athlete" },
    { label: "Trainer", value: "Trainer" },
    { label: "Members", value: "Members" },
    { label: "Business", value: "Business" },
  ];

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] text-white/35">PUBLIC RANKING</p>
            <h1 className="mt-2 text-4xl font-black">Cheer Ranking</h1>
          </div>
          <Link href="/" className="text-sm text-white/55 underline-offset-4 hover:underline">トップへ戻る</Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = role === tab.value;
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/ranking?role=${tab.value}` : "/ranking"}
                className="rounded-full border px-4 py-2 text-sm font-bold transition"
                style={{
                  borderColor: active ? "rgba(255,214,0,0.4)" : "rgba(255,255,255,0.12)",
                  background: active ? "rgba(255,214,0,0.12)" : "rgba(255,255,255,0.03)",
                  color: active ? "#FFD600" : "rgba(255,255,255,0.7)",
                }}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user, index) => (
            (() => {
              const rank = index + 1;
              const rankIcon = getRankIcon(rank);
              return (
            <Link
              key={user.slug}
              href={`/u/${user.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-black tracking-[0.15em] text-white/35">
                  {rankIcon ? (
                    <span style={{ color: rankIcon.color, fontSize: 16, lineHeight: 1 }}>{rankIcon.icon}</span>
                  ) : (
                    <>#{rank}</>
                  )}
                </span>
                <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: `${ROLE_COLOR[user.role] ?? "#999"}22`, color: ROLE_COLOR[user.role] ?? "#999" }}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-white/10">
                  {user.avatar_url ? <img src={user.avatar_url} alt={user.display_name} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black">{user.display_name}</p>
                  <p className="truncate text-sm text-white/45">@{user.slug}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-white/55">{user.region ?? "地域未設定"}{user.sport ? ` / ${user.sport}` : ""}</span>
                <span className="font-mono font-black text-[#FFD600]">★ {user.cheer_count}</span>
              </div>
            </Link>
              );
            })()
          ))}
        </div>
      </div>
    </main>
  );
}

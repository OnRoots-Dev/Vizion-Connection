import Link from "next/link";
import type { Metadata } from "next";
import { getPublicUsers } from "@/lib/supabase/data/users.server";
import Image from "next/image";
import { PREFECTURES_BY_REGION, REGION_OPTIONS, ROLE_DISCOVERY_OPTIONS } from "@/lib/discovery-filters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery | Vizion Connection",
  description: "公開ユーザーをDiscoveryで探す。都道府県・競技で絞り込み可能。",
};

const ALL_PREFECTURES = Object.values(PREFECTURES_BY_REGION).flat();

export default async function PublicDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; region?: string; prefecture?: string; sport?: string }>;
}) {
  const { role, region, prefecture, sport } = await searchParams;

  // プロフィール本体は public.users。都道府県・競技は Supabase の eq 条件で絞り込み。
  const users = await getPublicUsers({
    role: role || undefined,
    region: region || undefined,
    prefecture: prefecture || undefined,
    sport: sport || undefined,
    limit: 48,
  });

  const sportOptions =
    role && ROLE_DISCOVERY_OPTIONS[role]
      ? ROLE_DISCOVERY_OPTIONS[role].options
      : [];
  const prefectureOptions = region
    ? (PREFECTURES_BY_REGION[region] ?? ALL_PREFECTURES)
    : ALL_PREFECTURES;

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] text-white/35">PUBLIC DISCOVERY</p>
            <h1 className="mt-2 text-4xl font-black">Discovery</h1>
            <p className="mt-2 text-sm text-white/45">
              公開プロフィールを検索・リスト表示できます。地図ピン表示のみ近日公開です。
            </p>
          </div>
          <Link href="/" className="text-sm text-white/55 underline-offset-4 hover:underline">
            トップへ戻る
          </Link>
        </div>

        {/* Map プレースホルダ（意図的未実装：Mapbox） */}
        <section
          className="relative overflow-hidden rounded-2xl border border-white/10"
          style={{
            minHeight: 180,
            background:
              "radial-gradient(ellipse at 30% 40%, rgba(60,140,255,0.16), transparent 55%), #0a0e18",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/45 px-4 text-center backdrop-blur-[2px]">
            <span className="inline-flex items-center rounded-full border border-[#C8E800]/45 bg-[#C8E800]/12 px-4 py-1.5 text-[11px] font-black tracking-[0.14em] text-[#C8E800]">
              Map 機能は近日公開
            </span>
            <p className="max-w-md text-sm leading-relaxed text-white/70">
              地図ピン表示のみ今後公開予定です。下のフィルターとリストは<strong className="font-bold text-white/90">本日より利用可能</strong>です。
            </p>
          </div>
        </section>

        {/* Filters — GET form で searchParams を更新 */}
        <form
          method="get"
          className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <select
            name="role"
            defaultValue={role ?? ""}
            className="rounded-xl border border-white/10 bg-[#111118] px-3 py-2.5 text-sm text-white"
          >
            <option value="">全ロール</option>
            <option value="Athlete">Athlete</option>
            <option value="Trainer">Trainer</option>
            <option value="Crew">Crew</option>
            <option value="Business">Business</option>
          </select>
          <select
            name="region"
            defaultValue={region ?? ""}
            className="rounded-xl border border-white/10 bg-[#111118] px-3 py-2.5 text-sm text-white"
          >
            <option value="">全地域</option>
            {REGION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            name="prefecture"
            defaultValue={prefecture ?? ""}
            className="rounded-xl border border-white/10 bg-[#111118] px-3 py-2.5 text-sm text-white"
          >
            <option value="">全都道府県</option>
            {prefectureOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <select
            name="sport"
            defaultValue={sport ?? ""}
            className="rounded-xl border border-white/10 bg-[#111118] px-3 py-2.5 text-sm text-white"
          >
            <option value="">競技 / 項目</option>
            {sportOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[#C8E800] px-4 py-2.5 text-sm font-bold text-[#07080d] transition hover:bg-white"
          >
            絞り込む
          </button>
        </form>

        {users.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/50">
            条件に一致する公開プロフィールがありません。
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <Link
                key={user.slug}
                href={`/u/${user.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-white/10">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.displayName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{user.displayName}</p>
                    <p className="truncate text-sm text-white/45">@{user.slug}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/75">
                    {user.role}
                  </span>
                  {user.prefecture ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55">
                      {user.prefecture}
                    </span>
                  ) : user.region ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55">
                      {user.region}
                    </span>
                  ) : null}
                  {user.sport ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55">
                      {user.sport}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/60">
                  {user.bio ?? "プロフィールの詳細は公開ページから確認できます。"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

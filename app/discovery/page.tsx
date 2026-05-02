import Link from "next/link";
import type { Metadata } from "next";
import { getPublicUsers } from "@/lib/supabase/data/users.server";
import Image from "next/image";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery | Vizion Connection",
  description: "公開ユーザーをDiscoveryで探す",
};

export default async function PublicDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; region?: string; sport?: string }>;
}) {
  const { role, region, sport } = await searchParams;
  const users = await getPublicUsers({ role, region, sport, limit: 24 });

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[0.22em] text-white/35">PUBLIC DISCOVERY</p>
            <h1 className="mt-2 text-4xl font-black">Discovery</h1>
          </div>
          <Link href="/" className="text-sm text-white/55 underline-offset-4 hover:underline">トップへ戻る</Link>
        </div>

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
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/75">{user.role}</span>
                {user.region ? <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55">{user.region}</span> : null}
                {user.sport ? <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/55">{user.sport}</span> : null}
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/60">{user.bio ?? "プロフィールの詳細は公開ページから確認できます。"}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

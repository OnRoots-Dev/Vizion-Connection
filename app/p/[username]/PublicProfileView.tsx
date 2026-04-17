import Image from "next/image";
import Link from "next/link";

import CheerCtaButtonClient from "./CheerCtaButtonClient";

type CareerRow = {
  id: string;
  year: number;
  title: string;
  description: string | null;
  tag: "tournament" | "award" | "affiliation" | "media";
};

function roleToKey(role: string) {
  if (role === "Trainer") return "trainer";
  if (role === "Athlete") return "athlete";
  if (role === "Business") return "business";
  if (role === "Members") return "member";
  return "member";
}

function roleColor(role: string) {
  if (role === "Trainer") return "#32D278";
  if (role === "Athlete") return "#FF5050";
  return "#FFD600";
}

function roleGradient(role: string) {
  if (role === "Trainer") return "linear-gradient(135deg, #32D278 0%, #0E5C35 100%)";
  if (role === "Athlete") return "linear-gradient(135deg, #FF5050 0%, #7A1C1C 100%)";
  return "linear-gradient(135deg, #FFD600 0%, #7A6A12 100%)";
}

function tagLabel(tag: CareerRow["tag"]) {
  if (tag === "tournament") return "TOURNAMENT";
  if (tag === "award") return "AWARD";
  if (tag === "affiliation") return "AFFILIATION";
  return "MEDIA";
}

export default function PublicProfileView({
  user,
  careers,
  username,
  isLoggedIn,
  isOwn,
  followersCount,
  viewsCount,
}: {
  user: any;
  careers: CareerRow[];
  username: string;
  isLoggedIn: boolean;
  isOwn: boolean;
  followersCount: number;
  viewsCount: number;
}) {
  const role = String(user.role ?? "Athlete");
  const rl = roleColor(role);
  const ctaGradient = roleGradient(role);

  const coverUrl = (user.cover_url as string | null | undefined) ?? (user.profile_image_url as string | null | undefined) ?? null;
  const avatarUrl = (user.avatar_url as string | null | undefined) ?? null;

  const name = String(user.full_name ?? user.display_name ?? username);
  const sport = (user.sport as string | null | undefined) ?? null;
  const affiliation = (user.affiliation as string | null | undefined) ?? null;

  const derivedArea = [user.region, user.prefecture, user.location]
    .map((v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null))
    .filter(Boolean)
    .join(" / ");

  const area = ((user.area as string | null | undefined) ?? derivedArea) || null;

  const bio = (user.bio as string | null | undefined) ?? null;

  const available = Boolean(user.is_available ?? false);

  const instagram = String(user.instagram_url ?? user.instagram ?? "");
  const xUrl = String(user.x_url ?? user.xUrl ?? "");
  const youtube = String(user.youtube_url ?? "");

  const cheerCount = Number(user.cheer_count ?? 0);

  const sponsorLogos = Array.isArray(user.sponsor_logos)
    ? (user.sponsor_logos as string[]).filter((v) => typeof v === "string" && v.trim())
    : [];

  return (
    <div className="min-h-screen bg-[#07070e] text-white">
      <main className="mx-auto w-full max-w-[980px] pb-28">
        <section className="relative w-full overflow-hidden">
          <div className="relative h-[380px] w-full">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt=""
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${rl}55 0%, rgba(13,13,26,1) 70%, rgba(7,7,14,1) 100%)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070e] via-[#07070e]/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 px-5 pb-7">
              <div className="max-w-[980px]">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">PROFILE</p>
                <h1 className="mt-2 font-display text-[56px] leading-[0.9] tracking-tight">
                  {name}
                </h1>
                <p className="mt-3 font-body text-sm text-white/60">
                  {sport ?? ""}
                  {affiliation ? ` · ${affiliation}` : ""}
                  {area ? ` · ${area}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="-mt-24 px-5">
            <div className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-[78px] w-[78px] overflow-hidden rounded-full border border-white/8 bg-white/5">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-[42px] leading-none tracking-tight">{name}</p>
                    <p className="mt-2 truncate text-sm text-white/40 font-body">
                      @{username}
                      {sport ? ` · ${sport}` : ""}
                      {affiliation ? ` · ${affiliation}` : ""}
                      {area ? ` · ${area}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-[11px] font-black tracking-[0.22em]"
                      style={{ background: `${rl}1a`, border: `1px solid ${rl}33`, color: rl }}
                    >
                      {role.toUpperCase()}
                    </span>
                    {available ? (
                      <span className="rounded-full bg-[#FFD600] px-3 py-1 text-[11px] font-black tracking-wide text-black">
                        今オファー受付中
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    {xUrl ? (
                      <a
                        href={xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 transition hover:bg-white/10"
                        aria-label="X"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    ) : null}
                    {instagram ? (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 transition hover:bg-white/10"
                        aria-label="Instagram"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" />
                        </svg>
                      </a>
                    ) : null}
                    {youtube ? (
                      <a
                        href={youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/5 transition hover:bg-white/10"
                        aria-label="YouTube"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white/70">
                          <path d="M21.58 7.19a2.75 2.75 0 00-1.94-1.95C17.94 4.75 12 4.75 12 4.75s-5.94 0-7.64.49A2.75 2.75 0 002.42 7.2a28.74 28.74 0 00-.42 4.8 28.74 28.74 0 00.42 4.8 2.75 2.75 0 001.94 1.95c1.7.49 7.64.49 7.64.49s5.94 0 7.64-.49a2.75 2.75 0 001.94-1.95 28.74 28.74 0 00.42-4.8 28.74 28.74 0 00-.42-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-6 px-5">
          <section className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">ABOUT</p>
            <div className="mt-4 font-body text-sm leading-7 text-white/80 whitespace-pre-wrap">
              {bio ?? ""}
            </div>
          </section>

          <section className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">CAREER & ACHIEVEMENTS</p>
            <div className="mt-5 space-y-5">
              {careers.length === 0 ? (
                <p className="font-body text-sm text-white/40">キャリア情報はまだありません</p>
              ) : (
                careers.map((c) => (
                  <div key={c.id} className="grid grid-cols-[92px_minmax(0,1fr)] gap-4">
                    <div className="font-display text-4xl leading-none" style={{ color: rl }}>
                      {c.year}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-body text-base font-bold text-white">{c.title}</p>
                        <span
                          className="rounded-full px-3 py-1 text-[10px] font-black tracking-[0.2em]"
                          style={{ background: `${rl}14`, border: `1px solid ${rl}25`, color: rl }}
                        >
                          {tagLabel(c.tag)}
                        </span>
                      </div>
                      {c.description ? (
                        <p className="mt-2 font-body text-sm leading-7 text-white/40 whitespace-pre-wrap">
                          {c.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {role === "Athlete" ? (
            <section className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">STATS</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                  <p className="font-display text-4xl leading-none text-[#FFD600]">{cheerCount.toLocaleString()}</p>
                  <p className="mt-2 font-body text-xs text-white/40">Cheer</p>
                </div>
                <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                  <p className="font-display text-4xl leading-none text-white">{viewsCount.toLocaleString()}</p>
                  <p className="mt-2 font-body text-xs text-white/40">プロフィール閲覧数</p>
                </div>
                <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                  <p className="font-display text-4xl leading-none text-white">{followersCount.toLocaleString()}</p>
                  <p className="mt-2 font-body text-xs text-white/40">フォロワー</p>
                </div>
              </div>
            </section>
          ) : null}

          {sponsorLogos.length > 0 ? (
            <section className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">SUPPORTED BY</p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                {sponsorLogos.map((src) => (
                  <div
                    key={src}
                    className="relative h-10 w-28 overflow-hidden rounded-[12px] border border-white/8 bg-white/5"
                  >
                    <Image src={src} alt="" fill className="object-contain p-2" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[20px] border border-white/8 bg-[#0d0d1a] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">SHARE</p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="font-body text-sm text-white/40">
                このプロフィールをシェアして応援を広げよう
              </p>
              <Link
                href={`/u/${String(user.slug ?? username)}`}
                className="inline-flex items-center justify-center rounded-[14px] border border-white/8 bg-white/5 px-4 py-3 text-sm font-black transition hover:bg-white/10"
              >
                詳細プロフィールへ
              </Link>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[#07070e]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[980px] gap-3 px-5 py-4">
          <div className="flex-1">
            <CheerCtaButtonClient
              toSlug={String(user.slug ?? username)}
              roleColor={rl}
              isLoggedIn={isLoggedIn}
              isOwn={isOwn}
              initialCheerCount={cheerCount}
            />
          </div>
          <Link
            href={`/register?ref=${encodeURIComponent(username)}`}
            className="flex-1 rounded-[14px] px-4 py-3 text-center text-sm font-black tracking-wide text-black"
            style={{
              background: ctaGradient,
            }}
          >
            Vizion Connectionに登録する
          </Link>
        </div>
      </div>

      <div className="sr-only" data-role={roleToKey(role)} />
    </div>
  );
}

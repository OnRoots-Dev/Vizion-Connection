import Link from "next/link";
import { getFeaturedNewsPost, getNewsPosts, NEWS_CATEGORY_LABEL } from "@/lib/news";
import NewsHeaderClient from "./NewsHeaderClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

export const dynamic = "force-dynamic";

function excerpt(text: string) {
    return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

export default async function NewsPage() {
    const user = await getOptionalSessionUser();
    const [posts, featured, ads] = await Promise.all([
        getNewsPosts(),
        getFeaturedNewsPost(),
        getAdsForUser(user?.prefecture ?? "", user?.sport ?? undefined),
    ]);
    const nationalMedium = ads.find((ad) => !isLocalPlan(ad.plan)) ?? null;
    const localSmall = ads.find((ad) => isLocalPlan(ad.plan)) ?? null;

    return (
        <main className="min-h-screen bg-[#07070c] px-4 py-10 text-white sm:px-6">
            <div className="mx-auto w-full max-w-4xl">
                <NewsHeaderClient />
                <div className="grid h-[min(82vh,calc(100vh-160px))] grid-rows-[auto,1fr,auto] gap-3">
                    <div>
                        {nationalMedium ? (
                            <AdCard ad={nationalMedium} size="medium" />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-yellow-300/25 bg-yellow-300/[0.04] p-4 text-sm text-yellow-100/65">
                                全国スポンサー広告枠（空き枠）
                            </div>
                        )}
                    </div>

                    <div className="overflow-y-auto pr-1">
                        {posts.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-white/60">
                                公開中のニュースはまだありません。
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {featured ? (
                                    <Link
                                        href={`/news/${featured.id}`}
                                        className="block overflow-hidden rounded-[28px] border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.08] via-white/[0.04] to-white/[0.02] shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition hover:border-amber-300/35"
                                    >
                                        <div className="grid gap-0 md:grid-cols-[1.3fr_1fr]">
                                            {featured.imageUrl ? (
                                                <div className="relative h-64 overflow-hidden md:h-full">
                                                    <img src={featured.imageUrl} alt={featured.title} className="h-full w-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-transparent to-transparent" />
                                                </div>
                                            ) : (
                                                <div className="flex min-h-56 items-end bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_45%),linear-gradient(135deg,#11131a,#090b11)] p-6">
                                                    <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-bold text-amber-200">
                                                        注目記事
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col justify-between p-6">
                                                <div>
                                                    <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
                                                        <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 font-bold text-amber-200">
                                                            注目記事
                                                        </span>
                                                        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-bold text-cyan-200">
                                                            {NEWS_CATEGORY_LABEL[featured.category]}
                                                        </span>
                                                    </div>
                                                    <h2 className="text-2xl font-black leading-tight text-white">{featured.title}</h2>
                                                    <p className="mt-3 text-sm leading-7 text-white/70">{excerpt(featured.body)}</p>
                                                </div>
                                                <div className="mt-5 flex items-center justify-between text-xs text-white/45">
                                                    <span>{new Date(featured.publishedAt).toLocaleString("ja-JP")}</span>
                                                    <span>閲覧 {featured.viewCount.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ) : null}
                                {posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/news/${post.id}`}
                                        className="block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition hover:border-white/20 hover:bg-white/[0.07]"
                                    >
                                        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                                            {post.imageUrl ? (
                                                <img src={post.imageUrl} alt={post.title} className="h-44 w-full object-cover sm:h-full" />
                                            ) : (
                                                <div className="min-h-36 bg-[linear-gradient(135deg,#10141d,#090b11)]" />
                                            )}
                                            <div className="p-5">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-200">
                                                        {NEWS_CATEGORY_LABEL[post.category]}
                                                    </span>
                                                    <span className="text-xs text-white/45">
                                                        {new Date(post.publishedAt).toLocaleString("ja-JP")}
                                                    </span>
                                                </div>
                                                <h2 className="text-lg font-extrabold text-white">{post.title}</h2>
                                                <p className="mt-2 text-sm leading-7 text-white/75">{excerpt(post.body)}</p>
                                                <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                                                    <p>by {post.author || "運営"}</p>
                                                    <p>閲覧 {post.viewCount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        {localSmall ? (
                            <AdCard ad={localSmall} size="small" />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-yellow-300/25 bg-yellow-300/[0.04] p-4 text-sm text-yellow-100/65">
                                地域スポンサー広告枠（空き枠）
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

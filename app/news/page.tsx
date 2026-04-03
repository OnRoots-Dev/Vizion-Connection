import { getNewsPosts, NEWS_CATEGORY_LABEL } from "@/lib/news";
import NewsHeaderClient from "./NewsHeaderClient";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { getAdsForUser } from "@/lib/ads";
import { isLocalPlan } from "@/lib/ads-shared";
import AdCard from "@/components/AdCard";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
    const user = await getOptionalSessionUser();
    const [posts, ads] = await Promise.all([
        getNewsPosts(),
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
                                {posts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                                    >
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-200">
                                                {NEWS_CATEGORY_LABEL[post.category]}
                                            </span>
                                            <span className="text-xs text-white/45">
                                                {new Date(post.publishedAt).toLocaleString("ja-JP")}
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-extrabold text-white">{post.title}</h2>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/75">{post.body}</p>
                                        <p className="mt-4 text-xs text-white/40">by {post.author || "運営"}</p>
                                    </article>
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

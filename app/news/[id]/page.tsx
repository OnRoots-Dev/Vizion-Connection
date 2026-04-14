import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNewsPostById, getNewsPostComments, getNewsPosts, incrementNewsPostView, NEWS_TOPIC_LABEL } from "@/lib/news";
import { NewsMediaBlocks } from "@/components/news/NewsMediaBlocks";
import { NewsCommentsPanel } from "@/components/news/NewsCommentsPanel";
import { getOptionalSessionUser } from "@/lib/auth/get-optional-session-user";
import { NewsArticleActions } from "@/components/news/NewsArticleActions";

function excerpt(text: string) {
    return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

function paragraphize(text: string) {
    return text
        .split(/\n{2,}/)
        .map((chunk) => chunk.trim())
        .filter(Boolean);
}

function keyPoints(post: { summary: string; body: string; authorRole: string; topic: string }) {
    const firstParagraph = paragraphize(post.body).slice(0, 2);
    const base = [post.summary, ...firstParagraph].filter(Boolean);
    return Array.from(new Set(base)).slice(0, 3);
}

function roleClass(role: string) {
    if (role === "Athlete") return "bg-rose-50 text-rose-700 border-rose-200";
    if (role === "Trainer") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (role === "Business") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const post = await getNewsPostById(id);

    if (!post) {
        return {
            title: "ニュースが見つかりません | Vizion Connection",
        };
    }

    return {
        title: `${post.title} | News Rooms`,
        description: excerpt(post.summary || post.body),
    };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [post, user] = await Promise.all([getNewsPostById(id), getOptionalSessionUser()]);

    if (!post) {
        notFound();
    }

    await incrementNewsPostView(post.id);

    const [relatedPosts, comments] = await Promise.all([
        getNewsPosts().then((items) => items.filter((item) => item.id !== post.id).slice(0, 5)),
        getNewsPostComments(post.id),
    ]);

    const paragraphs = paragraphize(post.body);
    const points = keyPoints(post);

    return (
        <main className="min-h-screen bg-[#eef2f7] px-4 py-8 text-slate-900 sm:px-6">
            <div className="mx-auto w-full max-w-[1320px]">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                        一覧へ戻る
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`rounded-full border px-3 py-1 font-bold ${roleClass(post.authorRole)}`}>{post.authorRole}</span>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-bold text-slate-700">{NEWS_TOPIC_LABEL[post.topic]}</span>
                    </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
                    <aside className="xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">要点まとめ</p>
                            <div className="mt-4 space-y-3">
                                {points.map((point, index) => (
                                    <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-[11px] font-bold text-slate-400">POINT {index + 1}</p>
                                        <p className="mt-2 text-sm leading-7 text-slate-700">{point}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>

                    <div className="space-y-5">
                        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                            <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
                                <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                    <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
                                    <span>{post.author}</span>
                                    <span>閲覧 {post.viewCount.toLocaleString()}</span>
                                    <span>コメント {Math.max(post.commentCount, comments.length).toLocaleString()}</span>
                                </div>
                                <h1 className="text-[clamp(30px,4.5vw,50px)] font-black leading-tight text-slate-950">{post.title}</h1>
                                <p className="mt-4 text-[17px] leading-8 text-slate-600">{post.summary}</p>
                                <div className="mt-5">
                                    <NewsArticleActions postId={post.id} initialCheerCount={post.cheerCount} title={post.title} />
                                </div>
                            </div>

                            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-8">
                                <NewsMediaBlocks
                                    title={post.title}
                                    imageUrl={post.imageUrl}
                                    galleryImages={post.galleryImages}
                                    videoUrl={post.videoUrl}
                                />

                                <div className="space-y-6 text-[16px] leading-9 text-slate-800">
                                    {paragraphs.map((paragraph, index) => (
                                        <section key={index} className="space-y-3">
                                            <h2 className="text-xl font-black text-slate-950">Section {String(index + 1).padStart(2, "0")}</h2>
                                            <p className="m-0 whitespace-pre-wrap">{paragraph}</p>
                                        </section>
                                    ))}
                                </div>
                            </div>
                        </article>

                        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Related News</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-950">関連記事</h2>
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {relatedPosts.map((item) => (
                                    <Link key={item.id} href={`/news/${item.id}`} className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50">
                                        <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${roleClass(item.authorRole)}`}>{item.authorRole}</p>
                                        <p className="mt-3 text-base font-black leading-7 text-slate-900">{item.title}</p>
                                        <p className="mt-2 text-sm leading-7 text-slate-600">{excerpt(item.summary || item.body)}</p>
                                        <p className="mt-3 text-xs text-slate-500">{new Date(item.publishedAt).toLocaleString("ja-JP")}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <NewsCommentsPanel postId={post.id} initialCount={Math.max(post.commentCount, comments.length)} canComment={Boolean(user)} />
                    </div>

                    <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
                        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Article Data</p>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                                <p className="m-0">投稿者ロール: {post.authorRole}</p>
                                <p className="m-0">カテゴリ: {NEWS_TOPIC_LABEL[post.topic]}</p>
                                <p className="m-0">投稿日: {new Date(post.publishedAt).toLocaleString("ja-JP")}</p>
                                <p className="m-0">閲覧数: {post.viewCount.toLocaleString()}</p>
                                <p className="m-0">Cheer: {post.cheerCount.toLocaleString()}</p>
                            </div>
                        </section>

                        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">次の行動</p>
                            <div className="mt-4 space-y-3">
                                <Link href="/news" className="block rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                                    News Rooms 一覧へ戻る
                                </Link>
                                <Link href="/discovery" className="block rounded-2xl border border-slate-200 p-4 text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                                    Discovery でユーザーを見る
                                </Link>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}

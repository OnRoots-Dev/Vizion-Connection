import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNewsPostById, getNewsPosts, incrementNewsPostView, NEWS_CATEGORY_LABEL } from "@/lib/news";

function excerpt(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 120);
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
    description: excerpt(post.body),
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getNewsPostById(id);

  if (!post) {
    notFound();
  }

  await incrementNewsPostView(post.id);

  const relatedPosts = (await getNewsPosts())
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#06070b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/75 transition hover:bg-white/[0.08]"
            >
              一覧へ戻る
            </Link>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-200">
              {NEWS_CATEGORY_LABEL[post.category]}
            </span>
          </div>

          <article className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0d1118] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            {post.imageUrl ? (
              <div className="relative h-64 w-full overflow-hidden sm:h-80">
                <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1118] via-[#0d111866] to-transparent" />
              </div>
            ) : null}

            <div className="p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-white/45">
                <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
                <span>閲覧 {post.viewCount.toLocaleString()}</span>
                <span>by {post.author || "運営"}</span>
              </div>
              <h1 className="text-[clamp(28px,4.6vw,48px)] font-black leading-tight text-white">
                {post.title}
              </h1>
              <div className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-white/80">
                {post.body}
              </div>
            </div>
          </article>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">
              Related News
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="h-32 w-full object-cover" />
                  ) : null}
                  <div className="p-4">
                    <p className="text-[11px] font-bold text-cyan-200">{NEWS_CATEGORY_LABEL[item.category]}</p>
                    <p className="mt-2 text-sm font-extrabold text-white">{item.title}</p>
                    <p className="mt-2 text-xs leading-6 text-white/55">{excerpt(item.body)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

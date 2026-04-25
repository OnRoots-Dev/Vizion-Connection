"use client";

export default function StepCareerComplete({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const profileUrl = `/u/${slug}`;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 6</p>
        <h3 className="mt-1 text-xl font-black text-white">完了</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          キャリアページを保存しました。
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
        <p className="text-sm font-black text-emerald-200">キャリアページを保存しました</p>
        <p className="mt-1 text-sm leading-6 text-emerald-100/80">
          公開プロフィールを確認するか、ダッシュボードへ戻れます。
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black"
        >
          公開プロフィールを見る
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-black text-white/80"
        >
          ダッシュボードへ戻る
        </button>
      </div>
    </div>
  );
}

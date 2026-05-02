"use client";

import Image from "next/image";

export default function StepProfileComplete({
  profileData,
  onContinueToCareer,
  onClose,
}: {
  profileData: {
    displayName: string;
    bio: string;
    profileImageUrl: string;
    avatarUrl: string;
    bannerUrl: string;
  };
  onContinueToCareer: () => void;
  onClose: () => void;
}) {
  const hasAnyImage = Boolean(profileData.profileImageUrl || profileData.avatarUrl || profileData.bannerUrl);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Step 3</p>
        <h3 className="mt-1 text-xl font-black text-white">プロフィール完了</h3>
        <p className="mt-2 text-sm leading-6 text-white/70">
          プロフィールを保存しました。
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
        <p className="text-sm font-black text-emerald-200">プロフィールを保存しました</p>
        <p className="mt-1 text-sm leading-6 text-emerald-100/80">
          続けてキャリア登録に進むことも、あとで登録することもできます。
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-black text-white">入力内容</p>

        <div className="mt-4 grid gap-3">
          <SummaryRow label="表示名" value={profileData.displayName || "（未入力）"} />
          <SummaryRow label="ひとこと" value={profileData.bio ? truncate(profileData.bio, 60) : "（未入力）"} />
          <SummaryRow label="画像" value={hasAnyImage ? "アップロード済み" : "未アップロード"} />
        </div>

        {(profileData.profileImageUrl || profileData.avatarUrl || profileData.bannerUrl) ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {profileData.profileImageUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/60">カード画像</p>
                <Image
                  src={profileData.profileImageUrl}
                  alt="カード画像"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                />
              </div>
            ) : null}
            {profileData.avatarUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/60">プロフィール画像</p>
                <Image
                  src={profileData.avatarUrl}
                  alt="プロフィール画像"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                />
              </div>
            ) : null}
            {profileData.bannerUrl ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/60">プロフィールバナー画像</p>
                <Image
                  src={profileData.bannerUrl}
                  alt="プロフィールバナー画像"
                  width={240}
                  height={80}
                  className="h-20 w-60 rounded-2xl border border-white/10 object-cover"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onContinueToCareer}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-black text-black"
        >
          続けてキャリアを登録する
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-black text-white/80"
        >
          あとで登録する
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-xs font-semibold text-white/60">{label}</p>
      <p className="text-sm font-semibold text-white text-right">{value}</p>
    </div>
  );
}

function truncate(v: string, max: number) {
  if (v.length <= max) return v;
  return v.slice(0, max) + "...";
}

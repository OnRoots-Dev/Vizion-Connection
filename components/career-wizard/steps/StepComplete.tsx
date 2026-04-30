"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Pencil } from "lucide-react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { useRouter } from "next/navigation";

export default function StepComplete() {
  const { data, saveError, goToStep, roleColor } = useCareerWizard();
  const color = roleColor();
  const router = useRouter();

  const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Members: "MEMBERS",
    Business: "BUSINESS",
    Admin: "ADMIN",
  };

  const CAREER_VISIBILITY_LABEL: Record<string, string> = {
    public: "全体公開",
    members: "メンバーのみ",
    private: "非公開（下書き）",
  };

  const profileRows = [
    { label: "あなたの役割", value: ROLE_LABEL[data.role] ?? data.role },
    { label: "表示名（アカウント名）", value: data.displayName || data.name },
    { label: "ひとこと", value: data.bio },
    { label: "region（地方）", value: data.region },
    { label: "prefecture（都道府県）", value: data.prefecture },
    { label: "sportsCategory", value: data.sportsCategory },
    { label: "sport", value: data.sportProfile },
    { label: "stance", value: data.stance },
    { label: "Instagram", value: data.instagram },
    { label: "X", value: data.xUrl },
    { label: "TikTok", value: data.tiktok },
    { label: "公開設定", value: data.isPublic ? "公開" : "非公開" },
  ].filter((r) => String(r.value ?? "").trim().length > 0);

  const careerRows = [
    { label: "キャッチコピー", value: data.tagline },
    { label: "活動拠点", value: data.countryName },
    { label: "キャリア自己紹介", value: data.bioCareer },
    {
      label: "実績（数字）",
      value: data.stats
        .filter((s) => (s?.value ?? "").trim().length > 0)
        .map((s) => `${s.label || "実績"}: ${s.value}`)
        .join(" / "),
    },
    {
      label: "エピソード",
      value: data.episodes.length
        ? data.episodes
            .slice(0, 6)
            .map((e) => `${e.period}${e.period && e.role ? " · " : ""}${e.role}`.trim())
            .filter(Boolean)
            .join(" / ")
        : "",
    },
    {
      label: "スキル",
      value: data.skills.length
        ? data.skills
            .slice(0, 12)
            .map((s) => `${s.name}${s.isHighlight ? "★" : ""}`)
            .join(" / ")
        : "",
    },
    { label: "CTAタイトル", value: data.ctaTitle },
    { label: "補足テキスト", value: data.ctaSub },
    { label: "ボタンテキスト", value: data.ctaBtn },
    { label: "X (Twitter)", value: data.snsX },
    { label: "Instagram", value: data.snsInstagram },
    { label: "TikTok", value: data.snsTiktok },
    { label: "公開設定", value: CAREER_VISIBILITY_LABEL[data.visibility] ?? data.visibility },
  ].filter((r) => String(r.value ?? "").trim().length > 0);

  const items = [
    { icon: "💬", label: "キャッチコピー", ok: !!data.tagline },
    { icon: "📝", label: "自己紹介",       ok: !!data.bioCareer },
    { icon: "📅", label: "キャリア年表",   ok: data.episodes.length > 0 },
    { icon: "💪", label: "スキル",         ok: data.skills.length > 0 },
  ];

  return (
    <div className="py-6 text-center">
      <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: `${color}15`, border: `1px solid ${color}44` }}>
        <CheckCircle2 size={30} style={{ color }} />
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="text-[22px] font-extrabold tracking-[-0.03em] mb-2">
        キャリアページが完成！
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
        className="text-[13px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
        プロフィールに反映されました。<br />ダッシュボードからいつでも編集できます。
      </motion.p>
      {saveError && (
        <p className="text-[12px] mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}>
          {saveError}
        </p>
      )}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="flex justify-center gap-2 mb-6 flex-wrap">
        {items.map((it) => (
          <div key={it.label}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px]"
            style={it.ok
              ? { background: `${color}14`, color, border: `1px solid ${color}35` }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span>{it.icon}</span>
            <span className="font-medium">{it.label}</span>
            {it.ok ? <span className="text-[10px]">✓</span> : <span className="text-[10px] opacity-40">未入力</span>}
          </div>
        ))}
      </motion.div>

      <div className="text-left mb-6">
        <div className="mb-3">
          <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>
            プロフィール
          </p>
          <div className="mt-2 rounded-2xl border p-3.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
            <dl className="m-0 grid grid-cols-1 gap-2">
              {profileRows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{r.label}</dt>
                  <dd className="m-0 text-[12px] leading-relaxed text-right" style={{ color: "rgba(255,255,255,0.7)" }}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div>
          <p className="m-0 font-mono text-[9px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.25)" }}>
            キャリア
          </p>
          <div className="mt-2 rounded-2xl border p-3.5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
            <dl className="m-0 grid grid-cols-1 gap-2">
              {careerRows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-3">
                  <dt className="shrink-0 text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>{r.label}</dt>
                  <dd className="m-0 text-[12px] leading-relaxed text-right" style={{ color: "rgba(255,255,255,0.7)" }}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.slug && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            onClick={() => router.push(`/u/${data.slug}`)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] text-white tracking-[0.04em] transition-all hover:brightness-110"
            style={{ background: color }}>
            <ExternalLink size={14} />キャリアページを見る
          </motion.button>
        )}
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
          onClick={() => goToStep(0)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-semibold transition-all"
          style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
          <Pencil size={12} />もう一度編集する
        </motion.button>
      </div>
    </div>
  );
}

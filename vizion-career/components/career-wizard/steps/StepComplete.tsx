"use client";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Pencil } from "lucide-react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { useRouter } from "next/navigation";

export default function StepComplete() {
  const { data, saveError, goToStep, roleColor } = useCareerWizard();
  const color = roleColor();
  const router = useRouter();

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

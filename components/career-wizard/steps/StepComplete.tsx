"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  ExternalLink,
  Hash,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Phone,
  Share2,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
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

  const VISIBILITY_COLOR: Record<string, string> = {
    public: "#4ade80",
    members: "#facc15",
    private: "rgba(255,255,255,0.3)",
  };

  const visColor = VISIBILITY_COLOR[data.visibility] ?? "rgba(255,255,255,0.3)";
  const visLabel = CAREER_VISIBILITY_LABEL[data.visibility] ?? data.visibility;

  const ease = [0.22, 1, 0.36, 1] as const;
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.42, ease },
  });
  const staggerList = {
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const itemFade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
  };

  type CheckItem = { icon: ReactNode; label: string; ok: boolean };
  const checkItems: CheckItem[] = [
    { icon: <Briefcase size={11} />, label: "基本情報", ok: !!(data.displayName || data.name) },
    { icon: <Hash size={11} />, label: "キャッチコピー", ok: !!data.tagline },
    { icon: <Pencil size={11} />, label: "自己紹介", ok: !!data.bioCareer },
    { icon: <Clock size={11} />, label: "キャリア年表", ok: (data.episodes?.length ?? 0) > 0 },
    { icon: <Zap size={11} />, label: "スキル", ok: (data.skills?.length ?? 0) > 0 },
    { icon: <Phone size={11} />, label: "CTA設定", ok: !!data.ctaTitle },
  ];

  function SectionLabel({ text }: { text: string }) {
    return (
      <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] mb-2 px-0.5"
        style={{ color: "rgba(255,255,255,0.2)" }}>
        {text}
      </p>
    );
  }

  function CompletionBar({ items, color }: { items: CheckItem[]; color: string }) {
    const done = items.filter((i) => i.ok).length;
    const pct = Math.round((done / items.length) * 100);

    return (
      <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.24)" }}>
            入力完了度
          </span>
          <span className="text-[14px] font-black tabular-nums" style={{ color }}>
            {pct}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.55, duration: 0.8, ease }}
            style={{ background: color }}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {items.map((it) => (
            <div
              key={it.label}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px]"
              style={it.ok
                ? { background: `${color}12`, color, border: `1px solid ${color}25` }
                : { background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">{it.icon}</span>
              <span className="font-medium flex-1 truncate">{it.label}</span>
              {it.ok ? (
                <span className="text-[10px] font-bold shrink-0">✓</span>
              ) : (
                <span className="text-[9px] opacity-40 shrink-0">未入力</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
      <div className="flex flex-col gap-0.5 p-3 rounded-xl" style={{ background: `${color}10`, border: `1px solid ${color}28` }}>
        <span className="text-[18px] font-black tabular-nums leading-none" style={{ color }}>
          {value}
        </span>
        <span className="text-[10px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.42)" }}>
          {label}
        </span>
      </div>
    );
  }

  type TimelineEpisode = {
    id?: string;
    period?: string;
    role?: string;
    org?: string;
    desc?: string;
    milestone?: string;
    tags?: string[];
    isCurrent?: boolean;
  };

  function TimelineSection({ episodes, color }: { episodes: TimelineEpisode[]; color: string }) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? episodes : episodes.slice(0, 3);
    if (episodes.length === 0) return null;

    return (
      <div>
        <div className="relative pl-5">
          <div className="absolute left-[7px] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="flex flex-col gap-3">
            {visible.map((ep, i) => (
              <motion.div key={ep.id ?? i} variants={itemFade} className="relative">
                <div
                  className="absolute -left-5 top-1 w-3 h-3 rounded-full flex items-center justify-center"
                  style={{
                    background: ep.isCurrent ? color : "rgba(255,255,255,0.12)",
                    border: `1.5px solid ${ep.isCurrent ? color : "rgba(255,255,255,0.18)"}`,
                    boxShadow: ep.isCurrent ? `0 0 8px ${color}60` : "none",
                  }}
                />
                <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      {ep.role ? (
                        <p className="text-[12px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{ep.role}</p>
                      ) : null}
                      {ep.org ? (
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{ep.org}</p>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      {ep.period ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.42)" }}>
                          {ep.period}
                        </span>
                      ) : null}
                      {ep.isCurrent ? (
                        <span className="block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-right" style={{ background: `${color}20`, color }}>
                          現在
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {ep.desc ? (
                    <p className="text-[11px] leading-relaxed mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {ep.desc}
                    </p>
                  ) : null}
                  {ep.milestone ? (
                    <p className="text-[11px] font-medium mt-1.5 pl-2" style={{ color, borderLeft: `2px solid ${color}60` }}>
                      {ep.milestone}
                    </p>
                  ) : null}
                  {ep.tags && ep.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ep.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.38)" }}>
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {episodes.length > 3 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 w-full text-[11px] font-medium py-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {expanded ? "折りたたむ" : `+ ${episodes.length - 3}件を表示`}
          </button>
        ) : null}
      </div>
    );
  }

  type Skill = { name: string; level: number; isHighlight?: boolean };

  function SkillGrid({ skills, color }: { skills: Skill[]; color: string }) {
    if (skills.length === 0) return null;
    const highlights = skills.filter((s) => s.isHighlight);
    const rest = skills.filter((s) => !s.isHighlight);

    return (
      <div className="flex flex-col gap-2">
        {highlights.length > 0 ? (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.2)" }}>
              ★ ハイライト
            </p>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((s) => (
                <span
                  key={s.name}
                  className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                >
                  <Star size={9} />
                  {s.name}
                  <span className="text-[9px] opacity-70">{s.level}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {rest.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rest.map((s) => (
              <span
                key={s.name}
                className="text-[11px] px-2 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {s.name}
                <span className="ml-1 opacity-50">{s.level}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  type RowType = { label: string; value: string };
  function Row({ label, value }: RowType) {
    return (
      <div className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span className="shrink-0 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.3)", minWidth: "72px" }}>
          {label}
        </span>
        <span className="text-[12px] leading-relaxed text-right break-all" style={{ color: "rgba(255,255,255,0.78)" }}>
          {value}
        </span>
      </div>
    );
  }

  type SectionProps = {
    icon: ReactNode;
    title: string;
    color: string;
    rows: RowType[];
    defaultOpen?: boolean;
    stepIndex?: number;
    onEdit?: (step: number) => void;
    accent?: boolean;
  };

  function Section({ icon, title, color, rows, defaultOpen = false, stepIndex, onEdit, accent }: SectionProps) {
    const [open, setOpen] = useState(defaultOpen);
    if (rows.length === 0) return null;

    return (
      <motion.div
        variants={itemFade}
        className="rounded-xl overflow-hidden"
        style={{
          border: accent ? `1px solid ${color}35` : "1px solid rgba(255,255,255,0.07)",
          background: accent ? `${color}08` : "rgba(255,255,255,0.022)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 gap-3 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: `${color}1a`, color }}>
              {icon}
            </span>
            <span className="text-[12px] font-semibold truncate" style={{ color: "rgba(255,255,255,0.82)" }}>
              {title}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums" style={{ background: `${color}1a`, color }}>
              {rows.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && stepIndex !== undefined ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(stepIndex);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    onEdit(stepIndex);
                  }
                }}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors"
                style={{ color: "rgba(255,255,255,0.28)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                編集
              </span>
            ) : null}
            <span style={{ color: "rgba(255,255,255,0.2)" }}>{open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease }}
              style={{ overflow: "hidden" }}
            >
              <div className="px-3.5 pb-3.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="mt-2">{rows.map((r) => <Row key={r.label} label={r.label} value={r.value} />)}</div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    );
  }

  const stats = (data.stats ?? []).filter((s) => (s?.value ?? "").trim().length > 0);
  const episodes = (data.episodes ?? []) as unknown as TimelineEpisode[];
  const skills = (data.skills ?? []) as unknown as Skill[];

  const profileStepIndex = 1;
  const profileMediaStepIndex = 2;
  const careerBasicStepIndex = 3;
  const careerBioStepIndex = 5;
  const careerEpisodesStepIndex = 8;
  const careerSkillsStepIndex = 9;
  const careerCtaStepIndex = 10;
  const careerMediaStepIndex = 11;

  const profileSections: SectionProps[] = [
    {
      icon: <Briefcase size={12} />,
      title: "基本情報",
      color,
      defaultOpen: true,
      stepIndex: profileStepIndex,
      onEdit: goToStep,
      accent: true,
      rows: [
        { label: "役割", value: ROLE_LABEL[data.role] ?? data.role },
        { label: "表示名", value: data.displayName || data.name },
        { label: "ひとこと", value: data.bio },
        { label: "公開設定", value: data.isPublic ? "公開" : "非公開" },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <MapPin size={12} />,
      title: "活動エリア",
      color,
      stepIndex: profileStepIndex,
      onEdit: goToStep,
      rows: [
        { label: "地方", value: data.region },
        { label: "都道府県", value: data.prefecture },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <Trophy size={12} />,
      title: "競技・活動",
      color,
      stepIndex: profileStepIndex,
      onEdit: goToStep,
      rows: [
        { label: "競技カテゴリ", value: data.sportsCategory },
        { label: "競技", value: data.sportProfile },
        { label: "スタンス", value: data.stance },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <Share2 size={12} />,
      title: "SNS",
      color,
      stepIndex: profileStepIndex,
      onEdit: goToStep,
      rows: [
        { label: "Instagram", value: data.instagram },
        { label: "X", value: data.xUrl },
        { label: "TikTok", value: data.tiktok },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <ImageIcon size={12} />,
      title: "画像",
      color,
      stepIndex: profileMediaStepIndex,
      onEdit: goToStep,
      rows: [
        { label: "プロフィール画像", value: data.profileImageUrl ? "設定済み" : "" },
        { label: "アバター", value: data.avatarUrl ? "設定済み" : "" },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
  ];

  const careerSections: SectionProps[] = [
    {
      icon: <Briefcase size={12} />,
      title: "基本プロフィール",
      color,
      defaultOpen: true,
      stepIndex: careerBasicStepIndex,
      onEdit: goToStep,
      accent: true,
      rows: [
        { label: "キャッチコピー", value: data.tagline },
        { label: "活動拠点", value: data.countryName },
        { label: "自己紹介", value: data.bioCareer },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <Pencil size={12} />,
      title: "自己紹介",
      color,
      stepIndex: careerBioStepIndex,
      onEdit: goToStep,
      rows: [{ label: "キャリア自己紹介", value: data.bioCareer }].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <Clock size={12} />,
      title: "キャリア年表",
      color,
      stepIndex: careerEpisodesStepIndex,
      onEdit: goToStep,
      rows: data.episodes.length
        ? data.episodes
            .slice(0, 6)
            .map((e) => ({ label: e.period || "期間", value: `${e.role ?? ""}${e.org ? ` · ${e.org}` : ""}`.trim() }))
            .filter((r) => String(r.value ?? "").trim().length > 0)
        : [],
    },
    {
      icon: <Zap size={12} />,
      title: "スキル・強み",
      color,
      stepIndex: careerSkillsStepIndex,
      onEdit: goToStep,
      rows: data.skills.length
        ? data.skills
            .slice(0, 10)
            .map((s) => ({ label: s.name, value: `${s.level}${s.isHighlight ? " ★" : ""}` }))
        : [],
    },
    {
      icon: <Phone size={12} />,
      title: "SNS・コンタクト",
      color,
      stepIndex: careerCtaStepIndex,
      onEdit: goToStep,
      rows: [
        { label: "CTAタイトル", value: data.ctaTitle },
        { label: "補足テキスト", value: data.ctaSub },
        { label: "ボタン", value: data.ctaBtn },
        { label: "X (Twitter)", value: data.snsX },
        { label: "Instagram", value: data.snsInstagram },
        { label: "TikTok", value: data.snsTiktok },
        { label: "公開設定", value: visLabel },
      ].filter((r) => String(r.value ?? "").trim().length > 0),
    },
    {
      icon: <ImageIcon size={12} />,
      title: "キャリア画像",
      color,
      stepIndex: careerMediaStepIndex,
      onEdit: goToStep,
      rows: [{ label: "キャリア画像", value: data.careerImageUrl ? "設定済み" : "" }].filter((r) => String(r.value ?? "").trim().length > 0),
    },
  ];

  return (
    <div className="py-4 pb-10 flex flex-col gap-0">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          className="relative w-[72px] h-[72px] mx-auto mb-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease }}
            className="absolute inset-[-8px] rounded-full"
            style={{ background: `radial-gradient(circle, ${color}18 0%, transparent 70%)` }}
          />
          <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${color}28` }} />
          <div className="absolute inset-[6px] rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `1.5px solid ${color}45` }}>
            <CheckCircle2 size={28} style={{ color }} />
          </div>
        </motion.div>

        <motion.h2 {...fadeUp(0.08)} className="text-[22px] font-black tracking-[-0.035em] mb-2">
          キャリアページが完成！
        </motion.h2>

        <motion.p {...fadeUp(0.16)} className="text-[12.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.36)" }}>
          プロフィールに反映されました。<br />
          ダッシュボードからいつでも編集できます。
        </motion.p>

        <motion.div {...fadeUp(0.22)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: `${visColor}14`, color: visColor, border: `1px solid ${visColor}32` }}>
          <Eye size={11} />
          <span className="text-[11px] font-semibold">{visLabel}</span>
        </motion.div>
      </div>

      {saveError ? (
        <motion.p {...fadeUp(0)} className="text-[12px] mb-4 px-3 py-2.5 rounded-xl" style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.3)" }}>
          {saveError}
        </motion.p>
      ) : null}

      <motion.div {...fadeUp(0.26)} className="mb-5">
        <CompletionBar items={checkItems} color={color} />
      </motion.div>

      {stats.length > 0 ? (
        <motion.div {...fadeUp(0.32)} className="mb-5">
          <SectionLabel text="数字で語る実績" />
          <div className="grid grid-cols-2 gap-2">
            {stats.map((s, i) => (
              <StatCard key={`${s.label}-${i}`} label={s.label || "実績"} value={s.value} color={color} />
            ))}
          </div>
        </motion.div>
      ) : null}

      {(episodes.length ?? 0) > 0 ? (
        <motion.div {...fadeUp(0.36)} className="mb-5">
          <SectionLabel text="キャリア年表" />
          <motion.div variants={staggerList} initial="initial" animate="animate">
            <TimelineSection episodes={episodes} color={color} />
          </motion.div>
        </motion.div>
      ) : null}

      {(skills.length ?? 0) > 0 ? (
        <motion.div {...fadeUp(0.40)} className="mb-5">
          <SectionLabel text="スキル・強み" />
          <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <SkillGrid skills={skills} color={color} />
          </div>
        </motion.div>
      ) : null}

      <motion.div {...fadeUp(0.44)} className="mb-5">
        <SectionLabel text="プロフィール" />
        <motion.div variants={staggerList} initial="initial" animate="animate" className="flex flex-col gap-1.5">
          {profileSections.map((s) => (
            <Section key={s.title} {...s} />
          ))}
        </motion.div>
      </motion.div>

      <motion.div {...fadeUp(0.50)} className="mb-6">
        <SectionLabel text="キャリア" />
        <motion.div variants={staggerList} initial="initial" animate="animate" className="flex flex-col gap-1.5">
          {careerSections.map((s) => (
            <Section key={s.title} {...s} />
          ))}
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-2">
        {data.slug ? (
          <motion.button
            {...fadeUp(0.56)}
            onClick={() => router.push(`/u/${data.slug}`)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] text-white tracking-[0.03em] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: color }}
          >
            <ExternalLink size={14} />
            キャリアページを見る
            <ArrowRight size={13} className="ml-0.5 opacity-70" />
          </motion.button>
        ) : null}

        <motion.button
          {...fadeUp(0.60)}
          onClick={() => goToStep(profileStepIndex)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.98]"
          style={{ color: "rgba(255,255,255,0.38)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(255,255,255,0.38)";
          }}
        >
          <Pencil size={12} />
          もう一度編集する
        </motion.button>
      </div>
    </div>
  );
}

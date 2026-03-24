"use client";
// components/career-wizard/WizardUI.tsx
// Tailwind only（shadcn/ui不要）

import { motion } from "framer-motion";
import { useCareerWizard } from "@/hooks/useCareerWizard";

export function StepWrapper({ children }: { children: React.ReactNode }) {
  return <div className="pt-1 pb-6">{children}</div>;
}

export function StepHeader({ eyebrow, title, hint }: {
  eyebrow: string; title: string; hint?: string;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <div className="mb-5">
      <p className="font-mono text-[9px] tracking-[0.28em] uppercase mb-1.5" style={{ color }}>
        {eyebrow}
      </p>
      <h2 className="text-[21px] font-extrabold tracking-[-0.03em] leading-tight text-white mb-1.5">
        {title}
      </h2>
      {hint && (
        <p className="text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Field({ label, children, className }: {
  label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`mb-3.5 ${className ?? ""}`}>
      <p className="font-mono text-[8.5px] tracking-[0.22em] uppercase mb-1.5"
        style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

export function WizardInput({ value, onChange, placeholder, maxLength, type = "text", disabled }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; type?: string; disabled?: boolean;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <input
      type={type} value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength} disabled={disabled}
      className="w-full rounded-xl px-4 py-3 text-[14px] text-white outline-none transition-all disabled:opacity-30"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onFocus={(e) => { e.target.style.borderColor = `${color}55`; e.target.style.background = `${color}05`; }}
      onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; e.target.style.background = "rgba(255,255,255,0.03)"; }}
    />
  );
}

export function WizardTextarea({ value, onChange, placeholder, rows = 4, maxLength }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; maxLength?: number;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  const len = value.length;
  const max = maxLength ?? 9999;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder={placeholder} rows={rows}
        className="w-full rounded-xl px-4 py-3 text-[14px] text-white outline-none resize-none leading-relaxed transition-all"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        onFocus={(e) => { e.target.style.borderColor = `${color}55`; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.07)"; }}
      />
      {maxLength && (
        <p className="text-right font-mono text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          <span style={{ color: len > max * 0.85 ? color : undefined }}>{len}</span>/{max}
        </p>
      )}
    </div>
  );
}

export function WizardSelect({ value, onChange, children }: {
  value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-[14px] text-white outline-none appearance-none cursor-pointer transition-all"
      style={{
        background: "#0d0d1a",
        border: "1px solid rgba(255,255,255,0.07)",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.3)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
        paddingRight: "36px",
      }}
      onFocus={(e) => (e.target.style.borderColor = `${color}55`)}
      onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
    >
      {children}
    </select>
  );
}

export function Chip({ label, selected, onClick }: {
  label: string; selected: boolean; onClick: () => void;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.93 }}
      className="font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border transition-all select-none"
      style={selected
        ? { background: `${color}18`, borderColor: `${color}55`, color }
        : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.38)" }
      }>
      {label}
    </motion.button>
  );
}

export function HintBullets({ items }: { items: string[] }) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <div className="mb-3.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.28)" }}>書くと良い内容</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: `${color}99` }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EpisodeTips({ tips }: { tips: { icon: string; text: string }[] }) {
  return (
    <div className="mb-3.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(255,255,255,0.22)" }}>ヒント</p>
      <ul className="flex flex-col gap-1.5">
        {tips.map((t) => (
          <li key={t.text} className="flex items-start gap-2 text-[11.5px]" style={{ color: "rgba(255,255,255,0.38)" }}>
            <span className="flex-shrink-0 text-[13px]">{t.icon}</span>
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SkillSlider({ name, level, isHighlight, onLevelChange, onToggleHighlight, onRemove }: {
  name: string; level: number; isHighlight?: boolean;
  onLevelChange: (v: number) => void;
  onToggleHighlight: () => void;
  onRemove?: () => void;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <div className="mb-3 group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleHighlight}
            className="w-4 h-4 rounded-full border-[1.5px] transition-all flex-shrink-0 flex items-center justify-center"
            style={isHighlight ? { background: "#FFD600", borderColor: "#FFD600" } : { background: "transparent", borderColor: "rgba(255,255,255,0.2)" }}
            title={isHighlight ? "ハイライト解除" : "ハイライトとしてマーク"}>
            {isHighlight && (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
            )}
          </button>
          <span className="font-mono text-[10.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>{name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tabular-nums w-6 text-right" style={{ color: "rgba(255,255,255,0.25)" }}>{level}</span>
          {onRemove && (
            <button type="button" onClick={onRemove}
              className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center transition-all"
              style={{ color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="relative h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full pointer-events-none transition-all duration-150"
          style={{
            width: `${level}%`,
            background: isHighlight
              ? "linear-gradient(90deg, #FFD600, rgba(255,214,0,0.35))"
              : `linear-gradient(90deg, ${color}, ${color}40)`,
          }} />
        <input type="range" min={0} max={100} value={level} step={5}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "100%" }} />
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  const color = useCareerWizard((s) => s.roleColor());
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
      <div className="relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0"
        style={{ background: checked ? color : "rgba(255,255,255,0.1)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: checked ? "calc(100% - 18px)" : "2px" }} />
      </div>
      <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
    </button>
  );
}

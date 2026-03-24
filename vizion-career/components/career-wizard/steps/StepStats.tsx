"use client";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { ROLE_CONFIG } from "@/types/career";
import type { UserRole } from "@/types/career";
import { StepWrapper, StepHeader, WizardInput } from "../WizardUI";

export default function StepStats() {
  const { data, setStat, roleColor } = useCareerWizard();
  const color = roleColor();
  const cfg = ROLE_CONFIG[(data.role || "Athlete") as UserRole];
  const DOT: Record<string, string> = { gold: "#FFD600", role: color, default: "rgba(255,255,255,0.35)" };

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 5 / 8" title="数字で語る実績"
        hint="ヒーローセクションに大きく表示されます。空欄はスキップされます。" />
      {data.stats.map((stat, i) => {
        const tmpl = cfg.stats[i];
        const isAuto = stat.color === "gold";
        return (
          <div key={i} className="mb-3 p-3.5 rounded-2xl border"
            style={isAuto
              ? { background: "rgba(255,214,0,0.04)", borderColor: "rgba(255,214,0,0.15)" }
              : { background: "rgba(255,255,255,0.025)", borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DOT[stat.color] }} />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
                {isAuto ? "🌟 自動取得（Cheer数）" : `数値 ${i + 1}`}
              </span>
            </div>
            <p className="text-[11px] mb-2.5" style={{ color: "rgba(255,255,255,0.3)" }}>{tmpl?.hint}</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-mono text-[8.5px] tracking-[0.18em] uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>数値</p>
                <WizardInput value={isAuto ? "自動" : stat.value}
                  onChange={(v) => setStat(i, "value", v)}
                  placeholder={tmpl?.placeholder ?? ""} disabled={isAuto} />
              </div>
              <div>
                <p className="font-mono text-[8.5px] tracking-[0.18em] uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>ラベル</p>
                <WizardInput value={stat.label}
                  onChange={(v) => setStat(i, "label", v)}
                  placeholder={tmpl?.label ?? ""} disabled={isAuto} />
              </div>
            </div>
          </div>
        );
      })}
    </StepWrapper>
  );
}

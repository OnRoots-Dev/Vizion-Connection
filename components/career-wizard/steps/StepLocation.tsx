"use client";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCareerWizard } from "@/hooks/useCareerWizard";
import { COUNTRIES, COUNTRIES_BY_REGION, getCountryByCode } from "@/lib/countries";
import { StepWrapper, StepHeader, Field, WizardInput } from "../WizardUI";

export default function StepLocation() {
  const { data, setField, roleColor } = useCareerWizard();
  const color = roleColor();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selected = getCountryByCode(data.countryCode);

  const filtered = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.nameJa.includes(q) || c.code.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const handleSelect = (code: string, nameJa: string) => {
    setField("countryCode", code);
    setField("countryName", nameJa);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <StepWrapper>
      <StepHeader eyebrow="Step 3 / 8" title="活動拠点"
        hint="現在の活動国・地域を選んでください" />

      <Field label="活動国">
        <div className="relative">
          <button type="button" onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] text-white text-left transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${isOpen ? `${color}55` : "rgba(255,255,255,0.07)"}`,
            }}>
            <span className="text-xl">{selected?.flag ?? "🌐"}</span>
            <span className="flex-1">{selected?.nameJa ?? "選択してください"}</span>
            <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{selected?.code}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.3)" strokeWidth="2"
              style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 0.2s" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 z-20 rounded-xl overflow-hidden shadow-2xl"
                style={{ background: "#101020", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="国名で検索..."
                    className="flex-1 bg-transparent text-[13px] text-white outline-none"
                    style={{ color: "white" }}
                    onFocus={(e) => e.target.setAttribute("placeholder", "例：Japan / 日本 / JP")}
                    onBlur={(e) => e.target.setAttribute("placeholder", "国名で検索...")} />
                </div>
                <div className="max-h-[220px] overflow-y-auto">
                  {filtered ? (
                    filtered.length > 0
                      ? filtered.map((c) => (
                        <button key={c.code} type="button" onClick={() => handleSelect(c.code, c.nameJa)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{ background: data.countryCode === c.code ? `${color}10` : "transparent" }}
                          onMouseEnter={(e) => { if (data.countryCode !== c.code) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                          onMouseLeave={(e) => { if (data.countryCode !== c.code) e.currentTarget.style.background = "transparent"; }}>
                          <span className="text-lg leading-none">{c.flag}</span>
                          <span className="flex-1 text-[13px]" style={{ color: "rgba(255,255,255,0.8)" }}>{c.nameJa}</span>
                          <span className="font-mono text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{c.name}</span>
                          {data.countryCode === c.code && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          )}
                        </button>
                      ))
                      : <p className="px-4 py-3 text-[12px] text-center" style={{ color: "rgba(255,255,255,0.3)" }}>見つかりません</p>
                  ) : (
                    Object.entries(COUNTRIES_BY_REGION).map(([region, countries]) => (
                      <div key={region}>
                        <p className="px-3 py-1.5 font-mono text-[8px] tracking-[0.22em] uppercase"
                          style={{ color: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.02)" }}>
                          {region}
                        </p>
                        {countries.map((c) => (
                          <button key={c.code} type="button" onClick={() => handleSelect(c.code, c.nameJa)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                            style={{ background: data.countryCode === c.code ? `${color}10` : "transparent" }}
                            onMouseEnter={(e) => { if (data.countryCode !== c.code) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                            onMouseLeave={(e) => { if (data.countryCode !== c.code) e.currentTarget.style.background = "transparent"; }}>
                            <span className="text-lg leading-none">{c.flag}</span>
                            <span className="flex-1 text-[13px]" style={{ color: "rgba(255,255,255,0.8)" }}>{c.nameJa}</span>
                            {data.countryCode === c.code && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Field>

      {/* 都市・地域（JP選択時は都道府県ヒント） */}
      {data.existingRegion && (
        <p className="text-[11px] mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          プロフィール登録済み地域: <span style={{ color: "rgba(255,255,255,0.55)" }}>{data.existingRegion}</span>
        </p>
      )}
    </StepWrapper>
  );
}

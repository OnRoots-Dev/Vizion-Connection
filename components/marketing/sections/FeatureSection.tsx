"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { EditorialSection, EditorialHeading, TypographyBand } from "@/lib/design/editorial";

// ─── Editorial Feature Narratives ─────────────────────────────────────────────

const FEATURE_NARRATIVES = [
  {
    label: "DAY 0",
    title: "挑戦のはじまりを、宣言する。",
    description: "DAY 0宣言は、あなたがその日から挑戦を始めた証。努力はその瞬間から記録になり、積み重ねは存在感になる。",
  },
  {
    label: "TIMELINE",
    title: "続けてきた事実が、証明になる。",
    description: "日々の活動が時系列で積み上がる。言葉ではなく、実際に続けてきた記録があなたのプロフィールになる。",
  },
  {
    label: "CONNECTION",
    title: "応援が、つながりになる。",
    description: "Cheerとコメントが選手に届く。応援が記録として残り、アスリートの継続を支える新しいかたち。",
  },
];

export function FeatureSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <EditorialSection background="surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <EditorialHeading label="HOW IT WORKS">
          続ける力を、武器にする。
        </EditorialHeading>
      </motion.div>

      {/* Typography band as visual anchor */}
      <TypographyBand
        text="積み重ねが、見える。"
        size="lg"
        align="center"
      />

      {/* Editorial narratives - not cards */}
      <div className="mt-20 md:mt-24 space-y-16 md:space-y-24">
        {FEATURE_NARRATIVES.map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="border-t border-white/10 pt-12 md:pt-16 first:border-t-0"
          >
            <div className="max-w-3xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30 mb-4">
                {feature.label}
              </p>
              <h3 className="font-[family-name:var(--font-bebas)] text-[clamp(28px,5vw,42px)] font-normal tracking-wide text-white leading-[1.15] mb-6">
                {feature.title}
              </h3>
              <p className="text-[15px] md:text-[16px] leading-[1.9] text-white/60">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </EditorialSection>
  );
}

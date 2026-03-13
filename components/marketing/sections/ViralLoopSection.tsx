"use client";

import { MockupPlaceholder } from "../../ui";

export function ViralLoopSection() {
  return (
    <section className="mt-16 border border-white/10 bg-white/[0.03] p-8">
      <p className="font-display text-[11px] uppercase tracking-[0.45em] text-[#FFD600]">
        How it spreads
      </p>
      <h3 className="mt-3 font-display text-[28px] md:text-[34px] font-black uppercase tracking-tight text-white">
        カードが、拡散の起点になる。
      </h3>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          { t: "① カード作成", d: "役割と信頼を1枚に圧縮" },
          { t: "② SNS共有", d: "URLを貼るだけでプロフィールカードを共有" },
          { t: "③ Cheerが積み上がる", d: "応援の履歴が信頼になる" },
          { t: "④ Discoveryで見つかる", d: "偶然ではなく構造で接続" },
        ].map((x, i) => (
          <div key={i} className="border border-white/10 bg-black/20 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{x.t}</p>
            <p className="mt-2 text-sm text-white/55">{x.d}</p>
          </div>
        ))}
      </div>

      {/* <div className="mt-6">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
          OG Preview (example)
        </div>
        <MockupPlaceholder className="h-40 w-full" label="OG CARD PREVIEW IMAGE" />
      </div> */}
    </section>
  );
}

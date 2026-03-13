// components/marketing/sections/FAQSectionLight.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BUSINESS_FAQ = [
    { q: "決済方法は？", a: "Square のセキュアな決済ページにてクレジットカードでお支払いいただけます。" },
    { q: "先行特典の詳細は？", a: "先行登録期間内に購入した企業は、正式版リリース後3ヶ月間、同プランを1ヶ月料金で利用可能です。" },
    { q: "キャンセルはできますか？", a: "先行登録期間中のキャンセルはご対応が難しい場合がございます。ご不明な点はお問い合わせください。" },
    { q: "Business アカウントが必要ですか？", a: "はい。Business ロールで先行登録後、checkout ページよりお申し込みください。" },
    { q: "紹介制度はありますか？", a: "はい。Businessアカウントを紹介して実際に登録・決済が完了した場合、決済金額の15%をポイントとして還元します（先行期間中は手動対応）。" },
];

function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
            style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-4 py-6 text-left"
            >
                <span className="text-sm font-semibold leading-snug" style={{ color: "#1d1d1f" }}>
                    {q}
                </span>
                <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex-shrink-0 text-xl leading-none font-light"
                    style={{ color: "#007aff" }}
                >
                    +
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-sm leading-relaxed" style={{ color: "#6e6e73" }}>
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function FAQSectionLight() {
    return (
        <section className="space-y-6">
            <div className="space-y-2">
                <p className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: "rgba(0,0,0,0.25)" }}>
                    FAQ
                </p>
                <h2 className="text-2xl font-black" style={{ color: "#1d1d1f" }}>よくある質問</h2>
            </div>

            <div>
                {BUSINESS_FAQ.map((item, i) => (
                    <FAQItem key={i} q={item.q} a={item.a} delay={i * 0.06} />
                ))}
            </div>

            <p className="text-xs pt-2" style={{ color: "rgba(0,0,0,0.3)" }}>
                その他のご質問は{" "}
                <a href="/contact"
                    className="underline-offset-2 hover:underline"
                    style={{ color: "#007aff" }}>
                    Contact
                </a>{" "}
                ページからお問い合わせください。
            </p>
        </section>
    );
}
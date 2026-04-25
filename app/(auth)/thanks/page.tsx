// app/(auth)/thanks/page.tsx

import Link from "next/link";
import { motion } from "framer-motion";

interface Props {
    searchParams: Promise<{ type?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
    const { type } = await searchParams;

    const content = {
        verify: {
            icon: "✉️",
            title: "メールを確認してください",
            desc: "認証メールを送信しました。",
            sub: null,
            cta: null,
        },
        verified: {
            icon: "✅",
            title: "認証完了！",
            desc: "メール認証が完了しました。ログインしてダッシュボードへ進んでください。",
            sub: null,
            cta: { href: "/login", label: "ログインする" },
        },
        business: {
            icon: "🎯",
            title: "申し込みありがとうございます",
            desc: "Businessポジションへのお申し込みを受け付けました。決済完了後にご連絡いたします。",
            sub: null,
            cta: { href: "/dashboard", label: "ダッシュボードへ" },
        },
    }[type ?? "verify"] ?? {
        icon: "✉️",
        title: "メールを確認してください",
        desc: "認証メールを送信しました。",
        sub: null,
        cta: null,
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: "#07070e" }}>

            <Link href="/" className="mb-12 tracking-[0.2em] text-sm font-bold text-white/60 hover:text-white transition-colors uppercase">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-12 w-auto" />
            </Link>

            <motion.div
                className="w-full max-w-sm text-center space-y-6"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto"
                    style={{ background: "#111118", border: "1.5px solid #1e1e2a" }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                >
                    {content.icon}
                </motion.div>

                <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
                >
                    <h1 className="text-xl font-bold text-white">{content.title}</h1>
                    <p className="text-sm text-white/50 leading-relaxed">{content.desc}</p>
                    {content.sub && (
                        <p className="text-xs text-white/30">{content.sub}</p>
                    )}
                </motion.div>

                {content.cta && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
                    >
                        <Link
                            href={content.cta.href}
                            className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold transition-all"
                            style={{
                                background: "#a78bfa",
                                color: "#000",
                                boxShadow: "0 0 24px rgba(167,139,250,0.4)",
                            }}
                        >
                            {content.cta.label}
                        </Link>
                    </motion.div>
                )}

                <p className="text-xs text-white/20 pt-2">
                    <Link href="/" className="hover:text-white/40 transition-colors">
                        トップに戻る
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
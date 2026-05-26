// app/(auth)/thanks/page.tsx

import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

function StatusIcon({ type }: { type: "verify" | "verified" | "business" }) {
    if (type === "verify") {
        return (
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M5.5 7.5 12 12.5l6.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (type === "verified") {
        return (
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="m8.5 12 2.3 2.3 4.7-5.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    return (
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.5 19 7.5v5.2c0 3.7-2.5 6.4-7 7.8-4.5-1.4-7-4.1-7-7.8V7.5l7-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

interface Props {
    searchParams: Promise<{ type?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
    const { type } = await searchParams;
    const verifySub = (
        <div className="mx-auto flex max-w-[320px] flex-col gap-3 pt-3 pb-2 text-left text-[11px] leading-relaxed text-white/30">
            <p className="m-0">
                メールが届かない場合は、
                <br />
                迷惑メールフォルダ・プロモーションタブをご確認ください。
            </p>
            <p className="m-0">
                <span className="inline-block rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[12px] tracking-[0.04em] text-white/55">
                    {env.FROM_EMAIL}
                </span>
                <br />
                を受信できるよう設定をご確認ください。
            </p>
        </div>
    );

    const content = {
        verify: {
            iconType: "verify" as const,
            title: "アカウント作成完了しました。",
            desc: "認証メールを開いて本登録してください。\nメール内のリンクを開くことで、本登録が完了します。",
            sub: verifySub,
            cta: null,
        },
        verified: {
            iconType: "verified" as const,
            title: "認証完了！",
            desc: "メール認証が完了しました。ログインしてダッシュボードへ進んでください。",
            sub: null,
            cta: { href: "/login", label: "ログインする" },
        },
        business: {
            iconType: "business" as const,
            title: "申し込みありがとうございます",
            desc: "Businessポジションへのお申し込みを受け付けました。決済完了後にご連絡いたします。",
            sub: null,
            cta: { href: "/dashboard", label: "ダッシュボードへ" },
        },
    }[type ?? "verify"] ?? {
        iconType: "verify" as const,
        title: "アカウント作成完了しました。",
        desc: "認証メールを開いて本登録してください。\nメール内のリンクを開くことで、本登録が完了します。",
        sub: verifySub,
        cta: null,
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: "#07070e" }}>

            <a href={MARKETING_HOME_URL} title="Vizion Connection" className="mb-12 tracking-[0.2em] text-sm font-bold text-white/60 hover:text-white transition-colors uppercase">
                <Image
                    src="/images/Vizion_Connection_logo-wt.png"
                    alt="Logo"
                    width={420}
                    height={96}
                    priority
                    className="h-[96px] w-auto"
                />
            </a>

            <div className="w-full max-w-sm text-center space-y-6">
                <div
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl"
                    style={{
                        background: "linear-gradient(145deg, rgba(167,139,250,0.18), rgba(255,255,255,0.04))",
                        border: "1.5px solid rgba(167,139,250,0.28)",
                        boxShadow: "0 0 36px rgba(167,139,250,0.16)",
                        color: "#d6c7ff",
                    }}
                >
                    <StatusIcon type={content.iconType} />
                </div>

                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-white">{content.title}</h1>
                    <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{content.desc}</p>
                    {content.sub && (
                        <div>{content.sub}</div>
                    )}
                </div>

                {content.cta && (
                    <div>
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
                    </div>
                )}

                <p className="pt-2">
                    <a
                        href={MARKETING_HOME_URL}
                        className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2 text-xs font-medium text-white/45 no-underline transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70"
                    >
                        トップに戻る
                    </a>
                </p>
            </div>
        </div>
    );
}

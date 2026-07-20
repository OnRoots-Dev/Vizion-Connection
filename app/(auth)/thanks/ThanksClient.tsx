// app/(auth)/thanks/ThanksClient.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { AuthAmbientBg } from "@/components/auth/AuthAmbientBg";
import { AuthIconBadge } from "@/components/auth/AuthStatusMotion";
import { springDefault, springSnap, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

type ThanksKind = "verify" | "verified" | "email_changed" | "business";

interface Content {
  iconType: "verify" | "verified" | "business";
  eyebrow: string;
  title: string;
  desc: string;
  showMailHelp: boolean;
  cta: { href: string; label: string } | null;
}

function resolveContent(type: string | undefined): Content {
  const map: Record<ThanksKind, Content> = {
    verify: {
      iconType: "verify",
      eyebrow: "CHECK YOUR INBOX",
      title: "メールを確認してください",
      desc: "ご登録のメールアドレスに認証リンクを送りました。リンクを開くと本登録が完了し、Pulse を始められます。",
      showMailHelp: true,
      cta: null,
    },
    verified: {
      iconType: "verified",
      eyebrow: "VERIFIED",
      title: "認証が完了しました",
      desc: "ようこそ Vizion Connection へ。つづいてプロフィールを整え、最初の一歩を記録しましょう。",
      showMailHelp: false,
      cta: { href: "/onboarding", label: "オンボーディングへ進む" },
    },
    email_changed: {
      iconType: "verified",
      eyebrow: "EMAIL UPDATED",
      title: "メールアドレスを更新しました",
      desc: "新しいメールアドレスでのログインが有効になりました。必要ならログイン画面から続けてください。",
      showMailHelp: false,
      cta: { href: "/login", label: "ログインする" },
    },
    business: {
      iconType: "business",
      eyebrow: "BUSINESS",
      title: "お申し込みありがとうございます",
      desc: "Business ポジションへのお申し込みを受け付けました。決済完了後、ご案内をお送りします。",
      showMailHelp: false,
      cta: { href: "/dashboard", label: "ダッシュボードへ" },
    },
  };

  if (type && type in map) return map[type as ThanksKind];
  return map.verify;
}

export default function ThanksClient({
  type,
  fromEmail,
}: {
  type?: string;
  fromEmail: string;
}) {
  const reduce = useReducedMotion();
  const content = resolveContent(type);
  const press = reduce ? undefined : { scale: PRESS_SCALE };
  const enter = reduce ? fadeReduced : springDefault;

  return (
    <div className="vc-auth-shell">
      <AuthAmbientBg />

      <a
        href={MARKETING_HOME_URL}
        title="Vizion Connection"
        className="relative z-10 mb-8 inline-block active:scale-[0.97] transition-transform duration-100"
      >
        <Image
          src="/images/Vizion_Connection_logo-wt.png"
          alt="Vizion Connection"
          width={320}
          height={86}
          priority
          className="inline-block h-[4.5rem] w-auto sm:h-20"
        />
      </a>

      <motion.div
        className="relative z-10 w-full max-w-md rounded-[28px] border border-white/[0.08] px-6 py-8 sm:px-8 sm:py-9"
        style={{
          background: "rgba(10,10,10,0.72)",
          backdropFilter: reduce ? "none" : "blur(24px) saturate(160%)",
          WebkitBackdropFilter: reduce ? "none" : "blur(24px) saturate(160%)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        }}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduce ? fadeReduced : springSnap}
      >
        <div className="space-y-6 text-center">
          <AuthIconBadge kind={content.iconType} />

          <motion.div
            className="space-y-2.5"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? fadeReduced : { ...enter, delay: 0.06 }}
          >
            <p
              className="m-0 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--electric)", fontFamily: "monospace" }}
            >
              {content.eyebrow}
            </p>
            <h1 className="m-0 text-[1.35rem] font-bold tracking-[-0.02em] text-white sm:text-2xl">
              {content.title}
            </h1>
            <p className="m-0 text-sm leading-relaxed text-white/50">{content.desc}</p>
          </motion.div>

          {content.showMailHelp && (
            <motion.div
              className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? fadeReduced : { ...enter, delay: 0.1 }}
            >
              <p className="m-0 text-[11px] leading-relaxed text-white/40">
                メールが届かない場合は、迷惑メールフォルダやプロモーションタブをご確認ください。
              </p>
              <div>
                <p className="m-0 mb-1.5 text-[10px] uppercase tracking-[0.16em] text-white/25">
                  From
                </p>
                <p className="m-0 inline-block rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[12px] tracking-[0.02em] text-white/70">
                  {fromEmail}
                </p>
                <p className="m-0 mt-2 text-[11px] leading-relaxed text-white/35">
                  上記アドレスを受信できるよう、メール設定をご確認ください。
                </p>
              </div>
            </motion.div>
          )}

          {content.cta && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? fadeReduced : { ...enter, delay: 0.12 }}
            >
              <Link href={content.cta.href} className="block">
                <motion.span
                  whileTap={press}
                  transition={springDefault}
                  className="inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-black"
                  style={{
                    background: "var(--electric)",
                    boxShadow: "0 0 24px var(--electric-glow)",
                  }}
                >
                  {content.cta.label}
                </motion.span>
              </Link>
            </motion.div>
          )}

          <motion.p
            className="pt-1"
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? fadeReduced : { ...enter, delay: 0.16 }}
          >
            <a
              href={MARKETING_HOME_URL}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white/45 no-underline transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70 active:scale-[0.97]"
            >
              トップに戻る
            </a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

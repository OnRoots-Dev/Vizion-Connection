// app/(auth)/thanks/ThanksClient.tsx

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthIconBadge } from "@/components/auth/AuthStatusMotion";
import { springDefault, fadeReduced } from "@/lib/motion/apple-springs";
import { PRESS_SCALE } from "@/components/ui/Pressable";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

type ThanksKind = "verify" | "verified" | "email_changed" | "business";

interface Content {
  iconType: "verify" | "verified" | "business";
  eyebrow: string;
  title: string;
  /** 段落配列で余白を制御しやすくする */
  paragraphs: string[];
  showMailHelp: boolean;
  /** 認証完了ページでウェルカムメール送信をトリガ */
  triggerWelcomeEmail: boolean;
  notice?: string;
  cta: { href: string; label: string } | null;
}

function resolveContent(type: string | undefined): Content {
  const map: Record<ThanksKind, Content> = {
    verify: {
      iconType: "verify",
      eyebrow: "CHECK YOUR INBOX",
      title: "メールを確認してください",
      paragraphs: [
        "ご登録のメールアドレスに認証リンクを送りました。",
        "リンクを開くと本登録が完了し、Pulse を始められます。",
      ],
      showMailHelp: true,
      triggerWelcomeEmail: false,
      cta: null,
    },
    verified: {
      iconType: "verified",
      eyebrow: "VERIFIED",
      title: "認証が完了しました",
      paragraphs: [
        "メール認証へのご協力ありがとうございます。",
        "アカウントの本登録が完了しました。ログインして、最初の一歩を記録しましょう。",
      ],
      showMailHelp: false,
      triggerWelcomeEmail: true,
      notice: "認証完了の確認メールを自動送信しています。届くまで少しお待ちください。",
      // 認証完了後はオンボーディングではなくログイン画面へ。
      cta: { href: "/login", label: "ログインする" },
    },
    email_changed: {
      iconType: "verified",
      eyebrow: "EMAIL UPDATED",
      title: "メールアドレスを更新しました",
      paragraphs: [
        "新しいメールアドレスでのログインが有効になりました。",
        "必要ならログイン画面から続けてください。",
      ],
      showMailHelp: false,
      triggerWelcomeEmail: false,
      cta: { href: "/login", label: "ログインする" },
    },
    business: {
      iconType: "business",
      eyebrow: "BUSINESS",
      title: "お申し込みありがとうございます",
      paragraphs: [
        "Business ポジションへのお申し込みを受け付けました。",
        "決済完了後、ご案内をお送りします。",
      ],
      showMailHelp: false,
      triggerWelcomeEmail: false,
      cta: { href: "/dashboard", label: "ダッシュボードへ" },
    },
  };

  if (type && type in map) return map[type as ThanksKind];
  return map.verify;
}

/** オープンリダイレクト対策: 同一オリジンの相対パスのみ許可（サーバー側と同一規則） */
function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return null;
  if (raw.length > 512) return null;
  return raw;
}

export default function ThanksClient({
  type,
  next,
  fromEmail,
}: {
  type?: string;
  next?: string;
  fromEmail: string;
}) {
  const reduce = useReducedMotion();
  const content = resolveContent(type);
  const press = reduce ? undefined : { scale: PRESS_SCALE };
  const enter = reduce ? fadeReduced : springDefault;
  const welcomeTriggered = useRef(false);

  // 認証後に復帰するパス（例: Business決済画面）。無ければ従来通り /onboarding。
  const forwardNext = safeNextPath(next);
  const ctaHref = forwardNext ?? content.cta?.href ?? null;
  const ctaLabel = forwardNext ? "続ける" : (content.cta?.label ?? null);

  // 認証完了ページ表示後にウェルカムメールを自動送信（1回のみ）。
  // next 指定時は送信トリガ後に即座にフォワード（決済導線など）。
  useEffect(() => {
    if (!content.triggerWelcomeEmail || welcomeTriggered.current) return;
    welcomeTriggered.current = true;

    void (async () => {
      try {
        await fetch("/api/auth/confirm/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
        });
      } catch {
        // メール送信失敗は画面をブロックしない（サーバーログに残る）
      }
      if (forwardNext) {
        window.location.assign(forwardNext);
      }
    })();
  }, [content.triggerWelcomeEmail, forwardNext]);

  return (
    <AuthShell
      cardInitialY={16}
      logoMarginClass="mb-7"
      cardClassName="max-w-[420px] px-6 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-9"
    >
        {/* アイコン */}
        <div className="mb-6 flex justify-center">
          <AuthIconBadge kind={content.iconType} />
        </div>

        {/* 見出しブロック — タイトル周辺は詰めて読みやすく */}
        <motion.div
          className="text-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? fadeReduced : { ...enter, delay: 0.06 }}
        >
          <p
            className="m-0 mb-3 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--electric)", fontFamily: "monospace" }}
          >
            {content.eyebrow}
          </p>
          <h1 className="m-0 text-[1.375rem] font-bold leading-snug tracking-[-0.02em] text-white sm:text-[1.5rem]">
            {content.title}
          </h1>
          <div className="mx-auto mt-4 max-w-[34ch] space-y-2.5">
            {content.paragraphs.map((p) => (
              <p
                key={p}
                className="m-0 text-[13.5px] leading-[1.75] text-white/50 sm:text-sm"
              >
                {p}
              </p>
            ))}
          </div>
        </motion.div>

        {/* メール未達ヘルプ */}
        {content.showMailHelp && (
          <motion.div
            className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left"
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

        {/* 補足 notice — 本文より一段下げる */}
        {content.notice && (
          <motion.p
            className="m-0 mt-5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3 text-center text-[11.5px] leading-relaxed text-white/40"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? fadeReduced : { ...enter, delay: 0.1 }}
          >
            {content.notice}
          </motion.p>
        )}

        {/* CTA — 本文から十分離し、セカンダリとの間も確保 */}
        {ctaHref && ctaLabel && (
          <motion.div
            className="mt-7"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? fadeReduced : { ...enter, delay: 0.12 }}
          >
            <Link href={ctaHref} className="block">
              <motion.span
                whileTap={press}
                transition={springDefault}
                className="inline-flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-black text-black"
                style={{
                  background: "var(--electric)",
                  boxShadow: "0 0 24px var(--electric-glow)",
                }}
              >
                {ctaLabel}
              </motion.span>
            </Link>
          </motion.div>
        )}

        <motion.div
          className={ctaHref ? "mt-4" : "mt-7"}
          initial={reduce ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduce ? fadeReduced : { ...enter, delay: 0.16 }}
        >
          <a
            href={MARKETING_HOME_URL}
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-xs font-medium text-white/40 no-underline transition-colors hover:border-white/18 hover:bg-white/[0.04] hover:text-white/65 active:scale-[0.97]"
          >
            トップに戻る
          </a>
        </motion.div>
    </AuthShell>
  );
}

"use client";

// components/auth/AuthShell.tsx — authルート共通Shell（Design System v2 / Phase 3-F）
// 構造: vc-auth-shell > AuthAmbientBg > ロゴ > グラスカード { children }
//
// UI/UX維持が最優先のため、ページごとの実差分をpropsで吸収する:
// - variant: 背景とガラス種別（login = ネットワーク背景 + heavy frost ガラス）
// - logoClassName / logoWithTitle: ロゴの余白・高さ・title属性（旧実装の差をそのまま維持）
// - cardClassName / cardPadding: カード幅・パディング（同上）
// - animated: カード入場アニメ（register はプレーンdivのため false）
// - cardInitialY: 入場アニメの初回オフセット（Thanks=16、他=18 の歴史的差を維持）
//
// 値は各フォームの旧実装から一切変更していない。

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { AuthAmbientBg } from "@/components/auth/AuthAmbientBg";
import { authGlassTokens } from "@/lib/design/tokens";
import { springSnap, fadeReduced } from "@/lib/motion/apple-springs";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

export function AuthShell({
    variant = "default",
    logoClassName = "h-[4.25rem] w-auto sm:h-[4.75rem]",
    logoMarginClass = "mb-6",
    logoWithTitle = true,
    cardClassName = "",
    cardOverlay = false,
    animated = true,
    cardInitialY = 18,
    children,
}: {
    /** "login" = ネットワーク背景 + heavy frost ガラス。省略時は汎用。 */
    variant?: "login" | "default";
    /** ロゴ画像の Tailwind 高さクラス（ページごとの歴史差を維持） */
    logoClassName?: string;
    /** ロゴ下の余白 */
    logoMarginClass?: string;
    /** <a> に title="Vizion Connection" を付与（register は付与していない歴史差を維持） */
    logoWithTitle?: boolean;
    /** ガラスカードへの追加クラス（max-w / padding 等のページ固有指定） */
    cardClassName?: string;
    /** loginカード固有の上面ハイライト + 白霞オーバーレイ2枚を再現 */
    cardOverlay?: boolean;
    /** カード入場アニメ。register はアニメなしの歴史差を維持するため false */
    animated?: boolean;
    /** 入場アニメの初回 y オフセット（Thanks=16、login/reset=18 の歴史差を維持） */
    cardInitialY?: number;
    children: ReactNode;
}) {
    const reduceRaw = useReducedMotion();
    const reduce = reduceRaw ?? false;

    const glass = variant === "login" ? undefined : authGlassTokens({ reducedTransparency: reduce });

    const glassClasses =
        variant === "login"
            ? `vc-login-glass${reduce ? " vc-login-glass--solid" : ""}`
            : `vc-auth-glass${reduce ? " vc-auth-glass--solid" : ""}`;

    const cardStyle: CSSProperties | undefined =
        variant === "login"
            ? undefined
            : {
                  borderRadius: glass!.borderRadius,
                  boxShadow: glass!.boxShadow,
                  backdropFilter: glass!.backdropFilter,
                  WebkitBackdropFilter: glass!.WebkitBackdropFilter,
              };

    const enterTransition = reduce ? fadeReduced : springSnap;

    return (
        <div className="vc-auth-shell">
            <AuthAmbientBg variant={variant} />

            <a
                href={MARKETING_HOME_URL}
                {...(logoWithTitle ? { title: "Vizion Connection" } : {})}
                className={`relative z-10 ${logoMarginClass} inline-block active:scale-[0.97] transition-transform duration-100`}
            >
                <Image
                    src="/images/vizion-connection-logo-6-cropped.png"
                    alt="Vizion Connection"
                    width={320}
                    height={86}
                    priority
                    className={`inline-block ${logoClassName}`}
                />
            </a>

            {animated ? (
                <motion.div
                    className={`relative z-10 w-full ${cardOverlay ? "overflow-hidden " : ""}${glassClasses} ${cardClassName}`}
                    style={cardStyle}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: cardInitialY, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={enterTransition}
                >
                    {cardOverlay && (
                        <>
                            {/* グラス上面ハイライト（光が乗る縁） */}
                            <div
                                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                                style={{
                                    background:
                                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.22) 25%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.22) 75%, transparent)",
                                }}
                                aria-hidden
                            />
                            {/* すりガラスの白霞 */}
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    borderRadius: "inherit",
                                    background:
                                        "linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, rgba(0,0,0,0.12) 100%)",
                                }}
                                aria-hidden
                            />
                        </>
                    )}
                    {cardOverlay ? (
                        <div className="relative z-[1]">{children}</div>
                    ) : (
                        children
                    )}
                </motion.div>
            ) : (
                <div
                    className={`relative z-10 w-full ${glassClasses} ${cardClassName}`}
                    style={cardStyle}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

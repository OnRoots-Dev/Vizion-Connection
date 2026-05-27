"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const MARKETING_HOME_URL = "https://vizion-connection.jp/";

type Status = "loading" | "success" | "error";

export default function ConfirmPage() {
    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        let cancelled = false;
        let redirectTimer: ReturnType<typeof setTimeout> | null = null;

        async function confirmEmail() {
            const searchParams = new URLSearchParams(window.location.search);
            const tokenHash = searchParams.get("token_hash");
            const type = searchParams.get("type") as EmailOtpType | null;

            if (!tokenHash || !type) {
                setStatus("error");
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

            if (cancelled) return;

            if (error) {
                setStatus("error");
                return;
            }

            const res = await fetch("/api/auth/confirm/complete", {
                method: "POST",
                credentials: "include",
            });

            if (cancelled) return;

            if (!res.ok) {
                setStatus("error");
                return;
            }

            setStatus("success");
            redirectTimer = setTimeout(() => {
                window.location.assign("/login");
            }, 3000);
        }

        confirmEmail().catch(() => {
            if (!cancelled) {
                setStatus("error");
            }
        });

        return () => {
            cancelled = true;
            if (redirectTimer) {
                clearTimeout(redirectTimer);
            }
        };
    }, []);

    return (
        <div
            className="min-h-screen px-6 py-10 text-white"
            style={{ background: "#0a0a0a" }}
        >
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col items-center justify-center">
                <a href={MARKETING_HOME_URL} className="mb-8 tracking-[0.2em]">
                    <Image
                        src="/images/Vizion_Connection_logo-wt.png"
                        alt="Vizion Connection"
                        width={300}
                        height={80}
                        priority
                        className="inline-block h-20 w-auto"
                    />
                </a>

                <div className="w-full rounded-[28px] border border-white/10 bg-white/[0.04] px-7 py-9 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    {status === "loading" && (
                        <div className="space-y-5">
                            <div className="mx-auto h-11 w-11 rounded-full border-2 border-white/15 border-t-white/70 animate-spin" />
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-white">メール認証中...</h1>
                                <p className="text-sm leading-relaxed text-white/40">
                                    リンクを確認しています。しばらくお待ちください。
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold text-[#32D278]">✓ 認証が完了しました</h1>
                            <p className="text-sm leading-relaxed text-white/45">
                                ログインページへ移動します...
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="space-y-4">
                            <h1 className="text-2xl font-bold text-[#FF5050]">
                                認証リンクが無効または期限切れです
                            </h1>
                            <p className="text-sm leading-relaxed text-white/45">
                                お手数ですが、もう一度登録フローからお試しください。
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/75 transition-colors hover:border-white/30 hover:text-white"
                            >
                                再登録はこちら
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

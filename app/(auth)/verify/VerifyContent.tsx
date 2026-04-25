"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type VerifyState = "loading" | "success" | "error";

export default function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [state, setState] = useState<VerifyState>("loading");
    const [errorMessage, setErrorMessage] = useState("");
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;
        const token = searchParams.get("token");
        if (!token) {
            setState("error");
            setErrorMessage("URLにトークンが含まれていません。メール内のリンクをご確認ください。");
            return;
        }
        async function doVerify() {
            try {
                const res = await fetch(`/api/verify?token=${encodeURIComponent(token!)}`, { method: "GET" });
                const data: { success: boolean; error?: string; role?: string } = await res.json();
                if (!data.success) {
                    setState("error");
                    setErrorMessage(data.error ?? "認証に失敗しました");
                    return;
                }
                setState("success");
                const redirectPath = data.role === "Business" ? "/business/checkout" : "/login";
                setTimeout(() => router.push(redirectPath), 2000);
            } catch {
                setState("error");
                setErrorMessage("通信エラーが発生しました。もう一度お試しください。");
            }
        }
        doVerify();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
            <div className="w-full max-w-md text-center">
                <img src="/images/Vizion_Connection_logo-wt.png" alt="Logo" className="h-24 w-auto mx-auto mb-10" />
                {state === "loading" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full border-2 border-[#222] border-t-violet-500 animate-spin" />
                        </div>
                        <p className="text-gray-400 text-sm">メールアドレスを確認しています...</p>
                    </div>
                )}
                {state === "success" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">メールアドレスを確認しました</h2>
                            <p className="text-gray-500 text-sm">登録が完了しました。次のページへ移動します...</p>
                        </div>
                        <div className="flex justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        </div>
                    </div>
                )}
                {state === "error" && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">認証に失敗しました</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">{errorMessage}</p>
                        </div>
                        <div className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-3 text-left">
                            <p className="text-sm text-gray-400 font-medium">考えられる原因:</p>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2"><span className="text-gray-700 mt-0.5">•</span>リンクの有効期限（24時間）が切れている</li>
                                <li className="flex items-start gap-2"><span className="text-gray-700 mt-0.5">•</span>すでに使用済みのリンク</li>
                                <li className="flex items-start gap-2"><span className="text-gray-700 mt-0.5">•</span>URLが正しくコピーされていない</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link href="/register" className="w-full inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-lg transition-colors text-sm tracking-wide text-center">再度登録する</Link>
                            <Link href="/login" className="w-full inline-block border border-[#333] hover:border-[#444] text-gray-400 hover:text-gray-300 font-medium py-3 rounded-lg transition-colors text-sm text-center">ログインする</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
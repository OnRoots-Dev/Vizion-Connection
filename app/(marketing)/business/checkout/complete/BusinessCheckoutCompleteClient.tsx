"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CompleteState = "loading" | "success" | "error";

export default function BusinessCheckoutCompleteClient() {
  const [state, setState] = useState<CompleteState>("loading");
  const [message, setMessage] = useState("決済完了を確認しています...");

  useEffect(() => {
    let active = true;

    async function completeOrder() {
      try {
        const res = await fetch("/api/business-checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = (await res.json()) as { success?: boolean; error?: string };

        if (!active) return;

        if (!res.ok || !data.success) {
          setState("error");
          setMessage(data.error ?? "プラン有効化に失敗しました");
          return;
        }

        setState("success");
        setMessage("決済が完了し、Businessプランを有効化しました。");
      } catch {
        if (!active) return;
        setState("error");
        setMessage("通信エラーが発生しました。時間をおいて再度お試しください。");
      }
    }

    completeOrder();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#07080f] px-6 py-20 text-[#e8eaf0]">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0e1018] p-8 text-center">
        <p className="mb-2 font-mono text-xs tracking-[0.16em] text-[#00d2ff]">BUSINESS CHECKOUT</p>
        <h1 className="mb-4 text-2xl font-extrabold text-white">
          {state === "success" ? "決済完了" : state === "error" ? "処理エラー" : "処理中"}
        </h1>
        <p className="text-sm leading-7 text-[#8f97ab]">{message}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg bg-[#00d2ff] px-5 py-2.5 text-sm font-bold text-[#07080f]"
          >
            ダッシュボードへ
          </Link>
          <Link
            href="/business/checkout"
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80"
          >
            プラン一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

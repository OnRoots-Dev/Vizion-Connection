"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type CompleteState = "loading" | "pending" | "success" | "error";

function BusinessCheckoutCompleteInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [state, setState] = useState<CompleteState>("loading");
  const [message, setMessage] = useState("決済完了を確認しています...");

  useEffect(() => {
    let active = true;

    if (!orderId) {
      setState("error");
      setMessage("決済を開始した注文が見つかりません。プラン一覧から再度お試しください。");
      return () => {
        active = false;
      };
    }

    async function completeOrder(attempt = 0) {
      try {
        const res = await fetch("/api/business-checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = (await res.json()) as { success?: boolean; pending?: boolean; error?: string };

        if (!active) return;

        if (res.status === 202 && data.pending) {
          setState("pending");
          setMessage("決済を確認中です。確認後にプランが自動で有効になります。");
          if (attempt < 5) window.setTimeout(() => { void completeOrder(attempt + 1); }, 3000);
          return;
        }
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
  }, [orderId]);

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B0F", color: "#e8eaf0", padding: "80px 24px" }}>
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0e1018] p-8 text-center">
        <p className="mb-2 font-mono text-xs tracking-[0.16em] text-[#00d2ff]">BUSINESS CHECKOUT</p>
        <h1 className="mb-4 text-2xl font-extrabold text-white">
          {state === "success" ? "決済完了" : state === "error" ? "処理エラー" : state === "pending" ? "決済確認中" : "処理中"}
        </h1>
        <p className="text-sm leading-7 text-[#8f97ab]">{message}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              window.location.assign("/dashboard");
            }}
            className="rounded-lg bg-[#00d2ff] px-5 py-2.5 text-sm font-bold text-[#07080f]"
          >
            ダッシュボードへ
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCheckoutCompleteClient() {
  return (
    <Suspense fallback={null}>
      <BusinessCheckoutCompleteInner />
    </Suspense>
  );
}

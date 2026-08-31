"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type State = "loading" | "success" | "pending" | "error";

/**
 * Square からの戻り。webhook が非同期で注文完了するため、
 * こちらでは「この注文（?order=xxxx）の完了」を試行しつつ成功メッセージを表示する。
 * 過去・他ユーザー・最新の completed 注文を成功根拠にしない。
 */
export default function BusinessCompleteClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const [state, setState] = useState<State>("loading");
  const [planName, setPlanName] = useState<string | null>(null);
  const [message, setMessage] = useState("決済結果を確認しています…");

  const attempt = useCallback(
    async (): Promise<"success" | "pending" | "error"> => {
      const res = await fetch("/api/business-checkout/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        planName?: string | null;
        pending?: boolean;
        error?: string;
      };

      if (res.ok && data.success) {
        setState("success");
        setPlanName(data.planName ?? null);
        setMessage("お支払いが完了し、Businessプランを有効化しました。");
        return "success";
      }

      // webhook が非同期反映中の pending（HTTP 202 / pending:true）。
      // エラー扱いせず、正常な待機状態として扱う。
      if (res.status === 202 || data.pending === true) {
        return "pending";
      }

      setState("error");
      setMessage(data.error ?? "完了処理に失敗しました。サポートへお問い合わせください。");
      return "error";
    },
    [orderId],
  );

  useEffect(() => {
    let cancelled = false;

    if (!orderId) {
      setState("error");
      setMessage("決済情報が見つかりません。プラン一覧から再度お試しください。");
      return () => {
        cancelled = true;
      };
    }

    // 1回の完了確認。completed → "success" / 反映待ち → "pending" / 失敗 → "error"
    async function run() {
      const MAX_TRIES = 5;
      const DELAY_MS = 2000;

      for (let i = 0; i < MAX_TRIES; i++) {
        if (cancelled) return;

        const result = await attempt();
        if (result !== "pending") return;

        if (i < MAX_TRIES - 1) {
          // まだ反映待ち。短時間待って再確認する。
          setMessage("決済を確認しています…（反映まで数十秒かかることがあります）");
          await new Promise((r) => setTimeout(r, DELAY_MS));
        } else {
          // 全試行後も pending。受付済みとして正常に待機を継続できる導線を出す。
          setState("pending");
          setMessage(
            "決済は受け付けました。反映まで数十秒かかることがあります。ダッシュボードでプラン状態をご確認ください。",
          );
        }
      }
    }

    run().catch(() => {
      if (!cancelled) {
        setState("error");
        setMessage("通信エラーが発生しました。");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [attempt, orderId]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0F",
        color: "#e8eaf0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "#0e1018",
          padding: "40px 32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C8E800",
            marginBottom: 12,
          }}
        >
          Business Checkout
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
          {state === "loading" && "確認中…"}
          {state === "success" && "決済完了"}
          {state === "pending" && "受付完了"}
          {state === "error" && "確認できませんでした"}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: 28 }}>
          {message}
          {planName ? (
            <span style={{ display: "block", marginTop: 8, color: "#C8E800", fontWeight: 700 }}>
              {planName}
            </span>
          ) : null}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Onboarding未完了の新規Businessユーザーも /dashboard へ誘導し、モーダルで初期設定を促す */}
          <Link
            href="/dashboard"
            style={{
              display: "block",
              padding: "14px 24px",
              background: "#C8E800",
              color: "#07080f",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            ダッシュボードへ →
          </Link>
          <Link
            href="/dashboard/business/checkout"
            style={{
              display: "block",
              padding: "12px 24px",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)",
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            プラン一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

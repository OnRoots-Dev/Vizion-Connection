"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type State = "loading" | "success" | "pending" | "error";

/**
 * Square からの戻り。webhook が非同期で注文完了するため、
 * こちらでは pending 注文の完了 API を試行しつつ成功メッセージを表示する。
 */
export default function BusinessCompleteClient() {
  const [state, setState] = useState<State>("loading");
  const [planName, setPlanName] = useState<string | null>(null);
  const [message, setMessage] = useState("決済結果を確認しています…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/business-checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const data = (await res.json()) as {
          success?: boolean;
          planName?: string | null;
          error?: string;
        };

        if (cancelled) return;

        if (res.ok && data.success) {
          setState("success");
          setPlanName(data.planName ?? null);
          setMessage("お支払いが完了し、Businessプランを有効化しました。");
          return;
        }

        // webhook が先に完了済み / まだ pending の場合
        if (res.status === 404) {
          setState("pending");
          setMessage(
            "決済は受け付けました。反映まで数十秒かかることがあります。ダッシュボードでプラン状態をご確認ください。",
          );
          return;
        }

        setState("error");
        setMessage(data.error ?? "完了処理に失敗しました。サポートへお問い合わせください。");
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("通信エラーが発生しました。");
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

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

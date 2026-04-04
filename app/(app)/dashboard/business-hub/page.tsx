import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { getPlanFeatures } from "@/features/business/plan-features";

export const dynamic = "force-dynamic";

function UpgradeBanner() {
  return (
    <main style={{ minHeight: "100vh", background: "#08080f", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: 24 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: "#3C8CFF" }}>ビジネスハブ</p>
        <h1 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900 }}>この機能はPresenceプラン以上でご利用いただけます</h1>
        <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.65)" }}>
          広告効果の詳細分析やビジネス向けの高度な機能は、Presence 以上のスポンサー向けに開放されています。
        </p>
        <Link
          href="/dashboard/business"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 18px",
            borderRadius: 12,
            background: "#3C8CFF",
            color: "#000",
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          プランをアップグレードする
        </Link>
      </div>
    </main>
  );
}

export default async function BusinessHubPage() {
  const result = await getProfileFromSession();
  if (!result.success) {
    redirect("/dashboard");
  }

  const features = getPlanFeatures(result.data.profile.sponsorPlan ?? null);
  if (!features.businessHubAccess) {
    return <UpgradeBanner />;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#08080f", color: "#fff", padding: "24px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", borderRadius: 20, border: "1px solid rgba(60,140,255,0.2)", background: "rgba(60,140,255,0.06)", padding: 24 }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: "#3C8CFF" }}>ビジネスハブ</p>
        <h1 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 900 }}>ビジネスハブへようこそ</h1>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.7)" }}>
          この画面はスポンサー向けの高度な分析・運用機能の入口です。詳細機能は今後の段階実装で拡張していきます。
        </p>
      </div>
    </main>
  );
}

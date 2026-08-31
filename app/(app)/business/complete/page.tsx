import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSupabaseProfile } from "@/lib/auth/session";
import BusinessCompleteClient from "./BusinessCompleteClient";

export const dynamic = "force-dynamic";

/**
 * Square Payment Link 完了後のリダイレクト先。
 * 開発・Preview・本番は環境変数 NEXT_PUBLIC_BASE_URL から決定し、
 * 注文ID（?order=xxxxx）を伴って遷移する。
 */
export default async function BusinessCompletePage() {
  const profile = await getSupabaseProfile();
  if (!profile) {
    redirect("/login?redirect=/business/complete");
  }

  return (
    <Suspense fallback={null}>
      <BusinessCompleteClient />
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import { getSupabaseProfile } from "@/lib/auth/session";
import BusinessCompleteClient from "./BusinessCompleteClient";

export const dynamic = "force-dynamic";

/**
 * Square Payment Link 完了後のリダイレクト先。
 * https://app.vizion-connection.jp/business/complete
 */
export default async function BusinessCompletePage() {
  const profile = await getSupabaseProfile();
  if (!profile) {
    redirect("/login?redirect=/business/complete");
  }

  return <BusinessCompleteClient onboardingComplete={profile.isOnboardingComplete !== false} />;
}

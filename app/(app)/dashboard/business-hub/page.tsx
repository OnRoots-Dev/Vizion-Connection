import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import BusinessHubClient from "./BusinessHubClient";

export const dynamic = "force-dynamic";

export default async function BusinessHubPage() {
  const result = await getProfileFromSession();
  if (!result.success) {
    redirect("/dashboard");
  }

  if (result.data.profile.role !== "Business") {
    redirect("/dashboard");
  }

  return <BusinessHubClient sponsorPlan={result.data.profile.sponsorPlan ?? null} />;
}

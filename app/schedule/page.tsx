import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const result = await getProfileFromSession();

  if (!result.success) {
    const reason = result.reason === "unauthenticated" ? "unauthenticated" : "other";
    redirect(`/api/auth/clear?reason=${reason}`);
  }

  const { profile } = result.data;

  return <ScheduleClient profile={profile} />;
}

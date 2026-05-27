import { redirect } from "next/navigation";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import ScheduleClient from "./ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const result = await getProfileFromSession();

  if (!result.success) {
    redirect("/login?redirect=/schedule");
  }

  const { profile } = result.data;

  return <ScheduleClient profile={profile} />;
}

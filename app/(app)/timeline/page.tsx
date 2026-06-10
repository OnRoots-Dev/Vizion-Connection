import { getSupabaseProfile } from "@/lib/auth/session";
import TimelineClient from "./TimelineClient";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const user = await getSupabaseProfile();
  return <TimelineClient currentUserSlug={user?.slug ?? null} />;
}

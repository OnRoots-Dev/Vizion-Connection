import { getSupabaseProfile } from "@/lib/auth/session";

export async function requireMemberProfile() {
  const profile = await getSupabaseProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  if (profile.role !== "Crew") {
    throw new Error("FORBIDDEN");
  }
  return profile;
}

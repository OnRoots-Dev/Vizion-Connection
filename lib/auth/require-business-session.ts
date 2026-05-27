import { getSupabaseProfile } from "@/lib/auth/session";

export async function requireBusinessProfile() {
  const profile = await getSupabaseProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  if (profile.role !== "Business") {
    throw new Error("FORBIDDEN");
  }
  return profile;
}

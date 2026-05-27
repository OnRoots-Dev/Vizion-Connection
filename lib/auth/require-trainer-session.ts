import { getSupabaseProfile } from "@/lib/auth/session";

export async function requireTrainerProfile() {
  const profile = await getSupabaseProfile();
  if (!profile) throw new Error("UNAUTHORIZED");
  if (profile.role !== "Trainer") throw new Error("FORBIDDEN");
  return profile;
}

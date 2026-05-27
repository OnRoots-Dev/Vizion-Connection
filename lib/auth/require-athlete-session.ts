import { getSupabaseUser } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";

export async function requireAthleteProfile() {
  const user = await getSupabaseUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const slug = user.user_metadata.slug;
  if (typeof slug !== "string" || !slug) throw new Error("UNAUTHORIZED");

  const profile = await findUserBySlug(slug);
  if (!profile) throw new Error("NOT_FOUND");
  if (profile.role !== "Athlete") throw new Error("FORBIDDEN");

  return profile;
}

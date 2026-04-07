import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function isFollowing(followerSlug: string, targetSlug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_follows")
    .select("id")
    .eq("follower_slug", followerSlug)
    .eq("target_slug", targetSlug)
    .maybeSingle();

  if (error) {
    console.error("[isFollowing]", error);
    return false;
  }

  return Boolean(data);
}

export async function canViewPrivateProfile(viewerSlug: string | null | undefined, targetSlug: string): Promise<boolean> {
  if (!viewerSlug) return false;
  if (viewerSlug === targetSlug) return true;
  return isFollowing(viewerSlug, targetSlug);
}

import { supabaseServer as supabase } from "@/lib/supabase/server";

export async function createBond(followerSlug: string, targetSlug: string): Promise<{ success: boolean; error?: string }> {
  if (followerSlug === targetSlug) {
    return { success: false, error: "自分自身をBondすることはできません" };
  }

  const { data: target } = await supabase
    .from("users")
    .select("slug")
    .eq("slug", targetSlug)
    .eq("is_deleted", false)
    .maybeSingle();
  if (!target) {
    return { success: false, error: "対象ユーザーが見つかりませんでした" };
  }

  const already = await isFollowing(followerSlug, targetSlug);
  if (already) {
    return { success: true };
  }

  const { error } = await supabase
    .from("user_follows")
    .insert({ follower_slug: followerSlug, target_slug: targetSlug });

  if (error) {
    if (error.code === "23505") return { success: true };
    console.error("[createBond]", error);
    return { success: false, error: "Bondに失敗しました" };
  }

  return { success: true };
}

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

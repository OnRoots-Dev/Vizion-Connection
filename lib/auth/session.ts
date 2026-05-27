// lib/auth/session.ts

import { createClient } from "@/lib/supabase/server";
import { findUserBySlug } from "@/lib/supabase/data/users.server";

export async function getSupabaseUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}

export async function getSupabaseProfile() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("users")
        .select("slug")
        .eq("auth_id", user.id)
        .single();

    if (!profile?.slug) return null;
    return findUserBySlug(profile.slug);
}

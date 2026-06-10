// lib/auth/session.ts

import { createClient } from "@/lib/supabase/server";
import { findUserBySlug, findSlugByAuthId } from "@/lib/supabase/data/users.server";

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

    const metaSlug = user.user_metadata?.slug as string | undefined;
    const slug = metaSlug ?? (await findSlugByAuthId(user.id));
    if (!slug) return null;

    return findUserBySlug(slug);
}

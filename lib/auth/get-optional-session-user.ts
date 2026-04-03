import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";

export async function getOptionalSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const session = verifySession(token);
    if (!session) return null;
    return findUserBySlug(session.slug);
}

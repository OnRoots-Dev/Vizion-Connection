import { getSessionCookie } from "@/lib/auth/cookies";
import { verifySession } from "@/lib/auth/session";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import { canManageVoiceLabByEmail } from "@/lib/auth/voicelab-admin";

export async function requireAdminProfile() {
    const token = await getSessionCookie();
    if (!token) {
        throw new Error("UNAUTHORIZED");
    }

    const session = verifySession(token);
    if (!session) {
        throw new Error("UNAUTHORIZED");
    }

    const profile = await findUserBySlug(session.slug);
    if (!profile) {
        throw new Error("NOT_FOUND");
    }

    if (profile.role !== "Admin") {
        throw new Error("FORBIDDEN");
    }

    if (!canManageVoiceLabByEmail(session.email)) {
        throw new Error("FORBIDDEN");
    }

    return profile;
}

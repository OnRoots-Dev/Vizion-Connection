import { getSupabaseProfile } from "@/lib/auth/session";
import { canManageVoiceLabByEmail } from "@/lib/auth/voicelab-admin";

export async function requireAdminProfile() {
    const profile = await getSupabaseProfile();
    if (!profile) throw new Error("UNAUTHORIZED");
    if (profile.role !== "Admin") {
        throw new Error("FORBIDDEN");
    }

    if (!canManageVoiceLabByEmail(profile.email)) {
        throw new Error("FORBIDDEN_EMAIL");
    }

    return profile;
}

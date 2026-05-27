import { getSupabaseProfile } from "@/lib/auth/session";

export async function getOptionalSessionUser() {
    return getSupabaseProfile();
}

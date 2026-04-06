import { env } from "@/lib/env";

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

export function canManageOpenlabByEmail(email?: string | null) {
    if (!email) return false;

    const normalized = normalizeEmail(email);
    const configuredAdmins = env.OPENLAB_ADMIN_EMAILS
        .split(",")
        .map((entry) => normalizeEmail(entry))
        .filter(Boolean);

    if (configuredAdmins.includes(normalized)) {
        return true;
    }

    return normalized.endsWith("@vizion-connection.jp");
}

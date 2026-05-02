import { getPublicProfileBySlug } from "@/features/profile/server/get-profile-by-slug";

export type OgProfileData = {
    slug: string;
    displayName: string;
    role: string;
    roleLabel: string;
    roleColor: string;
    roleGradient: string;
    bio: string;
    sport: string;
    region: string;
    prefecture: string;
    stance: string;
    cheerCount: number;
    serialId: string;
    isFounding: boolean;
    initials: string;
    location: string;
    avatarData: string | null;
    bgData: string | null;
};

const ROLE_COLOR: Record<string, string> = {
    Athlete: "#C1272D",
    Trainer: "#1A7A4A",
    Members: "#B8860B",
    Business: "#1B3A8C",
};

const ROLE_GRADIENT: Record<string, string> = {
    Athlete: "#2D0000",
    Trainer: "#001A0A",
    Members: "#1A0F00",
    Business: "#000A24",
};

const ROLE_LABEL: Record<string, string> = {
    Athlete: "ATHLETE",
    Trainer: "TRAINER",
    Members: "MEMBERS",
    Business: "BUSINESS",
};

function arrayBufferToBase64(buf: ArrayBuffer): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(buf).toString("base64");
    }

    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export async function fetchBase64(url: string | null): Promise<string | null> {
    if (!url) return null;

    try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);

        if (!res.ok) return null;

        const buf = await res.arrayBuffer();
        const mime = res.headers.get("content-type") ?? "image/jpeg";
        const b64 = arrayBufferToBase64(buf);

        return `data:${mime};base64,${b64}`;
    } catch {
        return null;
    }
}

export async function getOgProfileData(
    slug: string
): Promise<{ success: true; data: OgProfileData } | { success: false }> {
    const result = await getPublicProfileBySlug(slug);
    if (!result.success || !result.data.isPublic) {
        return { success: false };
    }

    const p = result.data;

    const displayName = p.displayName ?? "Vizion Member";
    const role = p.role ?? "Members";
    const bio = p.bio ?? "";
    const sport = p.sport ?? "";
    const region = p.region ?? "";
    const prefecture = p.prefecture ?? "";
    const stance = p.stance ?? "";
    const cheerCount = p.cheerCount ?? 0;
    const serialId = p.serialId ?? "";
    const isFounding = p.isFoundingMember ?? false;

    const roleColor = ROLE_COLOR[role] ?? "#a78bfa";
    const roleGradient = ROLE_GRADIENT[role] ?? "#1a1a2e";
    const roleLabel = ROLE_LABEL[role] ?? String(role).toUpperCase();

    const initials = displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const location = [region, prefecture].filter(Boolean).join(" / ");

    const [avatarData, bgData] = await Promise.all([
        fetchBase64(p.avatarUrl ?? p.profileImageUrl ?? null),
        fetchBase64(p.profileImageUrl ?? null),
    ]);

    return {
        success: true,
        data: {
            slug,
            displayName,
            role,
            roleLabel,
            roleColor,
            roleGradient,
            bio,
            sport,
            region,
            prefecture,
            stance,
            cheerCount,
            serialId,
            isFounding,
            initials,
            location,
            avatarData,
            bgData,
        },
    };
}

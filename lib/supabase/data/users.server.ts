// lib/supabase/users.ts

import { supabaseServer as supabase } from "@/lib/supabase/server";

type UserRow = {
    id: number;
    slug: string;
    display_name: string;
    password_hash: string;
    email: string;
    role: string;
    is_public: boolean;
    is_founding_member: boolean;
    verified: boolean;
    serial_id: string | null;
    seq: number | null;
    rand_a: string | null;
    rand_b: string | null;
    avatar_url: string | null;
    profile_image_url: string | null;
    bio: string | null;
    region: string | null;
    prefecture: string | null;
    location: string | null;
    sport: string | null;
    sports_category: string | null;
    stance: string | null;
    claim: string | null;
    instagram: string | null;
    x_url: string | null;
    tiktok: string | null;
    proof_url: string | null;
    ambassador_code: string | null;
    founding_number: number | null;
    from_slug: string | null;
    referrer_slug: string | null;
    cheer_count: number;
    points: number;
    mission_bonus_given: boolean;
    has_shared: boolean;
    reset_token: string | null;
    reset_token_expires: string | null;
    is_deleted: boolean;
    deleted_at: string | null;
    created_at: string;
    last_login_at: string | null;
};

function toProfile(row: UserRow) {
    return {
        id: row.id,
        slug: row.slug,
        displayName: row.display_name,
        passwordHash: row.password_hash,
        email: row.email,
        role: row.role as "Athlete" | "Trainer" | "Members" | "Business",
        isPublic: row.is_public,
        isFoundingMember: row.is_founding_member,
        verified: row.verified,
        serialId: row.serial_id,
        seq: row.seq,
        randA: row.rand_a,
        randB: row.rand_b,
        avatarUrl: row.avatar_url,
        profileImageUrl: row.profile_image_url,
        bio: row.bio,
        region: row.region,
        prefecture: row.prefecture,
        location: row.location,
        sport: row.sport,
        sportsCategory: row.sports_category,
        stance: row.stance,
        claim: row.claim,
        instagram: row.instagram,
        xUrl: row.x_url,
        tiktok: row.tiktok,
        proofUrl: row.proof_url,
        ambassadorCode: row.ambassador_code,
        foundingNumber: row.founding_number,
        fromSlug: row.from_slug,
        referrerSlug: row.referrer_slug,
        cheerCount: row.cheer_count,
        points: row.points,
        missionBonusGiven: row.mission_bonus_given,
        hasShared: row.has_shared,
        resetToken: row.reset_token,
        resetTokenExpires: row.reset_token_expires,
        isDeleted: row.is_deleted,
        deletedAt: row.deleted_at,
        createdAt: row.created_at,
        lastLoginAt: row.last_login_at,
    };
}

export type ProfileRecord = ReturnType<typeof toProfile>;

// ── 検索 ──────────────────────────────────────────────────────────────────────

export async function findUserBySlug(slug: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
        .from("users").select("*").eq("slug", slug).eq("is_deleted", false).single();
    if (error || !data) return null;
    return toProfile(data);
}

export async function findUserByEmail(email: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
        .from("users").select("*").eq("email", email).eq("is_deleted", false).single();
    if (error || !data) return null;
    return toProfile(data);
}

export async function findUserByAmbassadorCode(code: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
        .from("users").select("*").eq("ambassador_code", code).eq("is_deleted", false).single();
    if (error || !data) return null;
    return toProfile(data);
}

export async function findUserByResetToken(token: string): Promise<ProfileRecord | null> {
    const { data, error } = await supabase
        .from("users").select("*").eq("reset_token", token)
        .gt("reset_token_expires", new Date().toISOString()).single();
    if (error || !data) return null;
    return toProfile(data);
}

// ── 採番 ─────────────────────────────────────────────────────────────────────

export async function getNextSerialId(): Promise<{ seq: number; randA: string; randB: string; serialId: string }> {
    const rand = (d: number) => Math.floor(Math.random() * 10 ** d).toString().padStart(d, "0");
    const randA = rand(5);
    const randB = rand(5);
    return { seq: 0, randA, randB, serialId: "" };
}

export async function updateUserSerialId(slug: string, seq: number, randA: string, randB: string): Promise<void> {
    const serialId = `VZ-${randA}-${randB}-${seq.toString().padStart(5, "0")}`;
    await supabase.from("users").update({ seq, rand_a: randA, rand_b: randB, serial_id: serialId }).eq("slug", slug);
}

// ── 作成 ─────────────────────────────────────────────────────────────────────

export async function createUser(params: {
    slug: string;
    displayName: string;
    passwordHash: string;
    email: string;
    role: string;
    fromSlug?: string;
    referrerSlug?: string;
    isFoundingMember?: boolean;
    ambassadorCode?: string;
}): Promise<ProfileRecord | null> {
    const rand = (d: number) => Math.floor(Math.random() * 10 ** d).toString().padStart(d, "0");
    const randA = rand(5);
    const randB = rand(5);

    const { data, error } = await supabase
        .from("users")
        .insert({
            slug: params.slug,
            display_name: params.displayName,
            password_hash: params.passwordHash,
            email: params.email,
            role: params.role,
            rand_a: randA,
            rand_b: randB,
            from_slug: params.fromSlug ?? null,
            referrer_slug: params.referrerSlug ?? null,
            is_founding_member: params.isFoundingMember ?? false,
            ambassador_code: params.ambassadorCode ?? null,
            is_public: true,
            verified: false,
        })
        .select().single();

    if (error || !data) { console.error("[createUser]", error); return null; }

    const seq = data.id;
    const serialId = `VZ-${randA}-${randB}-${seq.toString().padStart(5, "0")}`;
    await supabase.from("users").update({ seq, serial_id: serialId }).eq("id", seq);

    return toProfile({ ...data, seq, serial_id: serialId });
}

// ── 更新 ─────────────────────────────────────────────────────────────────────

const CAMEL_TO_SNAKE: Record<string, string> = {
    displayName: "display_name", bio: "bio", region: "region",
    prefecture: "prefecture", location: "location", sport: "sport",
    sportsCategory: "sports_category", stance: "stance", claim: "claim",
    instagram: "instagram", xUrl: "x_url", tiktok: "tiktok",
    avatarUrl: "avatar_url", profileImageUrl: "profile_image_url",
    proofUrl: "proof_url", isPublic: "is_public", hasShared: "has_shared",
};

export async function updateUserProfile(slug: string, fields: Record<string, unknown>): Promise<boolean> {
    const map: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fields)) {
        map[CAMEL_TO_SNAKE[k] ?? k] = v;
    }
    const { error } = await supabase.from("users").update(map).eq("slug", slug);
    if (error) { console.error("[updateUserProfile]", error); return false; }
    return true;
}

export async function updateLastLogin(slug: string): Promise<void> {
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("slug", slug);
}

export async function markUserVerified(slug: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ verified: true }).eq("slug", slug);
    if (error) { console.error("[markUserVerified]", error); return false; }
    return true;
}

export async function addPointsToUser(slug: string, amount: number): Promise<boolean> {
    const { error } = await supabase.rpc("add_points", { target_slug: slug, amount });
    if (error) { console.error("[addPointsToUser]", error); return false; }
    return true;
}

export async function updateUserPoints(slug: string, points: number): Promise<boolean> {
    const { error } = await supabase.from("users").update({ points }).eq("slug", slug);
    if (error) { console.error("[updateUserPoints]", error); return false; }
    return true;
}

export async function deactivateUser(slug: string): Promise<boolean> {
    const { error } = await supabase
        .from("users")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("slug", slug);
    if (error) { console.error("[deactivateUser]", error); return false; }
    return true;
}

export async function saveResetToken(email: string, token: string, expires: Date): Promise<boolean> {
    const { error } = await supabase
        .from("users")
        .update({ reset_token: token, reset_token_expires: expires.toISOString() })
        .eq("email", email);
    if (error) { console.error("[saveResetToken]", error); return false; }
    return true;
}

export async function updatePassword(slug: string, passwordHash: string): Promise<boolean> {
    const { error } = await supabase
        .from("users")
        .update({ password_hash: passwordHash, reset_token: null, reset_token_expires: null })
        .eq("slug", slug);
    if (error) { console.error("[updatePassword]", error); return false; }
    return true;
}

export async function setMissionBonusGiven(slug: string): Promise<boolean> {
    const { error } = await supabase.from("users").update({ mission_bonus_given: true }).eq("slug", slug);
    if (error) { console.error("[setMissionBonusGiven]", error); return false; }
    return true;
}

export async function getPublicUsers(params: {
    role?: string; region?: string; sport?: string;
    limit?: number; offset?: number;
}): Promise<ProfileRecord[]> {
    let query = supabase.from("users").select("*")
        .eq("is_public", true).eq("is_deleted", false)
        .order("cheer_count", { ascending: false });
    if (params.role) query = query.eq("role", params.role);
    if (params.region) query = query.eq("region", params.region);
    if (params.sport) query = query.eq("sport", params.sport);
    if (params.limit) query = query.limit(params.limit);
    if (params.offset) query = query.range(params.offset, params.offset + (params.limit ?? 20) - 1);
    const { data, error } = await query;
    if (error) { console.error("[getPublicUsers]", error); return []; }
    return (data ?? []).map(toProfile);
}

export async function countUsersByRole(role: string): Promise<number> {
    const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", role)
        .eq("is_deleted", false);
    if (error) { console.error("[countUsersByRole]", error); return 0; }
    return count ?? 0;
}
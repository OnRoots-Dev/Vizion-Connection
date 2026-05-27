// features/auth/server/register.ts
import { createClient } from "@/lib/supabase/server";
import { createUser, findUserByEmail, findUserBySlug, findUserByAmbassadorCode, countUsersByRole } from "@/lib/supabase/data/users.server";
import type { RegisterInput, RegisterResponse } from "@/features/auth/types";
import { rewardOnetimeMission } from "@/lib/onetime-missions";

const FOUNDING_MEMBER_LIMIT = 100;

export async function registerUser(input: RegisterInput): Promise<RegisterResponse> {
    const supabase = await createClient();
    const { email, password, role, displayName, slug, region, referrerSlug, redirectTo } = input;
    const resolvedDisplayName = displayName?.trim() || "";
    const resolvedRegion = region?.trim() || "未設定";

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
        return { success: false, error: "このメールアドレスはすでに登録されています" };
    }

    const existingBySlug = await findUserBySlug(slug);
    if (existingBySlug) {
        return { success: false, error: "このユーザー名はすでに使用されています" };
    }

    if (referrerSlug && referrerSlug === slug) {
        return { success: false, error: "自分自身を紹介者に指定することはできません" };
    }

    let resolvedReferrerSlug: string | undefined = undefined;
    if (referrerSlug) {
        let referrer = await findUserBySlug(referrerSlug);
        if (!referrer) {
            referrer = await findUserByAmbassadorCode(referrerSlug);
        }
        if (!referrer) {
            return { success: false, error: "紹介コードが無効です" };
        }
        resolvedReferrerSlug = referrer.slug;
    }

    const roleCount = await countUsersByRole(role);
    const isFoundingMember = roleCount < FOUNDING_MEMBER_LIMIT;

    const emailRedirectToBase = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/confirm`;
    const emailRedirectTo = redirectTo
        ? `${emailRedirectToBase}?next=${encodeURIComponent(redirectTo)}`
        : emailRedirectToBase;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo,
            data: {
                slug,
                role,
            },
        },
    });

    if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
            return { success: false, error: "このメールアドレスはすでに登録されています" };
        }
        return { success: false, error: error.message };
    }

    if (!data.user) {
        return { success: false, error: "登録に失敗しました" };
    }

    const user = await createUser({
        authId: data.user.id,
        email,
        passwordHash: "supabase-auth",
        role,
        displayName: resolvedDisplayName,
        slug,
        region: resolvedRegion,
        referrerSlug: resolvedReferrerSlug,
        isFoundingMember,
    });
    if (!user) {
        return { success: false, error: "ユーザー作成に失敗しました" };
    }

    await rewardOnetimeMission(user.slug, "register_complete");

    return { success: true, slug: user.slug };
}

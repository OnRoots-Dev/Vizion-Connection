import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/supabase/data/users.server";
import { profileLimiter, getIp } from "@/lib/ratelimit";
import { rewardOnetimeMission } from "@/lib/onetime-missions";
import { validateCSRF } from "@/lib/security/csrf";
import { cleanupOrphanedStorageObjects, storageObjectPathFromPublicUrl } from "@/lib/supabase/storage-cleanup";

const PROFILE_BUCKET = "profiles";

/**
 * 単一スロット画像（avatar / profile(hero)）の置き換えで参照されなくなった旧アセットを purge する。
 * 安全条件: 旧URLが存在し / 新URLと異なり / 自分の slug 配下の profiles 管理URLとしてパス抽出できる
 * 場合のみ、その単一パスを対象にする（探索削除なし・新URLは決して対象にしない）。
 */
async function cleanupReplacedImage(slug: string, oldUrl: unknown, newUrl: unknown): Promise<void> {
    if (typeof oldUrl !== "string" || !oldUrl) return;
    // newUrl が文字列でない（未送信=undefined 等）場合は DB 未更新の可能性があるため対象外。
    // "" は明示削除（DB も空更新）なので従来通り purge 対象として続行する。
    if (typeof newUrl !== "string") return;
    if (newUrl === oldUrl) return; // 未変更

    const oldPath = storageObjectPathFromPublicUrl(oldUrl, PROFILE_BUCKET);
    if (!oldPath) return; // 外部URL等は対象外
    if (!oldPath.startsWith(`${slug}/`)) return; // 他ユーザー / 別構造（banner 等）は対象外

    const newPath = storageObjectPathFromPublicUrl(newUrl, PROFILE_BUCKET);
    if (newPath && newPath === oldPath) return; // 念のため新アセットは保持

    await cleanupOrphanedStorageObjects({ bucket: PROFILE_BUCKET, path: oldPath });
}

export async function POST(req: NextRequest) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { success } = await profileLimiter.limit(getIp(req));
    if (!success) return NextResponse.json({ error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });

    const body = await req.json();

    const ok = await updateUserProfile(user.slug, {
        displayName: body.displayName,
        bio: body.bio,
        region: body.region,
        prefecture: body.prefecture,
        location: body.location,
        sportsCategory: body.sportsCategory,
        sport: body.sport,
        sports: body.sports,
        stance: body.stance,
        claim: body.claim,
        instagram: body.instagram,
        xUrl: body.xUrl,
        tiktok: body.tiktok,
        profileImageUrl: body.profileImageUrl,
        bannerUrl: body.bannerUrl,
        avatarUrl: body.avatarUrl,
        ...(typeof body.isPublic === "boolean" ? { isPublic: body.isPublic } : {}),
    });

    // DB 更新が成功したときのみ、置き換えられた旧アセットを purge（dry-run 既定で実削除なし）。
    if (!ok) {
        return NextResponse.json(
            { ok: false, error: "プロフィールの保存に失敗しました" },
            { status: 500 },
        );
    }

    await cleanupReplacedImage(user.slug, user.avatarUrl, body.avatarUrl);
    await cleanupReplacedImage(user.slug, user.profileImageUrl, body.profileImageUrl);

    const hasProfileDetails = Boolean(body.bio || body.sport || body.region);
    if (hasProfileDetails) {
        await rewardOnetimeMission(user.slug, "profile_completed");
    }

    return NextResponse.json({ ok: true });
}

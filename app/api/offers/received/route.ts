import { NextResponse } from "next/server";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import { listReceivedOffers } from "@/lib/supabase/business-hub";

export async function GET() {
  try {
    const result = await getProfileFromSession();
    if (!result.success) {
      return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    }

    const profile = await findUserBySlug(result.data.profile.slug);
    if (!profile) {
      return NextResponse.json({ success: false, error: "プロフィールが見つかりません" }, { status: 404 });
    }

    const offers = await listReceivedOffers(profile);
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    console.error("[GET /api/offers/received]", error);
    return NextResponse.json({ success: false, error: "オファー一覧の取得に失敗しました" }, { status: 500 });
  }
}

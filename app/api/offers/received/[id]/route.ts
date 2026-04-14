import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProfileFromSession } from "@/features/profile/server/get-profile";
import { findUserBySlug } from "@/lib/supabase/data/users.server";
import { updateReceivedOfferStatus } from "@/lib/supabase/business-hub";

const schema = z.object({
  status: z.enum(["sent", "approved", "rejected"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await getProfileFromSession();
    if (!result.success) {
      return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
    }

    const profile = await findUserBySlug(result.data.profile.slug);
    if (!profile) {
      return NextResponse.json({ success: false, error: "プロフィールが見つかりません" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "入力内容を確認してください" }, { status: 400 });
    }

    const { id } = await params;
    const offer = await updateReceivedOfferStatus(profile, id, parsed.data.status);
    return NextResponse.json({ success: true, offer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    console.error("[PATCH /api/offers/received/[id]]", error);
    return NextResponse.json({ success: false, error: message === "オファーを更新できませんでした" ? message : "オファー更新に失敗しました" }, { status: 500 });
  }
}

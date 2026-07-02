import { NextRequest, NextResponse } from "next/server";
import { requireBusinessProfile } from "@/lib/auth/require-business-session";
import { endSponsorship } from "@/lib/supabase/business-sponsorships";
import { validateCSRF } from "@/lib/security/csrf";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const csrfError = validateCSRF(req);
    if (csrfError) return csrfError as unknown as NextResponse;

    try {
        const profile = await requireBusinessProfile();
        const { id } = await context.params;
        await endSponsorship(profile, id);
        return NextResponse.json({ success: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        if (message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });
        if (message === "FORBIDDEN") return NextResponse.json({ success: false, error: "Businessアカウントのみ利用できます" }, { status: 403 });
        return NextResponse.json({ success: false, error: "支援の終了に失敗しました" }, { status: 500 });
    }
}

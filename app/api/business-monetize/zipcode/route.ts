// app/api/business-monetize/zipcode/route.ts
// 郵便番号→住所の自動補完（外部 郵便番号API をサーバー側で呼び、日本の都道府県名へ正規化）。
// 店舗登録の郵便番号検索で使用。番地（address3 以降）まで確定できるとは限らないため、残りはユーザーが入力する。

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseProfile } from "@/lib/auth/session";
import { monetizeLimiter, getIp } from "@/lib/ratelimit";
import { ALL_PREFECTURES } from "@/features/place/geocode";

function normalizePostcode(raw: string | null): string | null {
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    return digits.length === 7 ? digits : null;
}

function matchPrefectureName(name: string | null): string | null {
    if (!name) return null;
    const first = name.slice(0, 3);
    return ALL_PREFECTURES.find((p) => first.includes(p) || p.includes(first)) ?? (ALL_PREFECTURES.includes(name) ? name : null);
}

export async function GET(req: NextRequest) {
    const user = await getSupabaseProfile();
    if (!user) return NextResponse.json({ success: false, error: "ログインが必要です" }, { status: 401 });

    const { success } = await monetizeLimiter.limit(getIp(req));
    if (!success) {
        return NextResponse.json({ success: false, error: "しばらく時間をおいてから再度お試しください" }, { status: 429 });
    }

    const postcode = normalizePostcode(new URL(req.url).searchParams.get("zipcode"));
    if (!postcode) {
        return NextResponse.json({ success: false, error: "郵便番号（7桁）を入力してください" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postcode}`, {
            signal: AbortSignal.timeout(5000),
            cache: "no-store",
        });
        if (!res.ok) {
            return NextResponse.json({ success: false, error: "住所の検索に失敗しました。時間をおいて再試行してください" }, { status: 502 });
        }
        const data = (await res.json()) as {
            status?: number;
            message?: string | null;
            results?: Array<{ address1: string | null; address2: string | null; address3: string | null }> | null;
        };

        if (data.status !== 200 || !data.results || data.results.length === 0) {
            return NextResponse.json({
                success: false,
                error: data.message ?? "該当する住所が見つかりませんでした。郵便番号をご確認ください",
            }, { status: 404 });
        }

        const r = data.results[0];
        return NextResponse.json({
            success: true,
            match: {
                prefecture: matchPrefectureName(r.address1 ?? null),
                city: r.address2 ?? null,
                town: r.address3 ?? null,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "UNKNOWN";
        console.error("[zipcode]", message);
        return NextResponse.json({ success: false, error: "住所の検索に失敗しました。時間をおいて再試行してください" }, { status: 502 });
    }
}

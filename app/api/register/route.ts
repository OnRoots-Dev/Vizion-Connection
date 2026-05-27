// app/api/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/features/auth/server/register";
import type { RegisterInput } from "@/features/auth/types";
import { validateCSRF } from "@/lib/security/csrf";
import { readLimitedJson, PayloadTooLargeError } from "@/lib/security/body";
import { z } from "zod";

const schema = z.object({
    email: z.string().email().max(320),
    password: z.string().min(8).max(100),
    role: z.enum(["Athlete", "Trainer", "Crew", "Business"]),
    region: z.enum(["北海道", "東北", "関東", "中部", "近畿", "中国・四国", "九州・沖縄"]).optional(),
    displayName: z.string().max(120).optional(),
    slug: z.string().min(1).max(64),
    referrerSlug: z.string().max(64).optional(),
    redirectTo: z.string().max(500).optional(),
    termsAccepted: z.literal(true),
}).strict();

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const csrfError = validateCSRF(req);
        if (csrfError) return csrfError as unknown as NextResponse;

        let body: unknown;
        try {
            body = await readLimitedJson(req);
        } catch (e) {
            if (e instanceof PayloadTooLargeError) {
                return new NextResponse("Payload too large", { status: 413 });
            }
            return new NextResponse("Bad request", { status: 400 });
        }

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                { success: false, error: "リクエストが不正です" },
                { status: 400 }
            );
        }

        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ success: false, error: "リクエストが不正です" }, { status: 400 });
        const input = parsed.data as RegisterInput;
        const result = await registerUser(input);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        console.error("[POST /api/register]", err);

        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : "サーバーエラーが発生しました",
            },
            { status: 500 }
        );
    }
}

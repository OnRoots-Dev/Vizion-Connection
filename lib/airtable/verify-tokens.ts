// lib/airtable/verify-tokens.ts

import { airtableBase } from "@/lib/airtable/client";
import type { VerifyTokenRecord } from "@/features/auth/types";

const TABLE = "VerifyTokens";

function toTokenRecord(record: Airtable.Record<Airtable.FieldSet>): VerifyTokenRecord {
    const f = record.fields;
    return {
        id: record.id,
        token: (f["token"] as string) ?? "",
        email: (f["email"] as string) ?? "",
        slug: (f["slug"] as string) ?? "",
        used: (f["used"] as boolean) ?? false,
        createdAt: (f["createdAt"] as string) ?? "",
    };
}

export async function createVerifyToken(
    token: string,
    email: string,
    slug: string
): Promise<VerifyTokenRecord> {
    const record = await airtableBase(TABLE).create({
        token,
        email,
        slug,
        used: false,
        createdAt: new Date().toISOString(),
    });

    return toTokenRecord(record);
}

export async function findVerifyToken(token: string): Promise<VerifyTokenRecord | null> {
    const records = await airtableBase(TABLE)
        .select({
            filterByFormula: `{token} = "${token}"`,
            maxRecords: 1,
        })
        .firstPage();

    if (records.length === 0) return null;
    return toTokenRecord(records[0]);
}

export async function markTokenUsed(id: string): Promise<void> {
    await airtableBase(TABLE).update(id, { used: true });
}
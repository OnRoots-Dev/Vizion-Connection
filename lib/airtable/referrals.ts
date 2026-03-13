// lib/airtable/referrals.ts

import { airtableBase } from "./client";

const TABLE = "Referrals";

export interface ReferralRecord {
    id: string;
    referrerSlug: string;
    referredSlug: string;
    referredEmail: string;
    referredRole: string;
    status: string;
    pointsAwarded: number;
    createdAt: string;
}

export async function createReferral(input: {
    referrerSlug: string;
    referredSlug: string;
    referredEmail: string;
    referredRole: string;
    status: string;
    pointsAwarded: number;
}): Promise<ReferralRecord> {
    const record = await airtableBase(TABLE).create({
        referrerSlug: input.referrerSlug,
        referredSlug: input.referredSlug,
        referredEmail: input.referredEmail,
        referredRole: input.referredRole,
        status: input.status,
        pointsAwarded: input.pointsAwarded,
        createdAt: new Date().toISOString(),
    });

    return {
        id: record.id,
        referrerSlug: record.get("referrerSlug") as string,
        referredSlug: record.get("referredSlug") as string,
        referredEmail: record.get("referredEmail") as string,
        referredRole: record.get("referredRole") as string,
        status: record.get("status") as string,
        pointsAwarded: record.get("pointsAwarded") as number,
        createdAt: record.get("createdAt") as string,
    };
}

export async function findReferralByReferredSlug(
    referredSlug: string
): Promise<ReferralRecord | null> {
    const records = await airtableBase(TABLE)
        .select({
            filterByFormula: `{referredSlug} = "${referredSlug}"`,
            maxRecords: 1,
        })
        .firstPage();

    if (!records.length) return null;
    const r = records[0];

    return {
        id: r.id,
        referrerSlug: r.get("referrerSlug") as string,
        referredSlug: r.get("referredSlug") as string,
        referredEmail: r.get("referredEmail") as string,
        referredRole: r.get("referredRole") as string ?? "",
        status: r.get("status") as string,
        pointsAwarded: r.get("pointsAwarded") as number,
        createdAt: r.get("createdAt") as string,
    };
}

export async function countReferralsBySlug(referrerSlug: string): Promise<number> {
  const records = await airtableBase(TABLE)
    .select({
      filterByFormula: `{referrerSlug} = "${referrerSlug}"`,
    })
    .all();

  return records.length;
}
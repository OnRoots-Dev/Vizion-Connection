// lib/airtable/users.ts

import Airtable from "airtable";
import { airtableBase } from "@/lib/airtable/client";
import type { UserRecord, UserRole } from "@/features/auth/types";
import { string } from "zod";

const TABLE = "Users";

// ── VZ番号生成 ──
function generateVzId(): string {
    const rand = (n: number) => Math.floor(Math.random() * Math.pow(10, n)).toString().padStart(n, "0");
    return `VZ${rand(5)}-${rand(4)}-${rand(5)}`;
}

// ── Founding Member 判定（ロールごとに100人まで）──
async function checkIsFoundingMember(role: string): Promise<boolean> {
    const records = await airtableBase(TABLE)
        .select({
            filterByFormula: `AND({role} = "${role}", {isFoundingMember} = TRUE())`,
        })
        .all();
    return records.length < 100;
}

function toUserRecord(record: Airtable.Record<Airtable.FieldSet>): UserRecord {
    const f = record.fields;
    return {
        id: record.id,
        email: (f["email"] as string) ?? "",
        passwordHash: (f["passwordHash"] as string) ?? "",
        role: (f["role"] as UserRole) ?? "Members",
        displayName: (f["displayName"] as string) ?? "",
        slug: (f["slug"] as string) ?? "",
        verified: (f["verified"] as boolean) ?? false,
        points: (f["points"] as number) ?? 0,
        referrerSlug: (f["referrerSlug"] as string) || undefined,
        createdAt: (f["createdAt"] as string) ?? "",
        serialId: (f["serialId"] as string) || undefined,
        profileImageUrl: (f["profileImageUrl"] as string) || undefined,
        avatarUrl: (f["avatarUrl"] as string) || undefined,
        bio: (f["bio"] as string) || undefined,
        region: (f["region"] as string) || undefined,
        prefecture: (f["prefecture"] as string) || undefined,
        sportsCategory: (f["sportsCategory"] as string) || undefined,
        sport: (f["sport"] as string) || undefined,
        stance: (f["stance"] as string) || undefined,
        instagram: (f["instagram"] as string) || undefined,
        xUrl: (f["xUrl"] as string) || undefined,
        tiktok: (f["tiktok"] as string) || undefined,
        cheerCount: (f["cheerCount"] as number) ?? 0,
        missionBonusGiven: (f["missionBonusGiven"] as boolean) ?? false,
        isFoundingMember: (f["isFoundingMember"] as boolean) ?? false,
        isPublic: (f["isPublic"] as boolean) ?? true,
        isDeleted: (f["isDeleted"] as boolean) ?? false,
        lastLoginAt: (f["lastLoginAt"] as string) || undefined,
        ambassadorCode: (f["ambassadorCode"] as string) || undefined,
    };
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `AND({email} = "${email}", {isDeleted} != TRUE())`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) return null;
    return toUserRecord(records[0]);
}

export async function findUserBySlug(slug: string): Promise<UserRecord | null> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `AND({slug} = "${slug}", {isDeleted} != TRUE())`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) return null;
    return toUserRecord(records[0]);
}

export interface CreateUserInput {
    email: string;
    passwordHash: string;
    role: UserRole;
    displayName: string;
    slug: string;
    referrerSlug?: string;
    serialId: string;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
    const isFoundingMember = await checkIsFoundingMember(input.role);
    const record = await airtableBase(TABLE).create({
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        displayName: input.displayName,
        slug: input.slug,
        verified: false,
        points: 0,
        referrerSlug: input.referrerSlug ?? "",
        createdAt: new Date().toISOString(),
        ...(input.serialId ? { serialId: input.serialId } : {}),  // ← ここ
        isFoundingMember,
        isPublic: true,
    });
    return toUserRecord(record);
}

export async function markUserVerified(email: string): Promise<void> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) throw new Error("User not found");
    await airtableBase(TABLE).update(records[0].id, { verified: true });
}

export async function addPointsToUser(slug: string, points: number): Promise<void> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `{slug} = "${slug}"`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) throw new Error("User not found");
    const current = (records[0].fields["points"] as number) ?? 0;
    await airtableBase(TABLE).update(records[0].id, { points: current + points });
}

export async function updateUserProfile(
    recordId: string,
    data: Partial<Pick<UserRecord,
        "displayName" | "bio" | "region" | "prefecture" |
        "sportsCategory" | "sport" | "stance" |
        "instagram" | "xUrl" | "tiktok" |
        "profileImageUrl" | "avatarUrl" | "isPublic"
    >>
): Promise<void> {
    const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
    );
    await airtableBase(TABLE).update(recordId, payload);
}

export async function updateUserPoints(
    slug: string,
    newPoints: number,
    extra?: { missionBonusGiven?: boolean }
): Promise<void> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `{slug} = "${slug}"`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) throw new Error("User not found");
    const fields: Airtable.FieldSet = { points: newPoints };
    if (extra?.missionBonusGiven !== undefined) {
        fields["missionBonusGiven"] = extra.missionBonusGiven;
    }
    await airtableBase(TABLE).update(records[0].id, fields);
}

export async function deactivateUser(recordId: string): Promise<void> {
    await airtableBase(TABLE).update(recordId, {
        isDeleted: true,
        isPublic: false,
        deletedAt: new Date().toISOString(),
    });
}

export async function updateLastLogin(recordId: string): Promise<void> {
    await airtableBase(TABLE).update(recordId, {
        lastLoginAt: new Date().toISOString(),
    });
}

export async function findUserByAmbassadorCode(code: string): Promise<UserRecord | null> {
    const records = await airtableBase(TABLE)
        .select({ filterByFormula: `{ambassadorCode} = "${code}"`, maxRecords: 1 })
        .firstPage();
    if (records.length === 0) return null;
    return toUserRecord(records[0]);
}

export async function getNextSerialId(): Promise<string> {
    const records = await airtableBase(TABLE)
        .select({ fields: ["serialId"], filterByFormula: `{isDeleted} != TRUE()` })
        .all();
    const max = records.reduce((acc, r) => {
        const n = parseInt((r.fields["serialId"] as string) ?? "0", 10);
        return n > acc ? n : acc;
    }, 0);
    return String(max + 1).padStart(5, "0"); // 例: "00001"
}
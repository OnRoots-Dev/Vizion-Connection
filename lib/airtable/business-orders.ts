// lib/airtable/business-orders.ts

import { airtableBase } from "./client";
import type { PlanId } from "@/features/business/types";

const TABLE = "BusinessOrders";

export interface BusinessOrderRecord {
  id: string;
  email: string;
  slug: string;
  planId: PlanId;
  planName: string;
  amount: number;
  status: string;
  squareLink: string;
  createdAt: string;
}

export async function createBusinessOrder(input: {
  email: string;
  slug: string;
  planId: PlanId;
  planName: string;
  amount: number;
  status: string;
  squareLink: string;
}): Promise<BusinessOrderRecord> {
  const record = await airtableBase(TABLE).create({
    email: input.email,
    slug: input.slug,
    planId: input.planId,
    planName: input.planName,
    amount: input.amount,
    status: input.status,
    squareLink: input.squareLink,
    createdAt: new Date().toISOString(),
  });

  return {
    id: record.id,
    email: record.get("email") as string,
    slug: record.get("slug") as string,
    planId: record.get("planId") as PlanId,
    planName: record.get("planName") as string,
    amount: record.get("amount") as number,
    status: record.get("status") as string,
    squareLink: record.get("squareLink") as string,
    createdAt: record.get("createdAt") as string,
  };
}

// プランごとの購入済み数を取得
export async function countOrdersByPlanId(planId: PlanId): Promise<number> {
  const records = await airtableBase(TABLE)
    .select({
      filterByFormula: `{planId} = "${planId}"`,
    })
    .all();

  return records.length;
}

// 全プランの購入済み数を一括取得
export async function getAllPlanOrderCounts(): Promise<Record<PlanId, number>> {
  const records = await airtableBase(TABLE).select().all();

  const counts: Record<string, number> = {};
  for (const record of records) {
    const planId = record.get("planId") as string;
    if (planId) {
      counts[planId] = (counts[planId] ?? 0) + 1;
    }
  }

  return counts as Record<PlanId, number>;
}
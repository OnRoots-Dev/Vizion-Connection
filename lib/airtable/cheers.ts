// lib/airtable/cheers.ts

import { airtableBase } from "@/lib/airtable/client";
import type Airtable from "airtable";

const TABLE = "Cheers";

export interface CheerRecord {
  id: string;
  fromSlug?: string;
  toSlug: string;
  createdAt: string;
}

function toCheerRecord(
  record: Airtable.Record<Airtable.FieldSet>
): CheerRecord {
  const f = record.fields;
  return {
    id: record.id,
    fromSlug: (f["fromSlug"] as string) ?? "",
    toSlug: (f["toSlug"] as string) ?? "",
    createdAt: (f["createdAt"] as string) ?? "",
  };
}

export async function createCheer(fromSlug: string, toSlug: string): Promise<CheerRecord> {
  const record = await airtableBase(TABLE).create({
    fromSlug,
    toSlug,
    createdAt: new Date().toISOString(),
  });
  return toCheerRecord(record);
}

export async function countCheers(toSlug: string): Promise<number> {
  const records = await airtableBase(TABLE)
    .select({
      filterByFormula: `{toSlug} = "${toSlug}"`,
    })
    .all();
  return records.length;
}

export async function hasAlreadyCheered(fromSlug: string, toSlug: string): Promise<boolean> {
  const records = await airtableBase(TABLE)
    .select({
      filterByFormula: `AND({fromSlug} = "${fromSlug}", {toSlug} = "${toSlug}")`,
      maxRecords: 1,
    })
    .firstPage();
  return records.length > 0;
}
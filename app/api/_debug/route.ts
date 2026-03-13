import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ?? null,
    AIRTABLE_USERS_TABLE: process.env.AIRTABLE_USERS_TABLE ?? null,
    AIRTABLE_CHEERS_TABLE: process.env.AIRTABLE_CHEERS_TABLE ?? null,
    HAS_TOKEN: Boolean(process.env.AIRTABLE_TOKEN),
    TOKEN_LEN: process.env.AIRTABLE_TOKEN?.length ?? 0,
  });
}
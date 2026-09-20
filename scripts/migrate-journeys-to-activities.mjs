#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL;
const sqlFile = resolve(process.env.JOURNEY_MIGRATION_SQL ?? "scripts/migrate-journeys-to-activities.sql");

function createClient() {
  const requiresSsl = /sslmode=require/i.test(databaseUrl) || process.env.PGSSLMODE === "require";
  return new Client({ connectionString: databaseUrl, ssl: requiresSsl ? { rejectUnauthorized: false } : undefined });
}

if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is required.");
  process.exit(1);
}

const client = createClient();
try {
  const sql = readFileSync(sqlFile, "utf8").replace(/^\\set\s+ON_ERROR_STOP\s+on\s*$/m, "");
  await client.connect();
  const results = await client.query(sql);
  for (const result of results) {
    if (result.command === "SELECT" && result.rows.length > 0) console.log(JSON.stringify(result.rows));
  }
  console.log(`Journey migration completed from ${sqlFile} (${sql.length} bytes SQL).`);
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}

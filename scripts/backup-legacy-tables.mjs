#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pg from "pg";

const { Client } = pg;
const requiredTables = [
  "journeys", "user_follows", "ads", "business_orders", "business_sponsorships",
  "portfolio_milestones",
];
const alreadyDroppedTables = ["events", "event_invites", "event_reminders"];
const sealedCandidates = [
  "user_onetime_mission_rewards", "discovery_events", "ad_events", "business_offers",
  "member_hub_events", "member_reward_definitions", "member_reward_unlocks",
  "trainer_clients", "trainer_sessions", "trainer_reviews", "news_posts",
  "news_post_comments", "openlab_posts", "openlab_upvotes", "mission_definitions",
  "user_mission_progress", "referrals", "card_collections",
];
const allTables = [...new Set([...requiredTables, ...alreadyDroppedTables, ...sealedCandidates])];
const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL;
const outputDir = resolve(process.env.BACKUP_OUTPUT_DIR ?? join("..", "vizion-connection-legacy-backup"));

function fail(message) { console.error(`ERROR: ${message}`); process.exitCode = 1; }
function assertIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Invalid SQL identifier: ${value}`);
  return `"${value.replaceAll('"', '""')}"`;
}
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object" && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString("base64");
  return value;
}
function rowText(row) { return JSON.stringify(stableValue(row)); }
function checksum(rows) {
  return createHash("md5").update(rows.map((row) => createHash("md5").update(rowText(row)).digest("hex")).sort().join("")).digest("hex");
}
function createClient() {
  const requiresSsl = /sslmode=require/i.test(databaseUrl) || process.env.PGSSLMODE === "require";
  return new Client({ connectionString: databaseUrl, ssl: requiresSsl ? { rejectUnauthorized: false } : undefined });
}

if (!databaseUrl) {
  fail("DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is required. Do not use the Supabase service-role key here.");
  process.exit(1);
}

const client = createClient();
try {
  mkdirSync(outputDir, { recursive: true });
  await client.connect();
  const existingResult = await client.query(
    "select table_name from information_schema.tables where table_schema = $1 and table_name = any($2::text[]) order by table_name",
    ["public", allTables],
  );
  const existing = existingResult.rows.map((row) => row.table_name);
  const existingSet = new Set(existing);
  const missingRequired = requiredTables.filter((table) => !existingSet.has(table));
  if (missingRequired.length > 0) throw new Error(`Required tables missing in target DB: ${missingRequired.join(", ")}`);

  const manifest = alreadyDroppedTables.map((table) => ({
    table,
    exists: false,
    status: "SKIPPED",
    reason: "already dropped by migration 20260629000000_drop_dead_tables.sql",
  }));
  const missing = allTables.filter((table) => !existingSet.has(table) && !alreadyDroppedTables.includes(table));
  for (const table of existing.filter((table) => !alreadyDroppedTables.includes(table))) {
    const quotedTable = assertIdentifier(table);
    const result = await client.query(`select * from public.${quotedTable}`);
    const columns = result.fields.map((field) => field.name);
    const rows = result.rows;
    const outputFile = join(outputDir, `${table}.json`);
    const payload = { table, columns, rows };
    writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    const countResult = await client.query(`select count(*)::bigint as count from public.${quotedTable}`);
    const count = Number(countResult.rows[0].count);
    const rowChecksum = checksum(rows);
    const sample = [...rows].sort((a, b) => rowText(a).localeCompare(rowText(b))).slice(0, 5).map(rowText);
    const status = count === rows.length ? "PASS" : "FAIL";
    manifest.push({ table, exists: true, count, dumpRows: rows.length, checksum: rowChecksum, sample, status, file: outputFile });
    console.log(`${status} ${table}: SELECT COUNT(*)=${count}, dump rows=${rows.length}`);
    if (status === "FAIL") process.exitCode = 1;
  }
  writeFileSync(join(outputDir, "manifest.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), tables: manifest, missing }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  writeFileSync(join(outputDir, "README.txt"), "CONFIDENTIAL BACKUP. Move this directory to approved external storage after verification. Do not commit it to the repository.\n", { encoding: "utf8", flag: "wx" });
  if (missing.length > 0) console.log(`SKIP missing tables: ${missing.join(", ")}`);
  console.log(`Backup complete: ${manifest.length} table(s) written to ${outputDir}`);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  await client.end().catch(() => undefined);
}

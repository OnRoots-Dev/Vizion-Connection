#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pg from "pg";

const { Client } = pg;
const args = new Set(process.argv.slice(2));
const backupDirArg = process.argv.find((arg) => arg.startsWith("--backup-dir="));
const backupDir = resolve(backupDirArg ? backupDirArg.slice("--backup-dir=".length) : process.env.BACKUP_OUTPUT_DIR ?? join("..", "vizion-connection-legacy-backup"));
const databaseUrl = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL;
const allowNonEmpty = args.has("--truncate");
const confirm = process.env.RESTORE_CONFIRM === "YES";

function fail(message) { console.error(`ERROR: ${message}`); process.exitCode = 1; }
function assertIdentifier(value) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error(`Invalid SQL identifier: ${value}`);
  return `"${value.replaceAll('"', '""')}"`;
}
function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object" && !(value instanceof Date) && !Buffer.isBuffer(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  if (value instanceof Date) return value.toISOString();
  if (Buffer.isBuffer(value)) return value.toString("base64");
  return value;
}
function rowText(row) { return JSON.stringify(stableValue(row)); }
function checksum(rows) { return createHash("md5").update(rows.map((row) => createHash("md5").update(rowText(row)).digest("hex")).sort().join("")).digest("hex"); }
function createClient() {
  const requiresSsl = /sslmode=require/i.test(databaseUrl) || process.env.PGSSLMODE === "require";
  return new Client({ connectionString: databaseUrl, ssl: requiresSsl ? { rejectUnauthorized: false } : undefined });
}
function quoteTable(table) { return `public.${assertIdentifier(table)}`; }

if (!databaseUrl) { fail("DATABASE_URL, SUPABASE_DB_URL, or POSTGRES_URL is required."); process.exit(1); }
if (!confirm) { fail("Set RESTORE_CONFIRM=YES after verifying the target environment. No restore was attempted."); process.exit(1); }

const client = createClient();
try {
  const manifestPath = join(backupDir, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`manifest.json not found: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const tables = manifest.tables ?? [];
  if (!Array.isArray(tables) || tables.length === 0) throw new Error("manifest.json contains no tables");

  const names = tables.map((entry) => entry.table);
  await client.connect();
  const existingResult = await client.query("select table_name from information_schema.tables where table_schema = $1 and table_name = any($2::text[])", ["public", names]);
  const existing = new Set(existingResult.rows.map((row) => row.table_name));
  const missing = names.filter((name) => !existing.has(name));
  if (missing.length > 0) throw new Error(`Target schema is missing tables: ${missing.join(", ")}. Restore schema/migrations before data.`);

  const currentCounts = new Map();
  for (const name of names) currentCounts.set(name, Number((await client.query(`select count(*)::bigint as count from ${quoteTable(name)}`)).rows[0].count));
  const nonEmpty = [...currentCounts].filter(([, count]) => count > 0);
  if (nonEmpty.length > 0 && !allowNonEmpty) throw new Error(`Target tables are not empty: ${nonEmpty.map(([name, count]) => `${name}=${count}`).join(", ")}. Use --truncate only after explicit approval.`);
  if (allowNonEmpty) await client.query(`truncate table ${names.map(quoteTable).join(", ")} restart identity`);

  const restoreOrder = ["journeys", "user_follows", "events", "business_orders", "business_sponsorships", "portfolio_milestones", "ads", "event_invites", "event_reminders"];
  const ordered = [...tables].sort((a, b) => (restoreOrder.indexOf(a.table) + 1 || 100) - (restoreOrder.indexOf(b.table) + 1 || 100));
  for (const entry of ordered) {
    const jsonFile = join(backupDir, `${entry.table}.json`);
    const sqlFile = join(backupDir, `${entry.table}.sql`);
    if (existsSync(jsonFile)) {
      const dump = JSON.parse(readFileSync(jsonFile, "utf8"));
      const columns = dump.columns ?? [];
      if (dump.table !== entry.table || !Array.isArray(columns) || !Array.isArray(dump.rows)) throw new Error(`Invalid dump format: ${jsonFile}`);
      if (columns.length > 0 && dump.rows.length > 0) {
        const columnSql = columns.map(assertIdentifier).join(", ");
        for (const row of dump.rows) {
          const values = columns.map((column) => row[column] ?? null);
          const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
          await client.query(`insert into ${quoteTable(entry.table)} (${columnSql}) values (${placeholders})`, values);
        }
      }
    } else if (existsSync(sqlFile)) {
      // Backward compatibility for P0-1 dumps created before the JSON format.
      await client.query(readFileSync(sqlFile, "utf8"));
    } else {
      throw new Error(`Dump file not found: ${jsonFile}`);
    }
    console.log(`RESTORED ${entry.table}`);
  }

  let failed = false;
  for (const entry of tables) {
    const table = quoteTable(entry.table);
    const count = Number((await client.query(`select count(*)::bigint as count from ${table}`)).rows[0].count);
    const result = await client.query(`select * from ${table}`);
    const currentChecksum = checksum(result.rows);
    const countOk = count === entry.count;
    const checksumAvailable = typeof entry.checksum === "string" && entry.checksum.length > 0;
    const checksumOk = !checksumAvailable || currentChecksum === entry.checksum;
    const status = countOk && checksumOk ? "PASS" : "FAIL";
    const checksumStatus = checksumAvailable ? (checksumOk ? "match" : "mismatch") : "unavailable";
    console.log(`${status} ${entry.table}: count=${count}/${entry.count}, checksum=${checksumStatus}`);
    if (status === "FAIL") failed = true;
  }
  if (failed) process.exitCode = 1;
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  await client.end().catch(() => undefined);
}

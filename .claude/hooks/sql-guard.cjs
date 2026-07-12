#!/usr/bin/env node
/**
 * PreToolUse hook: destructive-SQL gate.
 * Matcher: mcp__.*__(execute_sql|apply_migration)
 *
 * stdin  : Claude Code hook JSON ({ tool_name, tool_input: { query, ... } })
 * stdout : hookSpecificOutput JSON (permissionDecision: "deny" | "ask") — 何も出力しなければ素通し
 *
 * deny = SECURITY.md の RLS 恒久ルール違反（クライアントロールへの書き込み GRANT / 全開ポリシー）
 * ask  = 破壊的 SQL（DROP/TRUNCATE/WHERE なし DELETE・UPDATE/カラム破壊/PII テーブルへの変更）
 *
 * 制限: $$...$$ (dollar-quoted) 関数本体は誤検知回避のため判定対象から除外している。
 */
"use strict";

const PII_TABLES = ["USERS", "CONTACTS", "BUSINESS_ORDERS"];

function readStdin() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });
}

function normalize(sql) {
  return sql
    .replace(/\$[A-Za-z_]*\$[\s\S]*?\$[A-Za-z_]*\$/g, " 'FNBODY' ") // dollar-quoted bodies
    .replace(/--[^\n]*/g, " ")                                        // line comments
    .replace(/\/\*[\s\S]*?\*\//g, " ")                                // block comments
    .replace(/'(?:[^']|'')*'/g, "'LIT'")                              // string literals
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function checkStatement(st) {
  const deny = [];
  const ask = [];

  // ---- deny: RLS permanent rules (SECURITY.md) ----
  if (/\bGRANT\s+(?:INSERT|UPDATE|DELETE|ALL)\b[\s\S]*\bTO\b[\s\S]*\b(?:ANON|AUTHENTICATED|PUBLIC)\b/.test(st)) {
    deny.push("anon/authenticated/public への書き込みGRANTは恒久的に禁止（SECURITY.md）");
  }
  if (
    /\b(?:CREATE|ALTER)\s+POLICY\b/.test(st) &&
    /\bFOR\s+(?:INSERT|UPDATE|DELETE|ALL)\b/.test(st) &&
    /(?:USING|WITH\s+CHECK)\s*\(\s*TRUE\s*\)/.test(st)
  ) {
    deny.push("書き込み系コマンドの USING(true)/WITH CHECK(true) ポリシーは禁止（SECURITY.md）");
  }

  // ---- ask: destructive DDL/DML — human confirmation required ----
  if (/\bDROP\s+(?:TABLE|SCHEMA|DATABASE|ROLE|POLICY)\b/.test(st)) {
    ask.push("DROP（TABLE/SCHEMA/DATABASE/ROLE/POLICY）");
  }
  if (/\bTRUNCATE\b/.test(st)) {
    ask.push("TRUNCATE（全行削除）");
  }
  if (/\bDELETE\s+FROM\b/.test(st) && !/\bWHERE\b/.test(st)) {
    ask.push("WHERE句のないDELETE");
  }
  if (/\bUPDATE\s+\S+\s+SET\b/.test(st) && !/\bWHERE\b/.test(st)) {
    ask.push("WHERE句のないUPDATE");
  }
  if (/\bALTER\s+TABLE\b[\s\S]*\bDROP\s+(?:COLUMN|CONSTRAINT)\b/.test(st)) {
    ask.push("ALTER TABLE ... DROP COLUMN/CONSTRAINT");
  }
  const piiPattern = new RegExp(
    String.raw`\b(?:DELETE\s+FROM|UPDATE)\s+(?:ONLY\s+)?(?:PUBLIC\s*\.\s*)?"?(?:${PII_TABLES.join("|")})"?\b`
  );
  if (piiPattern.test(st)) {
    ask.push("PIIテーブル（users/contacts/business_orders）への DELETE/UPDATE");
  }

  return { deny, ask };
}

(async () => {
  let data;
  try {
    data = JSON.parse(await readStdin());
  } catch {
    process.exit(0); // 解析不能なら素通し（permission フロー側で判断される）
  }
  const query = (data && data.tool_input && (data.tool_input.query || data.tool_input.sql)) || "";
  if (!query) process.exit(0);

  const statements = normalize(query).split(";").map((s) => s.trim()).filter(Boolean);
  const deny = [];
  const ask = [];
  for (const st of statements) {
    const r = checkStatement(st);
    deny.push(...r.deny);
    ask.push(...r.ask);
  }

  if (deny.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "[sql-guard] 禁止SQLを検出: " + [...new Set(deny)].join(" / ") +
          "。SECURITY.md と .claude/rules/db-and-rls.md を参照。代替案（service role 経由の書き込み、列スコープ付きポリシー、SECURITY DEFINER RPC）を検討すること。",
      },
    }));
  } else if (ask.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          "[sql-guard] 破壊的SQLを検出: " + [...new Set(ask)].join(" / ") +
          "。実行には人間の明示的な承認が必要（.claude/skills/db-migration/SKILL.md の手順に従うこと）。",
      },
    }));
  }
  process.exit(0);
})();

#!/usr/bin/env node
/**
 * PreToolUse hook: PII / secret leak gate.
 * Matcher: Write|Edit（書き込み内容の検査）および Bash|PowerShell（git commit の検査）
 *
 * 詳細ルールは .claude/rules/pii-handling.md を参照。
 */
"use strict";

const { execSync } = require("node:child_process");

const SECRET_PATTERNS = [
  { re: /sbp_[A-Za-z0-9]{16,}/, label: "Supabase アクセストークン (sbp_...)" },
  { re: /eyJ[A-Za-z0-9_-]{30,}\./, label: "JWT（service role キー等）" },
  { re: /\bre_[A-Za-z0-9]{16,}/, label: "Resend API キー (re_...)" },
  { re: /AKIA[0-9A-Z]{16}/, label: "AWS アクセスキー" },
  { re: /"[^"]*(KEY|TOKEN|SECRET|PASSWORD)[^"]*"\s*:\s*"(?!\$\{)[^"]{20,}"/i, label: "シークレットらしき値の直書き（${ENV_VAR} 参照でないもの）" },
];

// PII フィールドを console 出力するコード（rules/pii-handling.md のログ出力禁止リスト）
const PII_LOG_PATTERNS = [
  { re: /console\.(log|error|warn|info|debug)\s*\([^)]*\b(email|phone|address|password|token|first_name|last_name|firstName|lastName)\b/i, label: "PIIフィールドの console 出力" },
  { re: /console\.(log|error|warn|info|debug)\s*\([^)]*JSON\.stringify\s*\(\s*(user|profile|contact|order|body|payload)\b/i, label: "ユーザー/注文オブジェクト全体の console 出力" },
];

// シークレット直書き検査の対象となる設定ファイル
const CONFIG_FILE = /(^|[\\/])(\.mcp\.json|launch\.json|settings(\.local)?\.json)$|[\\/]\.claude[\\/].*\.json$/i;
const CODE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

function deny(reason) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "[pii-guard] " + reason + "（詳細: .claude/rules/pii-handling.md）",
    },
  }));
  process.exit(0);
}

function scan(text, patterns) {
  for (const p of patterns) {
    if (p.re.test(text)) return p.label;
  }
  return null;
}

function readStdin() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });
}

function checkWrite(toolInput) {
  const filePath = toolInput.file_path || "";
  const content = [toolInput.content, toolInput.new_string]
    .filter((v) => typeof v === "string")
    .join("\n");
  if (!filePath || !content) return;

  if (CONFIG_FILE.test(filePath)) {
    const hit = scan(content, SECRET_PATTERNS);
    if (hit) deny(`設定ファイル ${filePath} への直書きを検出: ${hit}。値は環境変数に置き、\${ENV_VAR} で参照すること。`);
  }
  if (CODE_FILE.test(filePath) && !/[\\/]\.claude[\\/]/.test(filePath)) {
    const hit = scan(content, PII_LOG_PATTERNS);
    if (hit) deny(`${filePath} に ${hit} を検出。PIIはログに出さない。必要ならマスキング（例: k***@example.com）した値のみ出力すること。`);
    const secretHit = scan(content, SECRET_PATTERNS);
    if (secretHit) deny(`${filePath} にシークレット直書きを検出: ${secretHit}。lib/env.ts 経由で環境変数から読むこと。`);
  }
}

function checkGitCommit(command) {
  if (!/\bgit\s+([\s\S]*\s)?commit\b/.test(command)) return;
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  let names = "";
  let diff = "";
  try {
    names = execSync("git diff --cached --name-only", { cwd, encoding: "utf8", timeout: 15000 });
    diff = execSync("git diff --cached -U0", { cwd, encoding: "utf8", timeout: 15000, maxBuffer: 32 * 1024 * 1024 });
  } catch {
    return; // git が使えない状況では素通し（通常の permission フローに任せる）
  }
  const badFile = names.split(/\r?\n/).find((n) => /^\.env(\.[\w.-]+)?$|\.pem$/i.test(n.trim()));
  if (badFile) deny(`コミットに機密ファイル ${badFile} がステージされている。git restore --staged で外すこと。`);

  const addedLines = diff.split(/\r?\n/).filter((l) => l.startsWith("+") && !l.startsWith("+++")).join("\n");
  const secretHit = scan(addedLines, SECRET_PATTERNS);
  if (secretHit) deny(`コミットの追加行にシークレットを検出: ${secretHit}。環境変数参照に置き換えてからコミットすること。`);
  const piiHit = scan(addedLines, PII_LOG_PATTERNS);
  if (piiHit) deny(`コミットの追加行に ${piiHit} を検出。該当の console 出力を削除またはマスキングすること。`);
}

(async () => {
  let data;
  try {
    data = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }
  const toolName = (data && data.tool_name) || "";
  const toolInput = (data && data.tool_input) || {};

  if (toolName === "Write" || toolName === "Edit") {
    checkWrite(toolInput);
  } else if (toolName === "Bash" || toolName === "PowerShell") {
    checkGitCommit(toolInput.command || "");
  }
  process.exit(0);
})();

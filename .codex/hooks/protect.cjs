#!/usr/bin/env node
/**
 * PreToolUse hook: destructive shell-command gate.
 * Matcher: Bash|PowerShell
 *
 * deny: ルート・.git・.env系・.mcp.json・settings系json・pem の削除/上書き、git clean -x、supabase db reset
 * ask : git push --force / git reset --hard / git clean -f / supabase db push
 */
"use strict";

function readStdin() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (d) => (buf += d));
    process.stdin.on("end", () => resolve(buf));
  });
}

// 削除系コマンドの検出（bash / PowerShell / cmd）
const DELETE_VERB = /\b(rm|del|erase|unlink|rd|rmdir|remove-item|ri)\b|git\s+rm\b/i;
// 保護対象ファイル（削除・上書き禁止）
const PROTECTED_FILE = /\.env(\.[\w.-]+)?\b|\.mcp\.json|settings(\.local)?\.json|\.pem\b/i;
// 危険なルート級ターゲット（単独トークンとして）
const DANGEROUS_TARGET = /(^|\s|["'])(\/|~\/?|\.|\.\.|\*|[A-Za-z]:[\\/]?)(["']|\s|$)|(^|\s|["'\\/])\.git([\\/"']|\s|$)/;

function check(cmd) {
  const deny = [];
  const ask = [];
  const c = cmd.trim();

  // rm -rf / Remove-Item -Recurse -Force / rd /s 系の再帰強制削除
  const recursiveDelete =
    /\brm\s+(-[a-zA-Z]+\s+)*-[a-zA-Z]*r[a-zA-Z]*\b/i.test(c) ||
    (/remove-item|\bri\b/i.test(c) && /-recurse\b/i.test(c)) ||
    /\b(rd|rmdir)\b.*\/s/i.test(c);

  if (recursiveDelete && DANGEROUS_TARGET.test(c.replace(/^.*?\b(rm|remove-item|ri|rd|rmdir)\b/i, ""))) {
    deny.push("ルート級ディレクトリ（/ ~ . .git ドライブルート等）への再帰削除");
  }
  if (DELETE_VERB.test(c) && PROTECTED_FILE.test(c)) {
    deny.push("保護対象ファイル（.env* / .mcp.json / settings*.json / *.pem）の削除");
  }
  if (/(^|[^>])>\s*["']?\.env/.test(c) || /\b(set-content|out-file|tee)\b[^|;]*\.env/i.test(c)) {
    deny.push("保護対象ファイル（.env*）への上書きリダイレクト");
  }
  if (/\bgit\s+clean\b/.test(c)) {
    if (/\s-[a-zA-Z]*x/.test(c)) {
      deny.push("git clean -x（gitignore対象の .env.local 等も消える）");
    } else {
      ask.push("git clean（未追跡ファイルの削除）");
    }
  }
  if (/\bsupabase\s+db\s+reset\b/i.test(c)) {
    deny.push("supabase db reset（DB全消去）");
  }
  if (/\bgit\s+push\b/.test(c) && /(\s--force(-with-lease)?\b|\s-f\b)/.test(c)) {
    ask.push("git push --force");
  }
  if (/\bgit\s+reset\s+--hard\b/.test(c)) {
    ask.push("git reset --hard（作業ツリーの変更破棄）");
  }
  if (/\bsupabase\s+db\s+push\b/i.test(c)) {
    ask.push("supabase db push（本番スキーマ変更）");
  }

  return { deny, ask };
}

(async () => {
  let data;
  try {
    data = JSON.parse(await readStdin());
  } catch {
    process.exit(0);
  }
  const cmd = (data && data.tool_input && data.tool_input.command) || "";
  if (!cmd) process.exit(0);

  const { deny, ask } = check(cmd);

  if (deny.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "[protect] 破壊的コマンドをブロック: " + [...new Set(deny)].join(" / ") +
          "。この操作が本当に必要な場合は、ユーザーが手動で実行すること。",
      },
    }));
  } else if (ask.length > 0) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason:
          "[protect] 危険なコマンド: " + [...new Set(ask)].join(" / ") + "。実行には人間の承認が必要。",
      },
    }));
  }
  process.exit(0);
})();

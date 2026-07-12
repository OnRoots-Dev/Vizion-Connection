#!/usr/bin/env node
/**
 * PostToolUse hook: auto-format edited files (non-blocking, always exits 0).
 * Matcher: Write|Edit
 */
"use strict";

const { spawnSync } = require("node:child_process");

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (buf += d));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(buf);
    const filePath = (data.tool_input && data.tool_input.file_path) || "";
    if (/\.(ts|tsx)$/i.test(filePath) && !/node_modules/.test(filePath)) {
      spawnSync("npx", ["eslint", "--fix", "--no-warn-ignored", filePath], {
        cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
        timeout: 30000,
        shell: true,
        stdio: "ignore",
      });
    }
  } catch {
    // 非ブロック: いかなる失敗でも編集フローを止めない
  }
  process.exit(0);
});

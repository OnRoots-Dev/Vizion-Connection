// scripts/cleanup-orphan-users.ts
// Supabase Auth に存在するが public.users に存在しない「orphan」ユーザーを列挙する。
// 削除は手動確認後に別途行うこと。
//
// 実行方法:
//   npx tsx scripts/cleanup-orphan-users.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

async function main() {
    console.log("=== Orphan Auth User Cleanup Script ===");
    console.log("Fetching all Auth users...\n");

    const authUsers: { id: string; email: string | undefined; created_at: string }[] = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) {
            console.error("Failed to list Auth users:", error.message);
            process.exit(1);
        }
        authUsers.push(
            ...data.users.map((u) => ({
                id: u.id,
                email: u.email,
                created_at: u.created_at,
            }))
        );
        if (data.users.length < perPage) break;
        page++;
    }

    console.log(`Total Auth users: ${authUsers.length}`);
    console.log("Checking against public.users...\n");

    const orphans: typeof authUsers = [];

    for (const authUser of authUsers) {
        if (!authUser.email) {
            console.log(`  [SKIP] ${authUser.id} — no email`);
            continue;
        }

        const { data: dbUser, error: dbError } = await supabaseAdmin
            .from("users")
            .select("id, email")
            .eq("email", authUser.email)
            .maybeSingle();

        if (dbError) {
            console.error(`  [ERROR] ${authUser.email}: ${dbError.message}`);
            continue;
        }

        if (!dbUser) {
            orphans.push(authUser);
        }
    }

    console.log("=".repeat(50));
    if (orphans.length === 0) {
        console.log("✅ No orphan users found.");
    } else {
        console.log(`⚠️  Found ${orphans.length} orphan Auth user(s):\n`);
        for (const u of orphans) {
            console.log(`  id:         ${u.id}`);
            console.log(`  email:      ${u.email ?? "(none)"}`);
            console.log(`  created_at: ${u.created_at}`);
            console.log("");
        }
        console.log("To delete them, run supabaseAdmin.auth.admin.deleteUser(id) for each.");
    }
}

main().catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
});

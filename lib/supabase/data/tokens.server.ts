// lib/supabase/verify-tokens.ts
import { supabaseServer as supabase } from "@/lib/supabase/server";

// トークン保存
export async function saveVerifyToken(token: string, email: string, slug: string): Promise<boolean> {
    const { error } = await supabase
        .from("verify_tokens")
        .insert({ token, email, slug, used: false });
    if (error) { console.error("[saveVerifyToken]", error); return false; }
    return true;
}

// トークン検証
export async function useVerifyToken(token: string): Promise<{ email: string; slug: string } | null> {
    const { data, error } = await supabase
        .from("verify_tokens")
        .select("email, slug, used")
        .eq("token", token)
        .single();

    if (error || !data || data.used) return null;

    // 使用済みにする
    await supabase
        .from("verify_tokens")
        .update({ used: true })
        .eq("token", token);

    return { email: data.email, slug: data.slug };
}

export const createVerifyToken = saveVerifyToken;
export async function findVerifyToken(token: string) {
    const { data } = await supabase
        .from("verify_tokens")
        .select("*")
        .eq("token", token)
        .single()

    return data
};

export const markTokenUsed = async (token: string) => {
    const { error } = await supabase.from("verify_tokens").update({ used: true }).eq("token", token);
    return !error;
};
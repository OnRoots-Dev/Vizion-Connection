// lib/supabase/contacts.ts
import { supabase } from "./client";

export async function createContact(params: {
    name: string;
    category?: string;
    email: string;
    message: string;
}): Promise<boolean> {
    const { error } = await supabase
        .from("contacts")
        .insert({
            name: params.name,
            category: params.category ?? null,
            email: params.email,
            message: params.message,
        });
    if (error) { console.error("[createContact]", error); return false; }
    return true;
}
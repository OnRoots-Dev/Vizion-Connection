// app/(app)/dashboard/settings/page.tsx
import { redirect } from "next/navigation";

export default async function SettingsPage() {
    redirect("/dashboard?view=settings");
}
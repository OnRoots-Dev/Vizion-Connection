import { redirect } from "next/navigation";

export default function DashboardBusinessEntryPage() {
  redirect("/dashboard?view=hub");
}

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BusinessHubPage() {
  redirect("/dashboard?view=hub");
}

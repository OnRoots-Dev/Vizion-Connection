// app/r/[slug]/page.tsx
// 招待リンク /r/[slug] → /register?ref=[slug] にリダイレクト

import { redirect } from "next/navigation";

export default async function ReferralRedirectPage({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = await params;
    redirect(`/register?ref=${slug}`);
}
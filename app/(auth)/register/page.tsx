// app/(auth)/register/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";
import { env } from "@/lib/env";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ ref?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const ref = params?.ref;
  const base = env.NEXT_PUBLIC_BASE_URL;
  const og = ref
    ? `${base}/api/og/referral?ref=${encodeURIComponent(ref)}`
    : `${base}/api/og/referral`;

  return {
    title: "新規登録 | Vizion Connection",
    openGraph: {
      title: "新規登録 | Vizion Connection",
      images: [og],
    },
    twitter: {
      card: "summary_large_image",
      images: [og],
    },
  };
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="vc-auth-fallback" />}>
      <RegisterForm />
    </Suspense>
  );
}

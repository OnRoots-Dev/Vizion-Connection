// app/(auth)/thanks/page.tsx

import { env } from "@/lib/env";
import ThanksClient from "./ThanksClient";

interface Props {
  searchParams: Promise<{ type?: string; next?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
  const { type, next } = await searchParams;

  return (
    <ThanksClient
      type={type}
      next={next}
      fromEmail={env.FROM_EMAIL}
    />
  );
}

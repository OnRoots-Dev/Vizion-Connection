// app/(auth)/thanks/page.tsx

import { env } from "@/lib/env";
import ThanksClient from "./ThanksClient";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function ThanksPage({ searchParams }: Props) {
  const { type } = await searchParams;

  return (
    <ThanksClient
      type={type}
      fromEmail={env.FROM_EMAIL}
    />
  );
}

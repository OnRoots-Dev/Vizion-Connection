const STATIC_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
  "https://app.vizion-connection.jp",
  "https://vizion-connection.jp",
  "http://localhost:3000",
];

function normalizeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return value.trim();
  }
}

function getAllowedOrigins(): string[] {
  return [...new Set(
    STATIC_ALLOWED_ORIGINS
      .filter(Boolean)
      .map((value) => normalizeOrigin(value as string))
  )];
}

function extractOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const referer = req.headers.get("referer");
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function extractOriginFromHost(req: Request): string | null {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const proto = (forwardedProto ?? "").split(",")[0]?.trim();
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = (forwardedHost ?? req.headers.get("host") ?? "").split(",")[0]?.trim();
  if (!host) return null;

  const scheme = proto || (host.includes("localhost") ? "http" : "https");
  return `${scheme}://${host}`;
}

export function validateCSRF(req: Request): Response | null {
  const origin = extractOrigin(req) ?? extractOriginFromHost(req);
  const allowedOrigins = getAllowedOrigins();
  if (!origin || !allowedOrigins.includes(normalizeOrigin(origin))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

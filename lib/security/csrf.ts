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

function getAllowedOrigins(req: Request): string[] {
  const requestOrigin = (() => {
    try {
      return new URL(req.url).origin;
    } catch {
      return "";
    }
  })();

  return [...new Set(
    [...STATIC_ALLOWED_ORIGINS, requestOrigin]
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

export function validateCSRF(req: Request): Response | null {
  const origin = extractOrigin(req);
  const allowedOrigins = getAllowedOrigins(req);
  if (!origin || !allowedOrigins.includes(normalizeOrigin(origin))) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null;
}

import { NextResponse } from "next/server";

export class PayloadTooLargeError extends Error {}

export async function readLimitedJson<T = any>(req: Request, limit = 64 * 1024): Promise<T> {
  const lenHeader = req.headers.get("content-length");
  if (lenHeader && Number(lenHeader) > limit) {
    throw new PayloadTooLargeError();
  }

  const text = await req.text();
  const size = new TextEncoder().encode(text).length;
  if (size > limit) {
    throw new PayloadTooLargeError();
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}

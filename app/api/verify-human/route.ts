import { NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

type VerifyBody = { token?: string };

export async function POST(req: Request) {
  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  const { ok } = await verifyTurnstile(token, remoteIp);
  return NextResponse.json({ ok });
}

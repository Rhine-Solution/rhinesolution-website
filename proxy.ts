import { NextResponse, type NextRequest } from "next/server";

// Best-effort in-memory rate limiting. Runs on the Edge runtime on Vercel and
// in the standalone Node server; buckets are per-instance, so this is a
// throttle against casual abuse, not a hard distributed limit.
const API_RATE_LIMIT = 20;
const API_WINDOW_MS = 60_000;

const buckets = new Map<string, { count: number; resetAt: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + API_WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > API_RATE_LIMIT;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate-limit API routes (chat, contact, verify-human).
  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (limited(ip)) {
      return NextResponse.json(
        { error: "Too many requests, please slow down." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets already handled by the CDN.
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};

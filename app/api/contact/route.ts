import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyTurnstile } from "@/lib/turnstile";

export const runtime = "nodejs";

// Resend's free tier: until rhinesolution.com is verified at
// https://resend.com/domains, the API can only send TO the account owner's
// email and FROM Resend's sandbox sender. Once verified, switch:
//   RECIPIENT = "info@rhinesolution.com"
//   FROM_ADDRESS = "noreply@rhinesolution.com"
const RECIPIENT = "admin@rhinesolution.com";
const FROM_NAME = "Rhine Solution";
const FROM_ADDRESS = "onboarding@resend.dev";

type ContactPayload = {
  name?: string;
  email?: string;
  message?: string;
  locale?: string;
  turnstile?: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const name = (body.name ?? "").trim().slice(0, 200);
  const email = (body.email ?? "").trim().slice(0, 200);
  const message = (body.message ?? "").trim().slice(0, 4000);
  const locale = (body.locale ?? "en").trim().slice(0, 8);

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: "Name, email, and message are required" },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address" },
      { status: 400 }
    );
  }

  const turnstileToken = (body.turnstile ?? "").trim().slice(0, 4000);
  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const { ok: human } = await verifyTurnstile(turnstileToken, remoteIp);
  if (!human) {
    return NextResponse.json(
      { ok: false, error: "Verification failed. Please try again." },
      { status: 403 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Email service is not configured. Please email us directly at info@rhinesolution.com.",
      },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const subject = `[Rhine Solution] New contact form message from ${name}`;
    const html = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a;">
        <h2 style="color:#2c6bff;">New contact form submission</h2>
        <p><strong>From:</strong> ${escape(name)} &lt;${escape(email)}&gt;</p>
        <p><strong>Locale:</strong> ${escape(locale)}</p>
        <hr />
        <pre style="white-space: pre-wrap; font-family: inherit;">${escape(message)}</pre>
      </div>
    `;
    const text =
      `New contact form submission\n\n` +
      `From: ${name} <${email}>\n` +
      `Locale: ${locale}\n\n` +
      `${message}\n`;

    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_ADDRESS}>`,
      to: [RECIPIENT],
      replyTo: email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[contact] Resend error:", JSON.stringify(error));
      return NextResponse.json(
        {
          ok: false,
          error: "Could not send message",
          detail: error.message ?? error.name ?? "unknown",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not send message" },
      { status: 500 }
    );
  }
}

function escape(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

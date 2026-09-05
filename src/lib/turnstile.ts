export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string
): Promise<{ ok: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Fail closed: if the secret isn't configured, reject verification rather
  // than silently disabling bot protection. Keys must be set in Vercel.
  if (!secret) return { ok: false };
  if (!token) return { ok: false };

  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    if (remoteIp) form.set("remoteip", remoteIp);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form }
    );
    const data = (await res.json()) as { success?: boolean };
    return { ok: Boolean(data.success) };
  } catch {
    return { ok: false };
  }
}

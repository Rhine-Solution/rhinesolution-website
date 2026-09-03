export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string
): Promise<{ ok: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // No secret configured — pass through so the app is never hard-locked
  // during rollout. Once keys are set in Vercel, real verification applies.
  if (!secret) return { ok: true };
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

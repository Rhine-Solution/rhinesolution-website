// api/contact.js — Vercel serverless contact form handler (Resend-only).
// Port of the live app/api/contact/route.ts to CommonJS so it runs on the
// static site's Vercel project. No Turnstile: spam protection for the contact
// form is handled at the Cloudflare network/edge, so only RESEND_API_KEY is
// needed as an env var. Requires the RESEND_API_KEY env var on the project.
'use strict';

const RESEND_URL = 'https://api.resend.com/emails';
const RECIPIENT = 'info@rhinesolution.com';
const FROM_NAME = 'Rhine Solution';
const FROM_ADDRESS = 'noreply@rhinesolution.com';

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

function escape(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(res, data, status) {
  res.writeHead(status || 200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 32_000) { reject(new Error('too large')); req.destroy(); }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, { ok: false, error: 'Method not allowed' }, 405);
  }
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return json(res, { ok: false, error: 'Content-Type must be application/json' }, 415);
  }

  let body;
  try {
    const raw = await readBody(req);
    if (raw.length > 32_000) return json(res, { ok: false, error: 'Request body too large' }, 413);
    body = JSON.parse(raw);
  } catch {
    return json(res, { ok: false, error: 'Invalid request body' }, 400);
  }

  const name = String(body.name || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 4000);
  const locale = String(body.locale || 'en').trim().slice(0, 8);

  if (!name || !email || !message) {
    return json(res, { ok: false, error: 'Name, email, and message are required' }, 400);
  }
  if (!isEmail(email)) {
    return json(res, { ok: false, error: 'Please enter a valid email address' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(res, {
      ok: false,
      error: 'Email service is not configured. Please email us directly at info@rhinesolution.com.',
    }, 503);
  }

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

  try {
    const resp = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_ADDRESS}>`,
        to: [RECIPIENT],
        reply_to: email,
        subject,
        html,
        text,
      }),
    });
    const result = await resp.json().catch(() => ({}));
    if (!resp.ok || result.error || !result.id) {
      console.error('[contact] Resend error:', JSON.stringify(result));
      return json(res, { ok: false, error: 'Could not send message' }, 502);
    }
    return json(res, { ok: true, id: result.id });
  } catch (e) {
    console.error('[contact] send failed:', e && e.message);
    return json(res, { ok: false, error: 'Could not send message' }, 500);
  }
};

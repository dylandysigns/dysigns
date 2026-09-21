// Cloudflare Pages Function: receives the contact form POST (see
// src/app/pages/ContactPage.tsx), emails a notification to NOTIFY_TO and a
// confirmation to the sender via Resend, then redirects to /thank-you.
// Requires the RESEND_API_KEY secret in the Cloudflare Pages project settings
// and a verified sending domain/address in Resend.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const NOTIFY_TO = "info@dylandysigns.com";
const FROM_ADDRESS = "DYSIGNS <hello@dylandysigns.com>";
const SITE_URL = "https://dylandysigns.com";
const LOGO_URL = `${SITE_URL}/email/dysigns-logo.png`;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Black background, white text, matching the site's dark theme. The
// container gets a visible border and generous padding so it reads as
// a distinct card against the page background in mail clients.
function emailShell({ preheader, heading, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000000;font-family:Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:48px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0a0a0a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.14);">
          <tr>
            <td style="padding:40px 44px 28px 44px;">
              <img src="${LOGO_URL}" alt="DYSIGNS" width="112" style="display:block;width:112px;max-width:100%;height:auto;" />
            </td>
          </tr>
          <tr><td style="padding:0 44px;"><div style="height:1px;background:rgba(255,255,255,0.12);"></div></td></tr>
          <tr>
            <td style="padding:40px 44px;">
              <h1 style="margin:0 0 20px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:-0.01em;color:#ffffff;">${escapeHtml(heading)}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr><td style="padding:0 44px;"><div style="height:1px;background:rgba(255,255,255,0.12);"></div></td></tr>
          <tr>
            <td style="padding:28px 44px 40px 44px;">
              <p style="margin:0 0 8px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:12px;color:#8a8a8a;">DYSIGNS, Almere, Netherlands</p>
              <p style="margin:0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:12px;color:#8a8a8a;">KVK: 83710418 &middot; BTW: NL003861601B85 &middot; <a href="${SITE_URL}/privacy" style="color:#8a8a8a;">Privacy policy</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function notifyEmail(email, message) {
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  return emailShell({
    preheader: `New message from ${email}`,
    heading: "New contact form submission",
    bodyHtml: `
      <p style="margin:0 0 24px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#cccccc;">From <a href="mailto:${safeEmail}" style="color:#ffffff;font-weight:600;">${safeEmail}</a></p>
      <div style="background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:24px;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.7;color:#ffffff;">${safeMessage}</div>
    `,
  });
}

function confirmEmail(message) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  return emailShell({
    preheader: "Thanks for reaching out. We've received your message.",
    heading: "We've received your message",
    bodyHtml: `
      <p style="margin:0 0 24px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#cccccc;">Hi,</p>
      <p style="margin:0 0 24px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#cccccc;">Thanks for reaching out. We've received your message and will get back to you shortly.</p>
      <div style="background:#161616;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:24px;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.7;color:#ffffff;margin-bottom:28px;">${safeMessage}</div>
      <p style="margin:0;font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:17px;color:#ffffff;">Dylan, DYSIGNS</p>
    `,
  });
}

async function sendEmail(apiKey, message) {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    console.error(`Resend error (${res.status}):`, await res.text());
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

function redirect(path) {
  // 303 turns the POST into a GET on the target, like Netlify's form action.
  return new Response(null, { status: 303, headers: { Location: path } });
}

// Spam defence, cheapest check first:
//  1. honeypot field (bots fill every input)
//  2. time trap: the page stamps `ts` on load; humans need a few seconds to
//     type, bots that POST straight to this endpoint send no stamp at all
//  3. link limit: spam is nearly always links
//  4. Cloudflare Turnstile token (needs TURNSTILE_SECRET_KEY, see DOMAIN_SETUP)
// Checks 1-3 answer with a fake "thank you" so bots get no signal to adapt to.
const MIN_FILL_MS = 3000;
const MAX_FILL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_LINKS = 2;
const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function looksAutomated(form, message) {
  const elapsed = Date.now() - Number(form.get("ts"));
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return true;
  }
  const links = message.match(/https?:\/\/|www\./gi) ?? [];
  return links.length > MAX_LINKS;
}

async function passesTurnstile(secret, token, ip) {
  if (!token) return false;
  try {
    const res = await fetch(TURNSTILE_VERIFY, {
      method: "POST",
      body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return new Response("Email not configured", { status: 500 });
  }

  const form = await request.formData();

  // Honeypot field from the form: bots fill it, people never see it. Pretend
  // success so bots don't learn to skip it.
  if (form.get("bot-field")) {
    return redirect("/thank-you");
  }

  const email = String(form.get("email") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();

  if (looksAutomated(form, message)) {
    return redirect("/thank-you");
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await passesTurnstile(
      env.TURNSTILE_SECRET_KEY,
      form.get("cf-turnstile-response"),
      request.headers.get("CF-Connecting-IP"),
    );
    // A real person can fail this (blocked script, expired token): send them
    // back with a message instead of a fake success.
    if (!ok) return redirect("/contact?error=verify");
  } else {
    console.warn("TURNSTILE_SECRET_KEY is not set: contact form has no CAPTCHA");
  }

  if (
    !EMAIL_RE.test(email) ||
    email.length > MAX_EMAIL ||
    !message ||
    message.length > MAX_MESSAGE
  ) {
    return new Response("Invalid form fields", { status: 400 });
  }

  await Promise.all([
    sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      reply_to: email,
      subject: "New contact form submission",
      text: `From: ${email}\n\n${message}`,
      html: notifyEmail(email, message),
    }),
    sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: email,
      subject: "We've received your message",
      text: `Hi,\n\nThanks for reaching out. We've received your message and will get back to you shortly.\n\nYour message:\n${message}\n\nDylan, DYSIGNS`,
      html: confirmEmail(message),
    }),
  ]);

  return redirect("/thank-you");
}

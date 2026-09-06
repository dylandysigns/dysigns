// Netlify invokes this automatically whenever the "contact" form
// (src/app/pages/ContactPage.tsx) is submitted. Requires RESEND_API_KEY
// and a verified sending domain/address to be set in Netlify env vars.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const NOTIFY_TO = "info@dylandysigns.com";
const FROM_ADDRESS = "DYSIGNS <hello@dylandysigns.com>";
const SITE_URL = "https://dylandysigns.com";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inlined styles + a text wordmark (no logo asset survives a black
// background reliably across mail clients, and no light/dark variant
// of dysigns_white.png exists) to match the site's black/white identity.
function emailShell({ preheader, heading, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,-apple-system,BlinkMacSystemFont,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
          <tr>
            <td style="padding:32px 40px 24px 40px;">
              <div style="font-family:Inter,-apple-system,Arial,sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.02em;color:#000000;">DYSIGNS</div>
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#ececec;"></div></td></tr>
          <tr>
            <td style="padding:32px 40px;">
              <h1 style="margin:0 0 16px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-weight:700;font-size:22px;letter-spacing:-0.01em;color:#000000;">${escapeHtml(heading)}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <tr><td style="padding:0 40px;"><div style="height:1px;background:#ececec;"></div></td></tr>
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0 0 6px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:12px;color:#8a8a8a;">DYSIGNS — Almere, Netherlands</p>
              <p style="margin:0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:12px;color:#8a8a8a;">KVK: 83710418 · BTW: NL003861601B85 · <a href="${SITE_URL}/privacy" style="color:#8a8a8a;">Privacy policy</a></p>
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
      <p style="margin:0 0 20px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;">From <a href="mailto:${safeEmail}" style="color:#000000;font-weight:600;">${safeEmail}</a></p>
      <div style="background:#f7f7f7;border-radius:8px;padding:20px;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">${safeMessage}</div>
    `,
  });
}

function confirmEmail(message) {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  return emailShell({
    preheader: "Thanks for reaching out — we've received your message.",
    heading: "We've received your message",
    bodyHtml: `
      <p style="margin:0 0 20px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;">Hi,</p>
      <p style="margin:0 0 20px 0;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3a3a;">Thanks for reaching out — we've received your message and will get back to you shortly.</p>
      <div style="background:#f7f7f7;border-radius:8px;padding:20px;font-family:Inter,-apple-system,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;margin-bottom:20px;">${safeMessage}</div>
      <p style="margin:0;font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-size:17px;color:#000000;">— Dylan, DYSIGNS</p>
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

export async function handler(event) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { statusCode: 500, body: "Email not configured" };
  }

  const { payload } = JSON.parse(event.body);
  const data = payload?.data ?? {};

  // Honeypot field from the form — Netlify still invokes this function for
  // spam-flagged submissions, so skip sending mail for those.
  if (data["bot-field"]) {
    return { statusCode: 200, body: "ignored (spam)" };
  }

  const email = data.email;
  const message = data.message;
  if (!email || !message) {
    return { statusCode: 400, body: "Missing form fields" };
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
      text: `Hi,\n\nThanks for reaching out — we've received your message and will get back to you shortly.\n\nYour message:\n${message}\n\n— Dylan, DYSIGNS`,
      html: confirmEmail(message),
    }),
  ]);

  return { statusCode: 200, body: "ok" };
}

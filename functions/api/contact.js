// Cloudflare Pages Function: receives the contact form POST (see
// src/app/pages/ContactPage.tsx), emails a notification to NOTIFY_TO and a
// confirmation to the sender via Resend, then redirects to /thank-you.
// Requires the RESEND_API_KEY secret in the Cloudflare Pages project settings
// and a verified sending domain/address in Resend.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const NOTIFY_TO = "info@dylandysigns.com";
const FROM_ADDRESS = "DYSIGNS <hello@dylandysigns.com>";
const SITE_URL = "https://dylandysigns.com";
const HEADER_URL = `${SITE_URL}/email/contact-header.jpg`;
const WA_ICON_URL = `${SITE_URL}/email/whatsapp.png`;
const WHATSAPP_URL = "https://wa.me/31626814488";

// The mails: personal in tone and dark like the site. Only system fonts (Helvetica/Arial), since
// mail clients do not load Effra; the letter-spacing is tight like the site. The space header with
// the 3D emblem and the WhatsApp icon are PNG/JPG files in public/email, because SVG, WebGL and
// background images do not show in Gmail or Outlook.
const FONT = `'Helvetica Neue',Helvetica,Arial,sans-serif`;
const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const p = (html, extra = "") =>
  `<p style="margin:0 0 18px 0;font-family:${FONT};font-size:15px;line-height:1.6;letter-spacing:-0.02em;color:#bdbdbd;${extra}">${html}</p>`;

const COPY = {
  en: {
    heading: (n) => (n ? `Thanks, ${n}.` : "Thanks."),
    body: "Your message came in well. We'll get back to you within one business day, usually sooner.",
    yours: "Your message",
    cta: "See our work",
    bye: "Speak soon,",
    privacy: "Privacy policy",
  },
  nl: {
    heading: (n) => (n ? `Bedankt, ${n}.` : "Bedankt."),
    body: "Je bericht is goed aangekomen. We komen binnen één werkdag bij je terug, meestal sneller.",
    yours: "Jouw bericht",
    cta: "Bekijk ons werk",
    bye: "Tot snel,",
    privacy: "Privacybeleid",
  },
};

function shell({ lang, preheader, inner, footer = "" }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<style>:root{color-scheme:dark;}</style>
<style>@media (max-width:600px){.px{padding-left:24px!important;padding-right:24px!important;}.h1{font-size:30px!important;}.btns,.btns tbody,.btns tr{display:block!important;width:100%!important;}.stack{display:block!important;width:100%!important;padding:0 0 10px 0!important;}.btn{width:100%!important;}.btn td{display:block!important;}.btn a{display:block!important;text-align:center!important;}}</style>
</head>
<body bgcolor="#000000" style="margin:0;padding:0;background-color:#000000;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#000000" style="background-color:#000000;">
  <tr><td align="center" style="padding:48px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
      <tr><td bgcolor="#0a0a0a" style="background-color:#0a0a0a;border:1px solid #1f1f1f;border-radius:20px;overflow:hidden;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:0;line-height:0;font-size:0;">
            <a href="${SITE_URL}"><img src="${HEADER_URL}" alt="DYSIGNS" width="580" style="display:block;width:100%;max-width:580px;height:auto;border:0;border-radius:20px 20px 0 0;"></a>
          </td></tr>
          <tr><td class="px" bgcolor="#0a0a0a" style="padding:8px 44px 44px 44px;background-color:#0a0a0a;">${inner}</td></tr>
        </table>
      </td></tr>
      ${footer}
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const h1 = (text) =>
  `<h1 class="h1" style="margin:0 0 14px 0;font-family:${FONT};font-size:36px;line-height:1.05;font-weight:700;letter-spacing:-0.05em;color:#ffffff;">${text}</h1>`;

const small = (text) =>
  `<p style="margin:0 0 10px 0;font-family:${FONT};font-size:13px;letter-spacing:-0.01em;color:#6b6b6b;">${text}</p>`;

const messageBox = (message) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
    <tr><td style="padding:0;font-family:${FONT};font-size:15px;line-height:1.65;letter-spacing:-0.02em;color:#e6e6e6;">${escapeHtml(message).replace(/\n/g, "<br>")}</td></tr>
  </table>`;

const button = (href, text) => `
  <table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:0;"><tr>
    <td bgcolor="#ffffff" style="background-color:#ffffff;border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:-0.02em;color:#000000;text-decoration:none;border-radius:999px;white-space:nowrap;">${text}</a>
    </td>
  </tr></table>`;

// WhatsApp as an outlined pill with the site's icon as a PNG (SVG does not load in Gmail/Outlook)
const waButton = (href, text = "WhatsApp") => `
  <table role="presentation" class="btn" cellpadding="0" cellspacing="0" style="margin:0;"><tr>
    <td style="border:1px solid #333333;border-radius:999px;">
      <a href="${href}" style="display:inline-block;padding:12px 22px 12px 18px;font-family:${FONT};font-size:14px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;text-decoration:none;border-radius:999px;white-space:nowrap;"><img src="${WA_ICON_URL}" alt="" width="16" height="16" style="display:inline-block;width:16px;height:16px;border:0;vertical-align:-3px;margin-right:8px;">${text}</a>
    </td>
  </tr></table>`;

const hr =`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:36px 0 28px 0;"><tr><td bgcolor="#1f1f1f" height="1" style="height:1px;line-height:1px;font-size:1px;background-color:#1f1f1f;">&nbsp;</td></tr></table>`;

function confirmEmail({ lang = "en", name, message }) {
  const c = COPY[lang] ?? COPY.en;
  const first = name ? name.trim().split(/\s+/)[0] : "";
  const workUrl = `${SITE_URL}${lang === "nl" ? "/nl" : ""}/work`;
  const inner = `
    ${h1(escapeHtml(c.heading(first)))}
    ${p(c.body, "margin-bottom:32px;font-size:16px;")}
    ${small(c.yours)}
    ${messageBox(message)}
    <table role="presentation" class="btns" cellpadding="0" cellspacing="0"><tr>
      <td class="stack" style="padding:0 10px 0 0;vertical-align:top;">${button(workUrl, c.cta)}</td>
      <td class="stack" style="vertical-align:top;">${waButton(WHATSAPP_URL)}</td>
    </tr></table>
    ${hr}
    <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.5;letter-spacing:-0.02em;color:#8a8a8a;">${c.bye}</p>
    <p style="margin:2px 0 0 0;font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:-0.04em;color:#ffffff;">Dylan Kho</p>
    <p style="margin:0;font-family:${FONT};font-size:13px;letter-spacing:-0.01em;color:#6b6b6b;">DYSIGNS</p>`;
  const footer = `
      <tr><td align="center" style="padding:28px 24px 0 24px;font-family:${FONT};font-size:12px;line-height:1.8;letter-spacing:-0.01em;color:#555555;">
        <a href="${SITE_URL}" style="color:#555555;text-decoration:none;">dylandysigns.com</a> | <a href="${WHATSAPP_URL}" style="color:#555555;text-decoration:none;">WhatsApp</a> | <a href="${SITE_URL}/privacy" style="color:#555555;text-decoration:none;">${c.privacy}</a><br>
        KVK 8371&#8203;0418 | BTW NL0038&#8203;61601B85
      </td></tr>`;
  return shell({ lang, preheader: c.body, inner, footer });
}

function notifyEmail({ lang = "en", name, email, phone, message }) {
  const row = (k, v) =>
    `<tr><td style="padding:4px 18px 4px 0;font-family:${FONT};font-size:14px;letter-spacing:-0.02em;color:#6b6b6b;vertical-align:top;">${k}</td><td style="padding:4px 0;font-family:${FONT};font-size:14px;letter-spacing:-0.02em;color:#ffffff;">${v}</td></tr>`;
  const waNumber = phone ? phone.replace(/\D/g, "").replace(/^0/, "31") : "";
  const inner = `
    ${small(`Nieuw bericht via de site (${lang.toUpperCase()})`)}
    ${h1(escapeHtml(name || email))}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px 0;">
      ${row("E-mail", `<a href="mailto:${escapeHtml(email)}" style="color:#ffffff;">${escapeHtml(email)}</a>`)}
      ${phone ? row("Telefoon", `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}" style="color:#ffffff;">${escapeHtml(phone)}</a>`) : ""}
    </table>
    ${messageBox(message)}
    <table role="presentation" class="btns" cellpadding="0" cellspacing="0"><tr>
      <td class="stack" style="padding:0 10px 0 0;vertical-align:top;">${button(`mailto:${escapeHtml(email)}`, "Beantwoorden")}</td>
      ${waNumber ? `<td class="stack" style="vertical-align:top;">${waButton(`https://wa.me/${waNumber}`)}</td>` : ""}
    </tr></table>`;
  return shell({ lang: "nl", preheader: `${name || email}: ${message.slice(0, 90)}`, inner });
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
const MAX_FIELD = 120;

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
  let message = String(form.get("message") ?? "").trim();
  let name = String(form.get("name") ?? "").trim().slice(0, MAX_FIELD);
  let phone = String(form.get("phone") ?? "").trim().slice(0, MAX_FIELD);
  const lang = form.get("lang") === "nl" ? "nl" : "en";

  // Older cached pages still put "Name:" and "Phone:" at the top of the message: lift them out.
  if (!name) {
    const head = message.match(/^Name: (.*)\n(?:Phone: (.*)\n)?\n?/);
    if (head) {
      name = head[1].trim().slice(0, MAX_FIELD);
      phone = (head[2] ?? "").trim().slice(0, MAX_FIELD);
      message = message.slice(head[0].length).trim();
    }
  }

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

  const mail = { lang, name, email, phone, message };
  const plain = {
    nl: `Hoi${name ? ` ${name.split(/\s+/)[0]}` : ""},\n\nJe bericht is goed aangekomen. We komen binnen één werkdag bij je terug, meestal sneller.\n\nJouw bericht:\n${message}\n\nTot snel,\nDylan Kho\nDYSIGNS`,
    en: `Hi${name ? ` ${name.split(/\s+/)[0]}` : ""},\n\nYour message came in well. We'll get back to you within one business day, usually sooner.\n\nYour message:\n${message}\n\nSpeak soon,\nDylan Kho\nDYSIGNS`,
  };

  await Promise.all([
    sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: NOTIFY_TO,
      reply_to: email,
      subject: `Nieuw bericht van ${name || email}`,
      text: `${name ? `Naam: ${name}\n` : ""}E-mail: ${email}\n${phone ? `Telefoon: ${phone}\n` : ""}Taal: ${lang}\n\n${message}`,
      html: notifyEmail(mail),
    }),
    sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: email,
      subject: lang === "nl" ? "We hebben je bericht ontvangen" : "We've received your message",
      text: plain[lang],
      html: confirmEmail(mail),
    }),
  ]);

  return redirect("/thank-you");
}

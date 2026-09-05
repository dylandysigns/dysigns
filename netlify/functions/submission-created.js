// Netlify invokes this automatically whenever the "contact" form
// (src/app/pages/ContactPage.tsx) is submitted. Requires RESEND_API_KEY
// and a verified sending domain/address to be set in Netlify env vars.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const NOTIFY_TO = "info@dylandysigns.com";
const FROM_ADDRESS = "Dysigns <hello@dylandysigns.com>";

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
    }),
    sendEmail(apiKey, {
      from: FROM_ADDRESS,
      to: email,
      subject: "We've received your message",
      text: `Hi,\n\nThanks for reaching out — we've received your message and will get back to you shortly.\n\nYour message:\n${message}\n\n— Dylan Dysigns`,
    }),
  ]);

  return { statusCode: 200, body: "ok" };
}

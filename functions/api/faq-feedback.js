// Thumbs up or down on an answer of the AI chat (see faq-chat.js). The browser sends the random id
// it got with the answer and 1 (helpful) or -1 (not helpful); the rating is written to that one
// row. Nothing about the visitor is sent or kept, and the id is only known to the browser that got
// the answer. The ratings are what makes the logged answers usable as examples: scripts/faq-export.mjs.

const RID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function onRequestPost({ request, env }) {
  // No database (local dev): nothing to store, and that is not an error for the visitor.
  if (!env.DB) return new Response(null, { status: 204 });
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response("invalid json", { status: 400 });
  }
  const rating = body?.rating === 1 ? 1 : body?.rating === -1 ? -1 : null;
  const rid = typeof body?.rid === "string" && RID_RE.test(body.rid) ? body.rid : null;
  if (!rid || rating === null) return new Response("invalid", { status: 400 });
  try {
    await env.DB.prepare(`UPDATE faq_questions SET rating = ?1 WHERE rid = ?2`).bind(rating, rid).run();
  } catch (err) {
    console.error("faq-feedback failed:", err?.message ?? err);
    return new Response(null, { status: 204 });
  }
  return new Response(null, { status: 204 });
}

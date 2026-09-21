// Cloudflare Pages Function: returns the visitor's approximate city so the
// hero can say "We are available in {city}". Cloudflare resolves it from the
// request IP at the edge (request.cf), so no IP address is sent to any
// third-party geolocation service and nothing is stored. Returns
// { city: null } when Cloudflare can't determine it.

export function onRequestGet({ request }) {
  const city = typeof request.cf?.city === "string" ? request.cf.city : null;
  return new Response(JSON.stringify({ city }), {
    headers: {
      "Content-Type": "application/json",
      // Per-visitor answer: browser may cache it, shared caches must not.
      "Cache-Control": "private, max-age=3600",
    },
  });
}

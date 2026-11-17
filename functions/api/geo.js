// Cloudflare Pages Function: returns the visitor's approximate city so the
// hero can say "We are available in {city}". Cloudflare resolves it from the
// request IP at the edge (request.cf), so no IP address is sent to any
// third-party geolocation service and nothing is stored. Returns
// { city: null } when Cloudflare can't determine it.

// Only cities in the countries we actually serve. Search engine crawlers
// come from US datacenters (Googlebot from Council Bluffs, which the geo
// database names "Omaha"), and their render of the hero would otherwise
// get indexed as "Wij zijn beschikbaar in Omaha". Outside NL and BE the
// hero falls back to "Nederland" / "the Netherlands".
const SERVED_COUNTRIES = new Set(["NL", "BE"]);

export function onRequestGet({ request }) {
  const country = typeof request.cf?.country === "string" ? request.cf.country : null;
  const ua = request.headers.get("user-agent") || "";
  const isBot = /bot|crawl|spider|slurp|preview|lighthouse|headless/i.test(ua);
  const inServedArea = !isBot && country !== null && SERVED_COUNTRIES.has(country);
  const raw = inServedArea && typeof request.cf?.city === "string" ? request.cf.city : null;
  // The geo database names some Dutch cities after their centre ("Almere
  // Stad"); visitors expect the plain city name.
  const city = raw ? raw.replace(/ Stad$/, "") : null;
  return new Response(JSON.stringify({ city }), {
    headers: {
      "Content-Type": "application/json",
      // Per-visitor answer: browser may cache it, shared caches must not.
      "Cache-Control": "private, max-age=3600",
    },
  });
}

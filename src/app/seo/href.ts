/**
 * crawlHref — the href crawlers should see for an internal route.
 *
 * The host serves every prerendered route from its own directory, so
 * `/web-design` answers with a 308 to `/web-design/` (the URL that actually
 * returns 200 and matches canonical + sitemap). Internal anchors used to
 * point at the slash-less form, which showed up in Search Console as "Page
 * with redirect". Only the visible href changes; client-side navigation
 * still uses the router path, which matches with or without the slash.
 */
export function crawlHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [, path, rest] = href.match(/^([^?#]*)(.*)$/) ?? [];
  if (!path || path.endsWith("/")) return href;
  const last = path.split("/").pop() ?? "";
  if (/\.[a-z0-9]+$/i.test(last)) return href; // files: /favicon.png
  return `${path}/${rest}`;
}

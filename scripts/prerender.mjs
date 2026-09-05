// Fase 1 — build-time prerendering.
//
// Renders every public route to static HTML using Vite's own SSR module
// loader (no new dependency: vite and react-dom are already installed).
// The client entry (src/main.tsx) keeps using createRoot (a fresh mount,
// not hydrateRoot) so there is zero hydration-matching risk — the
// prerendered markup is replaced by the identical client render the
// instant React mounts, exactly like today, just with real content
// present in the HTML before that happens.
//
// Deliberately excluded from this list:
//   /docs                     — internal, unlisted content-editing guide
//   /fatins-birthday          — hidden, unlinked page (must stay unlisted)
//   /gift-fatins-birthday     — hidden, unlinked page (must stay unlisted)
//   /* (404 catch-all)        — handled separately as dist/404.html

import { createServer } from "vite";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");

// /work and /about reverted to the original projects.ts-backed pages —
// slugs read directly from src/app/data/projects.ts so this list can't
// silently drift out of sync with the actual project data.
const projectsSource = await fs.readFile(
  path.join(root, "src/app/data/projects.ts"),
  "utf-8",
);
const CASE_SLUGS = [...projectsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

// One slug per article, English filename only — its .nl.md translation
// (if any) is picked up by getLocalizedContent at render time, not
// treated as a second, separate route (mirrors getInsightSlugs in
// src/app/content/loadContent.ts).
const insightFiles = await fs.readdir(path.join(root, "content/insights"));
const INSIGHT_SLUGS = insightFiles
  .filter((f) => f.endsWith(".md") && !f.endsWith(".nl.md"))
  .map((f) => f.replace(/\.md$/, ""));

// English routes — also mirrored under /nl below for the Dutch tree
// (real, separately-crawlable URLs, not a client-side language toggle).
const enRoutes = [
  "/",
  "/web-design",
  "/social-media-meta-ads",
  "/ux-ui-design",
  "/branding",
  "/ai-implementation",
  "/shopify-development", // subpage under web design, not in navigation
  "/work",
  ...CASE_SLUGS.map((slug) => `/work/${slug}`),
  "/insights",
  ...INSIGHT_SLUGS.map((slug) => `/insights/${slug}`),
  "/about",
  "/contact",
];

const routesToPrerender = [
  ...enRoutes,
  ...enRoutes.map((url) => (url === "/" ? "/nl" : `/nl${url}`)),
  // Netlify Forms' native POST redirect target — needs to exist as a
  // real static file for the browser to land on after submit. noindex
  // (set on the page itself), so it's excluded from the sitemap
  // automatically same as any other noindex route. English-only, not
  // mirrored under /nl — the contact form's action is a single static
  // path regardless of which language it was submitted from.
  "/thank-you",
];

// Fase 3 — inject each route's captured <Seo> values into its own <head>.
// Regexes target each tag by its distinguishing attribute (name=/
// property=/rel=) and replace only the value, so the rest of the base
// template (JSON-LD, preloads, favicon, og:image, twitter:card, ...)
// stays untouched and identical across routes.
function escapeAttr(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function replaceTag(html, regex, replacementValue, label) {
  if (!regex.test(html)) {
    throw new Error(`Kon ${label} niet vinden in de HTML-template om te vervangen.`);
  }
  return html.replace(regex, replacementValue);
}

function injectHead(html, meta, canonicalUrl, i18n) {
  const title = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);
  const robots = escapeAttr(meta.robots ?? "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
  const url = escapeAttr(canonicalUrl);
  const ogType = escapeAttr(meta.ogType ?? "website");
  const locale = i18n.lang === "nl" ? "nl_NL" : "en_US";
  const localeAlt = i18n.lang === "nl" ? "en_US" : "nl_NL";

  let out = html;
  out = replaceTag(out, /<html lang="[^"]*">/, `<html lang="${i18n.lang}">`, '<html lang="...">');
  out = replaceTag(out, /<title>[^<]*<\/title>/, `<title>${title}</title>`, "<title>");
  out = replaceTag(out, /(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${description}$2`, 'meta name="description"');
  out = replaceTag(out, /(<meta\s+name="robots"\s+content=")[^"]*(")/, `$1${robots}$2`, 'meta name="robots"');
  out = replaceTag(
    out,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    // hreflang alternates inserted right after canonical — x-default
    // points at the English URL, matching the site's English-first setup.
    `<link rel="canonical" href="${url}" />\n      <link rel="alternate" hreflang="en" href="${escapeAttr(i18n.enUrl)}" />\n      <link rel="alternate" hreflang="nl" href="${escapeAttr(i18n.nlUrl)}" />\n      <link rel="alternate" hreflang="x-default" href="${escapeAttr(i18n.enUrl)}" />`,
    'link rel="canonical"',
  );
  out = replaceTag(out, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`, 'meta property="og:title"');
  out = replaceTag(out, /(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${description}$2`, 'meta property="og:description"');
  out = replaceTag(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`, 'meta property="og:url"');
  out = replaceTag(out, /(<meta\s+property="og:type"\s+content=")[^"]*(")/, `$1${ogType}$2`, 'meta property="og:type"');
  out = replaceTag(out, /(<meta\s+property="og:locale"\s+content=")[^"]*(")/, `$1${locale}$2`, 'meta property="og:locale"');
  out = replaceTag(out, /(<meta\s+property="og:locale:alternate"\s+content=")[^"]*(")/, `$1${localeAlt}$2`, 'meta property="og:locale:alternate"');
  out = replaceTag(out, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`, 'meta name="twitter:title"');
  out = replaceTag(out, /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${description}$2`, 'meta name="twitter:description"');

  // Fase 4 — page-type JSON-LD (Service/CreativeWork/ProfilePage/
  // BreadcrumbList/...), merged into the SAME @graph array as the
  // site-wide script (id="site-schema": Person, Organization,
  // LocalBusiness, WebSite) rather than a second separate <script> tag.
  // @id references (e.g. CreativeWork.author -> #person) only resolve
  // unambiguously within one JSON-LD graph — two separate script blocks
  // on the same page is a widely-tolerated pattern in practice, but
  // merging into one graph removes any doubt entirely.
  if (meta.schema && meta.schema.length > 0) {
    const siteSchemaRegex = /(<script type="application\/ld\+json" id="site-schema">)([\s\S]*?)(<\/script>)/;
    const match = out.match(siteSchemaRegex);
    if (!match) {
      throw new Error('Kon <script type="application/ld+json" id="site-schema"> niet vinden om fase 4-schema in samen te voegen.');
    }
    const siteSchema = JSON.parse(match[2]);
    siteSchema["@graph"].push(...meta.schema);
    out = out.replace(siteSchemaRegex, `$1\n      ${JSON.stringify(siteSchema)}\n      $3`);
  }

  return out;
}

async function run() {
  const vite = await createServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    ssr: {
      // react-router ships separate .mjs/.js builds (dual package hazard).
      // Without this, Vite externalizes it via a raw dynamic import() for
      // this script's top-level `vite.ssrLoadModule("react-router")` call,
      // while app code (Layout.tsx etc.) resolves it through a different
      // path — producing two distinct module instances whose React
      // Context objects don't match, breaking useNavigate() with
      // "used outside <Router>". Forcing it through Vite's own transform
      // pipeline guarantees one single, consistent instance everywhere.
      noExternal: ["react-router"],
    },
  });

  const { routes } = await vite.ssrLoadModule("/src/app/routes.ts");
  // useRoutes + StaticRouter: the plain (non-data-router) SSR primitives.
  // No loaders/actions exist in this route tree, so the heavier
  // createMemoryRouter/RouterProvider "data router" machinery isn't
  // needed — and it doesn't establish its router context synchronously
  // under renderToStaticMarkup, which threw "useNavigate() may be used
  // only in the context of a <Router>" from Layout.tsx. StaticRouter is
  // the long-established, synchronous-safe SSR pattern for this case.
  const { StaticRouter, useRoutes } = await vite.ssrLoadModule("react-router");

  // Fase 3 — must load through the SAME Vite SSR module graph as the app
  // code (Layout.tsx, page components) that imports these, for the exact
  // dual-instance reason noted above for react-router: a plain top-level
  // `import` here would create a second, disconnected copy of the
  // capturedMeta module-level variable, and this script would always read
  // it back as null.
  const { getCapturedMeta, resetCapturedMeta } = await vite.ssrLoadModule(
    "/src/app/seo/capturedMeta.ts",
  );
  const { validatePageMeta, canonicalUrl } = await vite.ssrLoadModule("/src/app/seo/meta.ts");

  function RouteTree({ url }) {
    return React.createElement(
      StaticRouter,
      { location: url },
      React.createElement(RoutesRenderer),
    );
  }
  function RoutesRenderer() {
    return useRoutes(routes);
  }

  const template = await fs.readFile(path.join(distDir, "index.html"), "utf-8");
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('Could not find <div id="root"></div> in dist/index.html — template shape changed.');
  }

  // Fase 7 — sitemap.xml, generated from the actual routes below (never a
  // hardcoded URL list). lastmod comes from each page's own content
  // frontmatter (via captured PageMeta.lastmod); omitted for routes that
  // have no content file rather than inventing a date. Pages that opt
  // into noindex (fase 3's robots override) are excluded — Google's own
  // guidance is that noindexed pages shouldn't be in the sitemap.
  const sitemapEntries = [];

  function priorityFor(url) {
    if (url === "/") return { priority: "1.0", changefreq: "weekly" };
    const segments = url.split("/").filter(Boolean);
    if (segments.length === 1) return { priority: "0.8", changefreq: "monthly" };
    return { priority: "0.7", changefreq: "monthly" };
  }

  for (const url of routesToPrerender) {
    resetCapturedMeta();
    const appHtml = renderToStaticMarkup(React.createElement(RouteTree, { url }));
    let html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    const isNl = url === "/nl" || url.startsWith("/nl/");
    const enUrlPath = isNl ? (url.slice(3) || "/") : url;
    const nlUrlPath = isNl ? url : (url === "/" ? "/nl" : `/nl${url}`);

    const meta = getCapturedMeta();
    if (meta) {
      validatePageMeta(meta); // throws (fails the build) if title/description too long
      html = injectHead(html, meta, canonicalUrl(url), {
        lang: isNl ? "nl" : "en",
        enUrl: canonicalUrl(enUrlPath),
        nlUrl: canonicalUrl(nlUrlPath),
      });
      if (!meta.robots || !meta.robots.includes("noindex")) {
        sitemapEntries.push({ url, lastmod: meta.lastmod, ...priorityFor(url) });
      }
    } else {
      console.warn(`  ! ${url}: geen <Seo> gevonden, head blijft de standaardwaarden houden`);
      sitemapEntries.push({ url, lastmod: undefined, ...priorityFor(url) });
    }

    const outPath =
      url === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, url.slice(1), "index.html");

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html);
    console.log(`prerendered ${url} -> ${path.relative(distDir, outPath)}`);
  }

  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map((e) => {
      const lastmodTag = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${canonicalUrl(e.url)}</loc>${lastmodTag}\n    <priority>${e.priority}</priority>\n    <changefreq>${e.changefreq}</changefreq>\n  </url>`;
    }),
    "</urlset>",
    "",
  ].join("\n");
  await fs.writeFile(path.join(distDir, "sitemap.xml"), sitemapXml);
  console.log(`gegenereerd: sitemap.xml (${sitemapEntries.length} routes)`);

  // 404.html — same shell, NotFoundPage renders for any unmatched path.
  resetCapturedMeta();
  const notFoundHtml = renderToStaticMarkup(
    React.createElement(RouteTree, { url: "/__404__" }),
  );
  let notFoundPage = template.replace(
    '<div id="root"></div>',
    `<div id="root">${notFoundHtml}</div>`,
  );
  const notFoundMeta = getCapturedMeta();
  if (notFoundMeta) {
    validatePageMeta(notFoundMeta);
    notFoundPage = injectHead(notFoundPage, notFoundMeta, canonicalUrl(notFoundMeta.path), {
      lang: "en",
      enUrl: canonicalUrl(notFoundMeta.path),
      nlUrl: canonicalUrl(notFoundMeta.path),
    });
  }
  await fs.writeFile(path.join(distDir, "404.html"), notFoundPage);
  console.log("prerendered 404 -> 404.html");

  await vite.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

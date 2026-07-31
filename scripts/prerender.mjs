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

const PROJECT_SLUGS = [
  "nova-brand-platform",
  "meridian-app-redesign",
  "arco-ecommerce",
  "pulse-analytics",
  "stelz-web-design",
  "verkeersschool-beckers-branding",
  "powermobile",
  "orbit-saas-platform",
  "flux-motion-identity",
];

const SERVICE_SLUGS = [
  "brand-identity",
  "ux-ui-web-design",
  "product-design",
  "creative-thinking",
];

// Fase 2 — nieuwe casestructuur (content/cases/*.md).
const CASE_SLUGS = ["stelz", "a-cafe", "dahley-tonia", "studio75"];

const routesToPrerender = [
  "/",
  // Fase 2 — nieuwe pagina-structuur.
  "/webdesign-almere",
  "/ux-ui-design",
  "/shopify-development",
  "/branding",
  "/cases",
  ...CASE_SLUGS.map((slug) => `/cases/${slug}`),
  "/over-dylan-kho",
  // Bestaande routes.
  "/work",
  ...PROJECT_SLUGS.map((slug) => `/work/${slug}`),
  "/services",
  ...SERVICE_SLUGS.map((slug) => `/services/${slug}`),
  "/about",
  "/contact",
];

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

  for (const url of routesToPrerender) {
    const appHtml = renderToStaticMarkup(React.createElement(RouteTree, { url }));
    const html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    const outPath =
      url === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, url.slice(1), "index.html");

    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, html);
    console.log(`prerendered ${url} -> ${path.relative(distDir, outPath)}`);
  }

  // 404.html — same shell, NotFoundPage renders for any unmatched path.
  const notFoundHtml = renderToStaticMarkup(
    React.createElement(RouteTree, { url: "/__404__" }),
  );
  const notFoundPage = template.replace(
    '<div id="root"></div>',
    `<div id="root">${notFoundHtml}</div>`,
  );
  await fs.writeFile(path.join(distDir, "404.html"), notFoundPage);
  console.log("prerendered 404 -> 404.html");

  await vite.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

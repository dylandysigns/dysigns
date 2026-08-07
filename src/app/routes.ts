import { createBrowserRouter, type RouteObject } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import {
  WebDesignPage,
  SocialMediaMetaAdsPage,
  UxUiDesignPage,
  BrandingPage,
  AiImplementationPage,
  ShopifyDevelopmentPage,
} from "./pages/ServicePages";
import WorkPage from "./pages/WorkPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import InsightsOverviewPage from "./pages/InsightsOverviewPage";
import InsightsDetailPage from "./pages/InsightsDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ThankYouPage from "./pages/ThankYouPage";
import DocsPage from "./pages/DocsPage";
import NotFoundPage from "./pages/NotFoundPage";
import FatinsBirthdayPage from "./pages/FatinsBirthdayPage";
import GiftFatinsBirthdayPage from "./pages/GiftFatinsBirthdayPage";

// Shared route definitions — consumed by createBrowserRouter (client) and by
// scripts/prerender.mjs (createMemoryRouter, build-time HTML generation) so
// there is a single source of truth for the route tree.
//
// Follow-up brief (English-first, full-service repositioning) — this is the
// definitive route list. The earlier Dutch routes and the original
// /services page have been archived under archive/ and are no longer wired
// in here. /work and /about were reverted back to the original,
// projects.ts-backed pages (see archive/content-driven-pages/ for the
// content/work-*.md-driven versions that briefly replaced them).
// Shared between the English tree (mounted at "/") and the Dutch tree
// (mounted at "/nl") — same components both times. Each page reads its
// language from the URL (useLanguage derives it from location.pathname),
// not from these route definitions, so mirroring the array is enough to
// get a fully separate, crawlable, correctly-lang-tagged URL per page.
const localizedChildren: RouteObject[] = [
  { index: true, Component: HomePage },
  { path: "web-design", Component: WebDesignPage },
  { path: "social-media-meta-ads", Component: SocialMediaMetaAdsPage },
  { path: "ux-ui-design", Component: UxUiDesignPage },
  { path: "branding", Component: BrandingPage },
  { path: "ai-implementation", Component: AiImplementationPage },
  // Underneath web design, not in navigation — see ServicePages.tsx.
  { path: "shopify-development", Component: ShopifyDevelopmentPage },
  { path: "work", Component: WorkPage },
  { path: "work/:slug", Component: CaseDetailPage },
  { path: "insights", Component: InsightsOverviewPage },
  { path: "insights/:slug", Component: InsightsDetailPage },
  { path: "about", Component: AboutPage },
  { path: "contact", Component: ContactPage },
];

export const routes: RouteObject[] = [
  // Hidden, unlinked pages — no Header/Footer, no sitemap entry, noindex injected at runtime
  { path: "/fatins-birthday", Component: FatinsBirthdayPage },
  { path: "/gift-fatins-birthday", Component: GiftFatinsBirthdayPage },
  {
    path: "/",
    Component: Layout,
    children: [
      ...localizedChildren,
      // Netlify Forms' native POST redirect target (contact form's
      // action="/thank-you") — always this one English path regardless
      // of which language the form was submitted from, since the form
      // itself has a single static action for Netlify's build-time form
      // detection to find.
      { path: "thank-you", Component: ThankYouPage },
      { path: "docs", Component: DocsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/nl",
    Component: Layout,
    children: [
      ...localizedChildren,
      { path: "*", Component: NotFoundPage },
    ],
  },
];

// Guarded: createBrowserRouter touches `document`, which does not exist
// when this module is loaded under Node for build-time prerendering
// (scripts/prerender.mjs only needs the `routes` array above, never this
// export). In the browser this behaves exactly as before.
export const router = typeof document !== "undefined" ? createBrowserRouter(routes) : undefined;

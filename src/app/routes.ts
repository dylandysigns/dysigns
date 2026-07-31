import { createBrowserRouter, type RouteObject } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import WorkPage from "./pages/WorkPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DocsPage from "./pages/DocsPage";
import NotFoundPage from "./pages/NotFoundPage";
import FatinsBirthdayPage from "./pages/FatinsBirthdayPage";
import GiftFatinsBirthdayPage from "./pages/GiftFatinsBirthdayPage";

// Shared route definitions — consumed by createBrowserRouter (client) and by
// scripts/prerender.mjs (createMemoryRouter, build-time HTML generation) so
// there is a single source of truth for the route tree.
export const routes: RouteObject[] = [
  // Hidden, unlinked pages — no Header/Footer, no sitemap entry, noindex injected at runtime
  { path: "/fatins-birthday", Component: FatinsBirthdayPage },
  { path: "/gift-fatins-birthday", Component: GiftFatinsBirthdayPage },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "work", Component: WorkPage },
      { path: "work/:slug", Component: CaseDetailPage },
      { path: "services", Component: ServicesPage },
      { path: "services/:slug", Component: ServiceDetailPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "docs", Component: DocsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
];

// Guarded: createBrowserRouter touches `document`, which does not exist
// when this module is loaded under Node for build-time prerendering
// (scripts/prerender.mjs only needs the `routes` array above, never this
// export). In the browser this behaves exactly as before.
export const router = typeof document !== "undefined" ? createBrowserRouter(routes) : undefined;

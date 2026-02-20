import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import WorkPage from "./pages/WorkPage";
import CaseDetailPage from "./pages/CaseDetailPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DocsPage from "./pages/DocsPage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "work", Component: WorkPage },
      { path: "work/:slug", Component: CaseDetailPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "docs", Component: DocsPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
import { SITE_URL, canonicalUrl } from "./meta";

// Typed schema.org helper functions (fase 4) — every page-type schema is
// built here, never as a hand-written JSON string on the page itself.
// The site-wide @graph (Organization/ProfessionalService #organization,
// LocalBusiness, WebSite) already lives once in index.html's <head> and
// is not duplicated per page — these helpers only add page-type-specific
// nodes, which reference the existing #organization node by @id rather
// than repeating its data. Team-based site: no Person node, so authorship
// and profile nodes attribute to the Organization, not an individual.

const ORG_ID = `${SITE_URL}/#organization`;

export interface BreadcrumbItem {
  name: string;
  path: string; // route path, e.g. "/" or "/cases/stelz"
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function serviceSchema(opts: {
  name: string;
  description: string;
  path: string;
  areaServed?: string[];
}) {
  return {
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: canonicalUrl(opts.path),
    provider: { "@id": ORG_ID },
    areaServed: opts.areaServed ?? ["Worldwide"],
  };
}

export function creativeWorkSchema(opts: {
  name: string;
  about: string; // client name
  path: string;
  datePublished?: string;
}) {
  return {
    "@type": "CreativeWork",
    name: opts.name,
    url: canonicalUrl(opts.path),
    author: { "@id": ORG_ID },
    // schema.org's `about` expects a Thing, not plain text.
    about: { "@type": "Organization", name: opts.about },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
  };
}

export function profilePageSchema(opts: { path: string }) {
  return {
    "@type": "ProfilePage",
    url: canonicalUrl(opts.path),
    mainEntity: { "@id": ORG_ID },
  };
}

export function articleSchema(opts: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    "@type": "BlogPosting",
    headline: opts.headline,
    description: opts.description,
    url: canonicalUrl(opts.path),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

// Only ever called with real, extracted question/answer pairs (see
// extractFaqItems in loadContent.ts, which filters out TODO_DYLAN
// answers) — emitting FAQPage schema over placeholder text would be
// exactly the kind of fake markup Google's structured-data guidelines
// warn against.
export function faqPageSchema(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

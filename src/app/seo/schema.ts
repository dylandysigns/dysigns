import { SITE_URL, canonicalUrl } from "./meta";

// Typed schema.org helper functions (fase 4) — every page-type schema is
// built here, never as a hand-written JSON string on the page itself.
// The site-wide @graph (Person #person, Organization/ProfessionalService
// #organization, LocalBusiness, WebSite) already lives once in
// index.html's <head> and is not duplicated per page — these helpers only
// add page-type-specific nodes, which reference the existing #person /
// #organization nodes by @id rather than repeating their data.

const PERSON_ID = `${SITE_URL}/#person`;
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
    areaServed: opts.areaServed ?? ["Almere", "Netherlands"],
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
    author: { "@id": PERSON_ID },
    // schema.org's `about` expects a Thing, not plain text.
    about: { "@type": "Organization", name: opts.about },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
  };
}

export function profilePageSchema(opts: { path: string }) {
  return {
    "@type": "ProfilePage",
    url: canonicalUrl(opts.path),
    mainEntity: { "@id": PERSON_ID },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

// Built for reuse once fase 5 supplies real FAQ copy. Not attached to any
// page yet — every "Veelgestelde vragen" section currently holds a
// TODO_DYLAN placeholder, not real question/answer pairs, and emitting
// FAQPage schema over placeholder text would be exactly the kind of fake
// markup Google's structured-data guidelines warn against.
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

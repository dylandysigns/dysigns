// Five active services (English-first, full-service rebuild). Replaces
// the earlier four-service Dutch taxonomy — this file no longer maps
// project tags to services (that mapping doesn't exist for the new
// content/work/*.md cases yet), it's purely the source list for the
// homepage "What we do" section and its routes.
export type ServiceSlug =
  | "web-design"
  | "social-media-meta-ads"
  | "ux-ui-design"
  | "branding"
  | "ai-implementation";

export interface ServiceDefinition {
  slug: ServiceSlug;
}

export const serviceDefinitions: ServiceDefinition[] = [
  { slug: "web-design" },
  { slug: "social-media-meta-ads" },
  { slug: "ux-ui-design" },
  { slug: "branding" },
  { slug: "ai-implementation" },
];

// One real project image per service, from an actual DYSIGNS case that
// matches that service — never a stock/placeholder photo standing in for
// work that wasn't done. Services without a matching case (AI
// implementation) fall back to no image rather than a misleading one.
export const serviceHeroImages: Partial<Record<string, string>> = {
  "web-design": "/images/stelz-laptop.avif",
  "shopify-development": "/images/stelz-laptop.avif",
  "headless-shopify": "/images/stelz-app-v2-store.avif",
  "shopify-migration": "/images/old-new.avif",
  "shopify-integrations": "/images/stelz-laptop.avif",
  "shopify-store-design": "/images/merelymade-web-hero.avif",
  "shopify-b2b": "/images/biyu-partner-portal.avif",
  "web-design-almere": "/images/stelz-laptop.avif",
  "web-design-amsterdam": "/images/biyu-cover.avif",
  "ux-ui-design": "/images/powermobile-overview.avif",
  branding: "/images/beckers-brand-board.png",
  "social-media-meta-ads": "/images/beckers-phone-mockup.avif",
};

// One case image per "What this includes" row, in the same order as the
// ### headings in content/services/<slug>.md, each from a different case
// where the portfolio allows it. `nl` is only needed when the Dutch file has
// a different list of rows than the English one.
const img = (name: string) => `/images/${name}`;
export const serviceIncludeImages: Partial<Record<string, { en: string[]; nl?: string[] }>> = {
  "web-design": {
    // Design, Development, Custom website, Shopify stores, Redesign and migration,
    // Performance and technical SEO
    en: [
      img("sfumato-website.avif"),
      img("stelz-laptop.avif"),
      img("biyu-cover.avif"),
      img("merelymade-shop.avif"),
      img("old-new.avif"),
      img("beckers-cover-laptop-v3.avif"),
    ],
    // Design, Development, Website op maat, Shopify stores
    nl: [img("sfumato-website.avif"), img("stelz-laptop.avif"), img("biyu-cover.avif"), img("merelymade-shop.avif")],
  },
  "shopify-development": {
    // Custom theme, Custom functionality, Optimisation and maintenance,
    // Integrations and apps, Migration to Shopify, Selling internationally
    en: [
      img("merelymade-web-hero.avif"),
      img("stelz-app-v2-store.avif"),
      img("old-new.avif"),
      img("biyu-partner-portal.avif"),
      img("old_product_page1.png"),
      img("merelymade-new-arrivals.avif"),
      // A store your team runs itself, In-house apps, Conversion and mobile
      // (all STËLZ). Shopify Plus, Headless and B2B have no case yet, so they
      // fall back to the service image instead of borrowing an unrelated one.
      img("stelz-web-home.avif"),
      img("stelz-web-product.avif"),
      img("stelz-web-mobile.avif"),
    ],
  },
  "headless-shopify": {
    // Architecture advice, Custom storefront, Content model, Apps check
    en: [img("stelz-app-v2-store.avif"), img("stelz-laptop.avif"), img("merelymade-new-arrivals.avif"), img("old_product_page1.png")],
  },
  "shopify-migration": {
    // Audit, Data, SEO and URLs, Go-live
    en: [img("old_product_page1.png"), img("old-new.avif"), img("beckers-cover-laptop-v3.avif"), img("merelymade-web-hero.avif")],
  },
  "shopify-integrations": {
    // Payments, Inventory, Marketplaces, CRM, Custom API
    en: [img("merelymade-shop.avif"), img("biyu-partner-portal.avif"), img("stelz-app-v2-store.avif"), img("stelz-laptop.avif"), img("powermobile-overview.avif")],
  },
  "shopify-store-design": {
    // Brand, Product pages, Cart and checkout, Sections
    en: [img("merelymade-web-hero.avif"), img("merelymade-shop.avif"), img("stelz-app-v2-store.avif"), img("merelymade-new-arrivals.avif")],
  },
  "shopify-b2b": {
    // Pricing, Company accounts, Ordering, Invoices
    en: [img("biyu-partner-portal.avif"), img("biyu-cover.avif"), img("powermobile-overview.avif"), img("stelz-laptop.avif")],
  },
  "web-design-almere": {
    // Website, Shopify store, Improving what you have
    en: [img("beckers-cover-laptop-v3.avif"), img("stelz-laptop.avif"), img("old-new.avif")],
  },
  "web-design-amsterdam": {
    // Website, Shopify store, Apps and platforms
    en: [img("biyu-cover.avif"), img("merelymade-web-hero.avif"), img("powermobile-overview.avif")],
  },
  "ux-ui-design": {
    // Research, Wireframes and prototypes, Design system, UI design, Accessibility review
    en: [
      img("a-cafe/kiosk-before.avif"),
      img("stelz-app-flow.avif"),
      img("studio75-typography.avif"),
      img("powermobile-overview.avif"),
      img("biyu-app.avif"),
    ],
  },
  branding: {
    // Brand strategy, Logo and visual identity, Design system
    en: [img("studio75-moodboard.avif"), img("studio75-logo-variants.avif"), img("beckers-brand-board.png")],
    // Merkstrategie, Logo en huisstijl, Designsysteem, Brandguidelines
    nl: [
      img("studio75-moodboard.avif"),
      img("studio75-logo-variants.avif"),
      img("beckers-brand-board.png"),
      img("sfumato-principles.avif"),
    ],
  },
  "social-media-meta-ads": {
    // Content, Paid campaigns, Conversion tracking
    en: [img("beckers-phone-mockup.avif"), img("biyu-campaign.avif"), img("powermobile-maps.avif")],
  },
  "ai-implementation": {
    // Workflow assessment, AI creatives, Improving processes with AI, Automation across
    // the business, Dashboards and business insight, AI chat and assistants,
    // Implementation and handoff
    en: [
      img("stelz-app-v2-process.avif"),
      img("merelymade-lookbook.avif"),
      img("stelz-app-flow.avif"),
      img("biyu-partner-portal.avif"),
      img("powermobile-overview.avif"),
      img("stelz-app-community.avif"),
      img("a-cafe/kiosk-before.avif"),
    ],
  },
};

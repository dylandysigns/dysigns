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
  "ux-ui-design": "/images/powermobile-overview.avif",
  branding: "/images/beckers-brand-board.png",
  "social-media-meta-ads": "/images/beckers-phone-mockup.avif",
};

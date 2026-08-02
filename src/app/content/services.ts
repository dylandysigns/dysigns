// Single source of truth for the five active service routes/labels —
// used by RelatedCases, the case-page back-link, and the home page.
// Shopify development is a subpage under web design, not in this list —
// it is not one of the "five cards, five pages" (vervolgopdracht).
export const SERVICES: { slug: string; label: string }[] = [
  { slug: "web-design", label: "Web design and development" },
  { slug: "social-media-meta-ads", label: "Social media and Meta Ads" },
  { slug: "ux-ui-design", label: "UX/UI design" },
  { slug: "branding", label: "Branding" },
  { slug: "ai-implementation", label: "AI implementation" },
];

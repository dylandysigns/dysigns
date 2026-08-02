import { ContentPage } from "../components/ContentPage";
import { RelatedCases } from "../components/RelatedCases";
import { getContent } from "../content/loadContent";
import { serviceSchema, faqPageSchema } from "../seo/schema";

/**
 * The five active service pages, plus Shopify development as a subpage
 * under web design (not in navigation — vervolgopdracht: "de query
 * 'shopify store development' is too valuable to give up but does not
 * belong in the main navigation"). Each reads its content from
 * content/services/*.md.
 */

function ServicePage({
  slug,
  label,
  breadcrumb,
}: {
  slug: string;
  label: string;
  breadcrumb: { label: string; href?: string }[];
}) {
  const entry = getContent(`services/${slug}.md`);
  const path = `/${slug}`;
  return (
    <ContentPage
      entry={entry}
      eyebrow="Service"
      breadcrumb={breadcrumb}
      extraSchema={[
        serviceSchema({
          name: label,
          description: entry.frontmatter.description,
          path,
          areaServed: ["Worldwide"],
        }),
        ...(entry.faqItems.length > 0 ? [faqPageSchema(entry.faqItems)] : []),
      ]}
    >
      <RelatedCases serviceSlug={slug} serviceLabel={label} />
    </ContentPage>
  );
}

const HOME_CRUMB = { label: "Home", href: "/" };

export function WebDesignPage() {
  return (
    <ServicePage
      slug="web-design"
      label="Web design and development"
      breadcrumb={[HOME_CRUMB, { label: "Web design and development" }]}
    />
  );
}

export function SocialMediaMetaAdsPage() {
  return (
    <ServicePage
      slug="social-media-meta-ads"
      label="Social media and Meta Ads"
      breadcrumb={[HOME_CRUMB, { label: "Social media and Meta Ads" }]}
    />
  );
}

export function UxUiDesignPage() {
  return (
    <ServicePage
      slug="ux-ui-design"
      label="UX/UI design"
      breadcrumb={[HOME_CRUMB, { label: "UX/UI design" }]}
    />
  );
}

export function BrandingPage() {
  return (
    <ServicePage
      slug="branding"
      label="Branding"
      breadcrumb={[HOME_CRUMB, { label: "Branding" }]}
    />
  );
}

export function AiImplementationPage() {
  return (
    <ServicePage
      slug="ai-implementation"
      label="AI implementation"
      breadcrumb={[HOME_CRUMB, { label: "AI implementation" }]}
    />
  );
}

export function ShopifyDevelopmentPage() {
  return (
    <ServicePage
      slug="shopify-development"
      label="Shopify development"
      breadcrumb={[
        HOME_CRUMB,
        { label: "Web design and development", href: "/web-design" },
        { label: "Shopify development" },
      ]}
    />
  );
}

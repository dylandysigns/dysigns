import { ContentPage } from "../components/ContentPage";
import { getContent } from "../content/loadContent";

/**
 * The four active service pages (fase 2). Exactly these four — no more —
 * per the brief: "Diensten die niet actief verkocht worden krijgen geen
 * pagina." Each reads its content from content/services/*.md.
 */

function ServicePage({ slug, label }: { slug: string; label: string }) {
  const entry = getContent(`services/${slug}.md`);
  return (
    <ContentPage
      entry={entry}
      eyebrow="Dienst"
      breadcrumb={[
        { label: "Home", href: "/" },
        { label: "Diensten" },
        { label },
      ]}
    />
  );
}

export function WebdesignAlmerePage() {
  return <ServicePage slug="webdesign-almere" label="Webdesign Almere" />;
}

export function UxUiDesignPage() {
  return <ServicePage slug="ux-ui-design" label="UX/UI Design" />;
}

export function ShopifyDevelopmentPage() {
  return <ServicePage slug="shopify-development" label="Shopify development" />;
}

export function BrandingPage() {
  return <ServicePage slug="branding" label="Branding" />;
}

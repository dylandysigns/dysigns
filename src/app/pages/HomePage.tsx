import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "../components/home/Hero";
import { ZoomToGrid } from "../components/home/ZoomToGrid";
import { Services } from "../components/home/Services";
import { KindWords } from "../components/home/KindWords";
import { ContactBand } from "../components/home/ContactBand";
import { Seo } from "../components/Seo";
import { getContent } from "../content/loadContent";
import { faqPageSchema } from "../seo/schema";

const homeContent = getContent("home.md");

export default function HomePage() {
  /**
   * Coordinated refresh — after ALL child sections have mounted and
   * created their ScrollTriggers / pin-spacers, do one final refresh
   * so every pin-spacer height and trigger position is correct.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <Seo
        title={homeContent.frontmatter.title}
        description={homeContent.frontmatter.description}
        path="/"
        lastmod={homeContent.frontmatter.lastUpdated}
        schema={
          homeContent.faqItems.length > 0
            ? [faqPageSchema(homeContent.faqItems)]
            : undefined
        }
      />
      <Hero />
      <ZoomToGrid />
      <Services />
      <KindWords />
      {/* Renders content/home.md's body — "Wat DYSIGNS doet" (links to
          the 4 service pages, fase 6), "Hoe we werken", FAQ. Without
          this, the FAQPage schema above would describe content that
          isn't actually visible on the page, which structured-data
          guidelines explicitly warn against. Reuses the same
          .content-prose treatment as the other content-driven pages —
          no new visual language. */}
      <section
        className="relative"
        style={{ background: "var(--page-bg)" }}
      >
        <div className="max-w-[800px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <div
            className="content-prose"
            dangerouslySetInnerHTML={{ __html: homeContent.bodyHtml }}
          />
        </div>
      </section>
      <ContactBand />
    </>
  );
}

import { useEffect } from "react";
import PortalHero from "../../../preview/PortalHero";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "../components/home/Hero";
import { ZoomToGrid } from "../components/home/ZoomToGrid";
import { Services } from "../components/home/Services";
import { Process } from "../components/home/Process";
import { KindWords } from "../components/home/KindWords";
import { AfterLaunch } from "../components/home/AfterLaunch";
import { FAQ } from "../components/home/FAQ";
import { ContactBand } from "../components/home/ContactBand";
import { Seo } from "../components/Seo";
import { getLocalizedContent } from "../content/loadContent";
import { faqPageSchema } from "../seo/schema";
import { useLanguage } from "../hooks/useLanguage";

// The portal hero (preview/PortalHero.tsx) is the homepage hero. It is imported directly, not
// lazily: the prerender renders to static markup and would otherwise leave the hero out of
// the HTML that search engines read.
// To fall back to the previous hero without a code change, build with VITE_PORTAL_HERO=0.
const USE_PORTAL_HERO = import.meta.env.VITE_PORTAL_HERO !== "0";

export default function HomePage() {
  const { lang } = useLanguage();
  const homeContent = getLocalizedContent("home.md", lang);

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
      {USE_PORTAL_HERO ? (
        // The hero's place in the page: one screen high, so the page scrolls on from it
        // like any section.
        <div style={{ position: "relative", height: "100svh", overflow: "hidden" }}>
          <PortalHero />
        </div>
      ) : (
        <Hero />
      )}
      <ZoomToGrid />
      <Services />
      <FAQ />
      <Process />
      <KindWords />
      <AfterLaunch />
      <ContactBand />
    </>
  );
}

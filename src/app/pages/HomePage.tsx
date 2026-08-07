import { useEffect } from "react";
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
      <Hero />
      <ZoomToGrid />
      <Services />
      <Process />
      <KindWords />
      <AfterLaunch />
      <FAQ />
      <ContactBand />
    </>
  );
}

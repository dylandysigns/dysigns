import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Hero } from "../components/home/Hero";
import { SentenceReveal } from "../components/home/SentenceReveal";
import { ZoomToGrid } from "../components/home/ZoomToGrid";
import { Partners } from "../components/home/Partners";
import { DesignTimeline } from "../components/home/DesignTimeline";
import { Services } from "../components/home/Services";
import { KindWords } from "../components/home/KindWords";
import { ContactBand } from "../components/home/ContactBand";

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
      <Hero />
      <SentenceReveal />
      <ZoomToGrid />
      <Partners />
      <DesignTimeline />
      <Services />
      <KindWords />
      <ContactBand />
    </>
  );
}
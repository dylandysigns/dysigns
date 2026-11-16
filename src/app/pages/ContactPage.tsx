import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../hooks/useLanguage";
import { Seo } from "../components/Seo";
import { LeadForm } from "../components/contact/LeadForm";
import { ContactEmblem } from "../components/contact/ContactEmblem";
import { ContactSpace } from "../components/contact/ContactSpace";
import { getLocalizedContent } from "../content/loadContent";
import { breadcrumbListSchema } from "../seo/schema";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useLanguage();
  const contactContent = getLocalizedContent("contact.md", lang);

  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // Reduced motion: jump straight to the settled state instead of
      // skipping the effect, since these elements start at opacity 0 in
      // their inline styles and would otherwise never become visible.
      if (reduced) {
        const cards = cardsRef.current.filter(Boolean);
        gsap.set(
          [headRef.current, subRef.current, ...cards].filter(
            Boolean,
          ),
          { opacity: 1, y: 0, scale: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });

      // Heading with scale punch
      if (headRef.current) {
        tl.fromTo(
          headRef.current,
          { y: 30, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
          0.1,
        );
      }

      // Subtitle
      if (subRef.current) {
        tl.fromTo(
          subRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          0.25,
        );
      }

      // Contact cards staggered with slight scale
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length) {
        tl.fromTo(
          cards,
          { y: 28, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.55,
            stagger: 0.12,
            ease: "back.out(1.2)",
          },
          0.35,
        );
      }

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 overflow-hidden"
      style={{ background: "#000" }}
    >
      <Seo
        title={contactContent.frontmatter.title}
        description={contactContent.frontmatter.description}
        path="/contact"
        lastmod={contactContent.frontmatter.lastUpdated}
        schema={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />
      <ContactSpace />
      <svg
        className="absolute top-6 left-6 w-10 h-10 pointer-events-none"
        viewBox="0 0 40 40"
      >
        <path
          d="M0 16 L0 0 L16 0"
          stroke="rgba(var(--page-fg-rgb), .08)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <svg
        className="absolute bottom-6 right-6 w-10 h-10 pointer-events-none"
        viewBox="0 0 40 40"
      >
        <path
          d="M40 24 L40 40 L24 40"
          stroke="rgba(var(--page-fg-rgb), .08)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <div className="relative max-w-[760px] w-full mx-auto text-center">
        <ContactEmblem />
        <h1
          ref={headRef}
          className="mt-2"
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(1.5rem,3.2vw,2.3rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            color: "var(--page-fg)",
            lineHeight: 1.1,
            opacity: 0,
          }}
        >
          {t("contact.headline")}
        </h1>
        <p
          ref={subRef}
          className="mt-3 mx-auto max-w-md"
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(.9rem,1.1vw,1rem)",
            color: "rgba(var(--page-fg-rgb), .55)",
            lineHeight: 1.5,
          }}
        >
          {t("contact.sub")}
        </p>

        <div
          ref={contentRef}
          className="mt-6 space-y-6"
        >
          {/* Three large fields in one view, written in space (see LeadForm.tsx). Email, WhatsApp and
              Instagram live in the footer, so they are not repeated here. */}
          <div
            ref={(el) => {
              cardsRef.current[0] = el;
            }}
            style={{ opacity: 0 }}
          >
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}

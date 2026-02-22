import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../data/content";
import { aboutImage } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { TransitionLink } from "../components/TransitionLink";
import { useLanguage } from "../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const valuesRef = useRef<(HTMLDivElement | null)[]>([]);
  const cursor = useCursor();
  const { t } = useLanguage();

  /**
   * Track whether entrance animations have fired.
   * After first run, re-renders (e.g. language toggle) skip
   * setting opacity: 0 so cards stay visible.
   */
  const animDone = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      animDone.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      if (imgRef.current) {
        gsap.fromTo(
          imgRef.current,
          { y: 40 },
          {
            y: -40,
            ease: "none",
            scrollTrigger: {
              trigger: imgRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      }

      if (headRef.current) {
        gsap.fromTo(
          headRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: headRef.current, start: "top 85%", once: true },
          },
        );
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: textRef.current, start: "top 88%", once: true },
          },
        );
      }

      valuesRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 90%", once: true },
            onComplete: () => { animDone.current = true; },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const values = [
    { title: t("about.value0.title"), text: t("about.value0.text") },
    { title: t("about.value1.title"), text: t("about.value1.text") },
    { title: t("about.value2.title"), text: t("about.value2.text") },
    { title: t("about.value3.title"), text: t("about.value3.text") },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: "#000", minHeight: "100vh" }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "55vh", minHeight: 350 }}
      >
        <div ref={imgRef} className="absolute inset-[-10%]">
          <img
            src={aboutImage}
            alt="DYSIGNS team"
            className="w-full h-full object-cover"
            style={{
              filter: "grayscale(.9) brightness(.45) contrast(1.1)",
            }}
            loading="eager"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,.3) 50%, rgba(0,0,0,.15) 100%)",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-10">
          <div className="max-w-[1200px] mx-auto">
            <span
              style={{
                fontSize: ".6rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.45)",
              }}
            >
              {t("about.label")}
            </span>
            <h1
              className="mt-3"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(2rem,5vw,3.5rem)",
                fontWeight: 700,
                letterSpacing: "-.04em",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              {t("vision.title")}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <h2
          ref={headRef}
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1.3rem,2.5vw,1.8rem)",
            fontWeight: 700,
            letterSpacing: "-.03em",
            color: "#fff",
            lineHeight: 1.2,
          }}
        >
          {t("about.storyTitle")}
        </h2>
        <p
          ref={textRef}
          className="mt-6"
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "clamp(.95rem,1.3vw,1.15rem)",
            fontStyle: "italic",
            lineHeight: 1.75,
            color: "rgba(255,255,255,.6)",
          }}
        >
          {t("vision.text")} {t("about.storyText")}
        </p>
        <div
          className="mt-8"
          style={{ width: 40, height: 1, background: "rgba(255,255,255,.08)" }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-16 md:pb-24">
        <span
          style={{
            fontSize: ".6rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {t("about.valuesLabel")}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {values.map((v, i) => (
            <div
              key={i}
              ref={(el) => {
                valuesRef.current[i] = el;
              }}
              className="group relative p-7 md:p-9 rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(255,255,255,.06)",
                background: "rgba(255,255,255,.02)",
                transition: "border-color .4s",
                opacity: animDone.current ? 1 : 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.14)";
                cursor.set("link");
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(255,255,255,.06)";
                cursor.reset();
              }}
            >
              <div
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,rgba(255,255,255,.05),transparent)",
                  transition: "transform .7s ease-out",
                }}
              />
              <h3
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-.02em",
                }}
              >
                {v.title}
              </h3>
              <p
                className="mt-2"
                style={{
                  fontSize: ".88rem",
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,.6)",
                }}
              >
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="border-t py-20 text-center"
        style={{ borderColor: "rgba(255,255,255,.04)" }}
      >
        <h2
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1.5rem,3vw,2.2rem)",
            fontWeight: 700,
            letterSpacing: "-.03em",
            color: "#fff",
          }}
        >
          {t("about.ctaTitle")}
        </h2>
        <TransitionLink
          to="/contact"
          className="inline-block mt-8 px-7 py-3 rounded-full border border-white/20 group relative overflow-hidden"
          style={{
            fontSize: ".78rem",
            fontWeight: 600,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "#fff",
          }}
          onMouseEnter={() => cursor.set("link")}
          onMouseLeave={() => cursor.reset()}
        >
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)",
              transition: "transform .7s ease-out",
            }}
          />
          {t("about.ctaButton")}
        </TransitionLink>
      </div>
    </section>
  );
}
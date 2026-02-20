import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../../data/content";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

export function VisionSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      // parallax on image
      gsap.fromTo(
        imgRef.current,
        { y: 60 },
        {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );

      // text reveal
      gsap.fromTo(
        headRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        textRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 88%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="vision"
      className="relative py-24 md:py-36 px-6 md:px-12 lg:px-16"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
      }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* image */}
        <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "4/5" }}>
          <div ref={imgRef} className="absolute inset-[-15%]">
            <img
              src={siteContent.vision.image}
              alt="DYSIGNS vision"
              className="w-full h-full object-cover"
              style={{
                filter: "grayscale(.9) brightness(.6) contrast(1.1)",
              }}
              loading="lazy"
            />
          </div>
          {/* corner frames */}
          <svg
            className="absolute top-3 left-3 w-8 h-8 pointer-events-none"
            viewBox="0 0 32 32"
          >
            <path
              d="M0 14 L0 0 L14 0"
              stroke="rgba(255,255,255,.15)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <svg
            className="absolute bottom-3 right-3 w-8 h-8 pointer-events-none"
            viewBox="0 0 32 32"
          >
            <path
              d="M32 18 L32 32 L18 32"
              stroke="rgba(255,255,255,.15)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        {/* text */}
        <div>
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.45)",
            }}
          >
            {t("vision.label")}
          </span>
          <h2
            ref={headRef}
            className="mt-4"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(1.5rem,3vw,2.4rem)",
              fontWeight: 700,
              letterSpacing: "-.03em",
              color: "#fff",
              lineHeight: 1.15,
              opacity: 0,
            }}
          >
            {t("vision.title")}
          </h2>
          <p
            ref={textRef}
            className="mt-5"
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(.95rem,1.3vw,1.1rem)",
              fontStyle: "italic",
              lineHeight: 1.7,
              color: "rgba(255,255,255,.6)",
              opacity: 0,
            }}
          >
            {t("vision.text")}
          </p>
          <div
            className="mt-8"
            style={{
              width: 40,
              height: 1,
              background: "rgba(255,255,255,.1)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
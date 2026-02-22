import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/**
 * SentenceReveal — IT Building-style scroll-driven text reveal
 *
 * Behaviour:
 *  - Section pins when it reaches the top of the viewport
 *  - As the user scrolls, characters reveal from ghosted-grey -> full white
 *  - Each character is wrapped in a span for individual scrub control
 *  - When the sentence is fully revealed, normal scroll resumes
 *
 * Reduced-motion fallback:
 *  - No pin, sentence fades in as a block
 *
 * NOTE: resize + font-load ScrollTrigger.refresh is handled globally in Layout.tsx
 */
export function SentenceReveal() {
  const { t } = useLanguage();
  const sentence = t("sentence");
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Build character spans on mount / language change */
  useEffect(() => {
    const container = textRef.current;
    if (!container) return;

    container.innerHTML = "";
    charsRef.current = [];

    sentence.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.display = "inline-block";
      span.style.color = "rgba(255,255,255,0.1)";
      span.style.transition = "none";
      container.appendChild(span);
      charsRef.current.push(span);
    });
  }, [sentence]);

  /* GSAP scroll-driven reveal */
  useEffect(() => {
    if (reduced) return;

    const section = sectionRef.current;
    const chars = charsRef.current;
    if (!section || chars.length === 0) return;

    // Revert any previous context (e.g. language change)
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }

    ctxRef.current = gsap.context(() => {
      gsap.to(chars, {
        color: "rgba(255,255,255,1)",
        stagger: {
          each: 1 / chars.length,
        },
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=80%",
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });
    }, section);

    return () => {
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, [reduced, sentence]);

  if (reduced) {
    return (
      <div
        className="relative flex items-center justify-center py-32 md:py-48 px-6"
        style={{ background: "#000" }}
      >
        <p
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(2rem,7vw,5.5rem)",
            fontWeight: 800,
            letterSpacing: "-.04em",
            color: "#fff",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          {sentence}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{
        background: "#000",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div className="h-full flex items-center justify-center px-6 md:px-16">
        <div
          ref={textRef}
          aria-label={sentence}
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(2rem,7vw,5.5rem)",
            fontWeight: 800,
            letterSpacing: "-.04em",
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: "90vw",
            userSelect: "none",
          }}
        />
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
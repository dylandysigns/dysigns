import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail } from "lucide-react";
import { siteContent } from "../../data/content";
import { useCursor } from "../../hooks/useCursor";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/* WhatsApp inline SVG icon — same as Header */
function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

export function ContactBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
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
      gsap.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          delay: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 90%", once: true },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const c = siteContent.contact;

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative py-32 md:py-44 px-6 md:px-12 text-center"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
      }}
    >
      {/* corner accents */}
      <svg
        className="absolute top-6 left-6 w-10 h-10 pointer-events-none"
        viewBox="0 0 40 40"
      >
        <path
          d="M0 16 L0 0 L16 0"
          stroke="rgba(255,255,255,.08)"
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
          stroke="rgba(255,255,255,.08)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      <h2
        ref={headRef}
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: "clamp(1.8rem,5vw,3.5rem)",
          fontWeight: 700,
          letterSpacing: "-.04em",
          color: "#fff",
          lineHeight: 1.1,
          opacity: 0,
        }}
      >
        {t("contact.headline")}
      </h2>
      <p
        className="mt-5 mx-auto max-w-md"
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: "clamp(.95rem,1.3vw,1.15rem)",
          fontStyle: "italic",
          color: "rgba(255,255,255,.6)",
          lineHeight: 1.6,
        }}
      >
        {t("contact.sub")}
      </p>

      <div
        ref={ctaRef}
        className="mt-10 flex flex-wrap items-center justify-center gap-4"
        style={{ opacity: 0 }}
      >
        <a
          href={`mailto:${c.email}`}
          className="relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-white/20 group"
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
          <Mail size={15} strokeWidth={1.5} /> {t("contact.emailUs")}
        </a>
        <a
          href={`https://wa.me/${c.whatsapp.replace(/\+/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative overflow-hidden inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-white/10 group"
          style={{
            fontSize: ".78rem",
            fontWeight: 500,
            letterSpacing: ".06em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.5)",
          }}
          onMouseEnter={() => cursor.set("link")}
          onMouseLeave={() => cursor.reset()}
        >
          <span
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent)",
              transition: "transform .7s ease-out",
            }}
          />
          <WhatsAppIcon size={15} /> WhatsApp
        </a>
      </div>
    </section>
  );
}

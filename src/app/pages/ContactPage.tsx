import { useEffect, useRef } from "react";
import { Mail, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../data/content";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/* WhatsApp inline SVG icon — same as Header / Footer */
function WhatsAppIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
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
      className={className}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0a5 5 0 0 0 5 5m0 0h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1Z" />
    </svg>
  );
}

export default function ContactPage() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      if (headRef.current) {
        gsap.fromTo(
          headRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.2 },
        );
      }
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.35 },
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const c = siteContent.contact;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12"
      style={{ background: "#000" }}
    >
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

      <div className="max-w-[700px] mx-auto text-center">
        <span
          style={{
            fontSize: ".7rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {t("contact.label")}
        </span>
        <h1
          ref={headRef}
          className="mt-4"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            color: "#fff",
            lineHeight: 1.1,
            opacity: 0,
          }}
        >
          {t("contact.headline")}
        </h1>
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
          ref={contentRef}
          className="mt-12 space-y-6"
          style={{ opacity: 0 }}
        >
          <a
            href={`mailto:${c.email}`}
            className="group flex items-center justify-center gap-3 p-6 rounded-xl transition-all duration-300"
            style={{
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.02)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,.18)";
              cursor.set("link");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,.08)";
              cursor.reset();
            }}
          >
            <Mail
              size={18}
              strokeWidth={1.5}
              className="text-white/35 group-hover:text-white/65 transition-colors duration-300"
            />
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.6)",
              }}
              className="group-hover:text-white transition-colors duration-300"
            >
              {c.email}
            </span>
            <ArrowUpRight
              size={14}
              className="text-white/20 group-hover:text-white/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>

          <a
            href={`https://wa.me/${c.whatsapp.replace(/\+/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 p-6 rounded-xl transition-all duration-300"
            style={{
              border: "1px solid rgba(255,255,255,.08)",
              background: "rgba(255,255,255,.02)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,.18)";
              cursor.set("link");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,.08)";
              cursor.reset();
            }}
          >
            <WhatsAppIcon
              size={18}
              className="text-white/35 group-hover:text-white/65 transition-colors duration-300"
            />
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 500,
                color: "rgba(255,255,255,.6)",
              }}
              className="group-hover:text-white transition-colors duration-300"
            >
              WhatsApp
            </span>
            <ArrowUpRight
              size={14}
              className="text-white/20 group-hover:text-white/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>

          <div className="pt-8">
            <span
              style={{
                fontSize: ".65rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.4)",
              }}
            >
              {t("contact.followUs")}
            </span>
            <div className="flex items-center justify-center gap-5 mt-4 flex-wrap">
              {siteContent.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  className="transition-colors duration-300 hover:text-white"
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 500,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.45)",
                  }}
                  onMouseEnter={() => cursor.set("link")}
                  onMouseLeave={() => cursor.reset()}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
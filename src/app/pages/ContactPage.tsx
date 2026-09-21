import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../data/content";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { Seo } from "../components/Seo";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { getLocalizedContent } from "../content/loadContent";
import { breadcrumbListSchema } from "../seo/schema";

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
  const { t, lang } = useLanguage();
  const contactContent = getLocalizedContent("contact.md", lang);

  const labelRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const socialsRef = useRef<HTMLDivElement>(null);
  const submitFillRef = useRef<HTMLSpanElement>(null);
  const submitRectRef = useRef<DOMRect | null>(null);
  // Stamped on mount so the server can tell a human (who takes a few seconds
  // to type) from a bot posting straight to /api/contact.
  const tsRef = useRef<HTMLInputElement>(null);
  const [verifyFailed, setVerifyFailed] = useState(false);

  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
    setVerifyFailed(new URLSearchParams(window.location.search).get("error") === "verify");
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      // Reduced motion: jump straight to the settled state instead of
      // skipping the effect, since these elements start at opacity 0 in
      // their inline styles and would otherwise never become visible.
      if (reduced) {
        const cards = cardsRef.current.filter(Boolean);
        const socialLinks = socialsRef.current
          ? Array.from(socialsRef.current.querySelectorAll("a"))
          : [];
        gsap.set(
          [labelRef.current, headRef.current, subRef.current, ...cards, ...socialLinks].filter(
            Boolean,
          ),
          { opacity: 1, y: 0, scale: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ delay: 0.15 });

      // Label slides in
      if (labelRef.current) {
        tl.fromTo(
          labelRef.current,
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
          0,
        );
      }

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

      // Socials staggered
      if (socialsRef.current) {
        const socialLinks = socialsRef.current.querySelectorAll("a");
        if (socialLinks.length) {
          tl.fromTo(
            socialLinks,
            { y: 16, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "power3.out",
            },
            0.6,
          );
        }
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const c = siteContent.contact;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12"
      style={{ background: "var(--page-bg)" }}
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

      <div className="max-w-[700px] mx-auto text-center">
        <span
          ref={labelRef}
          style={{
            fontSize: ".7rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .55)",
            display: "inline-block",
          }}
        >
          {t("contact.label")}
        </span>
        <h1
          ref={headRef}
          className="mt-4"
          style={{
            fontFamily: "var(--font-brand)",
            fontSize: "clamp(2rem,5vw,3.5rem)",
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
          className="mt-5 mx-auto max-w-md"
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "clamp(.95rem,1.3vw,1.15rem)",
            fontStyle: "italic",
            color: "rgba(var(--page-fg-rgb), .6)",
            lineHeight: 1.6,
          }}
        >
          {t("contact.sub")}
        </p>

        <div
          ref={contentRef}
          className="mt-10 space-y-6"
        >
          <a
            ref={(el) => { cardsRef.current[0] = el; }}
            href={`https://wa.me/${c.whatsapp.replace(/\+/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 p-6 rounded-xl transition-all duration-300"
            style={{
              border: "1px solid rgba(var(--page-fg-rgb), .08)",
              background: "rgba(var(--page-fg-rgb), .02)",
              color: "rgba(var(--page-fg-rgb), .55)",
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(var(--page-fg-rgb), .18)";
              (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
              cursor.set("link");
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(var(--page-fg-rgb), .08)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(var(--page-fg-rgb), .55)";
              cursor.reset();
            }}
          >
            <WhatsAppIcon size={18} />
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {t("contact.sendWhatsapp")}
            </span>
          </a>

          <div className="flex items-center gap-4 max-w-[420px] mx-auto">
            <span
              style={{ flex: 1, height: 1, background: "rgba(var(--page-fg-rgb), .12)" }}
            />
            <span
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(var(--page-fg-rgb), .5)",
              }}
            >
              {t("contact.or")}
            </span>
            <span
              style={{ flex: 1, height: 1, background: "rgba(var(--page-fg-rgb), .12)" }}
            />
          </div>

          <form
            ref={(el) => { cardsRef.current[1] = el; }}
            name="contact"
            method="POST"
            action="/api/contact"
            className="text-left p-6 sm:p-8 rounded-2xl"
            style={{
              border: "1px solid rgba(var(--page-fg-rgb), .08)",
              background: "rgba(var(--page-fg-rgb), .02)",
              opacity: 0,
              transform: "rotate(-0.4deg)",
            }}
          >
            <p className="hidden">
              <label>
                Don't fill this out: <input name="bot-field" />
              </label>
            </p>
            <input type="hidden" name="ts" ref={tsRef} />

            <div>
              <label
                htmlFor="contact-email"
                className="block mb-2"
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                  fontSize: "1.15rem",
                  color: "var(--page-fg)",
                }}
              >
                {t("contact.form.emailLabel")}
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                required
                aria-required="true"
                placeholder={t("contact.form.emailPlaceholder")}
                className="w-full bg-transparent outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontSize: "1rem",
                  color: "var(--page-fg)",
                  padding: "12px 4px",
                  borderBottom: "1.5px dashed rgba(var(--page-fg-rgb), .2)",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor =
                    "rgba(var(--page-fg-rgb), .5)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor =
                    "rgba(var(--page-fg-rgb), .2)";
                }}
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="contact-message"
                className="block mb-2"
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: "italic",
                  fontSize: "1.15rem",
                  color: "var(--page-fg)",
                }}
              >
                {t("contact.form.messageLabel")}
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                aria-required="true"
                rows={4}
                placeholder={t("contact.form.messagePlaceholder")}
                className="w-full bg-transparent outline-none resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                style={{
                  fontFamily: "var(--font-brand)",
                  fontSize: "1rem",
                  color: "var(--page-fg)",
                  padding: "12px 4px",
                  borderBottom: "1.5px dashed rgba(var(--page-fg-rgb), .2)",
                }}
                onFocus={(e) => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor =
                    "rgba(var(--page-fg-rgb), .5)";
                }}
                onBlur={(e) => {
                  (e.currentTarget as HTMLElement).style.borderBottomColor =
                    "rgba(var(--page-fg-rgb), .2)";
                }}
              />
            </div>

            <TurnstileWidget />

            {verifyFailed && (
              <p
                role="alert"
                className="mt-4"
                style={{ fontFamily: "var(--font-brand)", fontSize: ".85rem", color: "#ff8a80" }}
              >
                {t("contact.form.verifyError")}
              </p>
            )}

            <button
              type="submit"
              className="relative mt-6 flex w-full items-center justify-center overflow-hidden rounded-full"
              style={{
                border: "1.5px solid rgba(var(--page-fg-rgb), .25)",
                background: "transparent",
                padding: "15px 22px",
                isolation: "isolate",
              }}
              onMouseEnter={(e) => {
                cursor.set("link");
                const rect = e.currentTarget.getBoundingClientRect();
                submitRectRef.current = rect;
                const fill = submitFillRef.current;
                if (fill) {
                  const px = ((e.clientX - rect.left) / rect.width) * 100;
                  const py = ((e.clientY - rect.top) / rect.height) * 100;
                  fill.style.transition = "none";
                  fill.style.clipPath = `circle(0% at ${px}% ${py}%)`;
                  void fill.offsetHeight;
                  fill.style.transition = "clip-path .55s cubic-bezier(.16,1,.3,1)";
                  fill.style.clipPath = `circle(140% at ${px}% ${py}%)`;
                }
              }}
              onMouseLeave={(e) => {
                cursor.reset();
                const rect = submitRectRef.current;
                const fill = submitFillRef.current;
                if (rect && fill) {
                  const px = ((e.clientX - rect.left) / rect.width) * 100;
                  const py = ((e.clientY - rect.top) / rect.height) * 100;
                  fill.style.clipPath = `circle(0% at ${px}% ${py}%)`;
                }
                submitRectRef.current = null;
              }}
            >
              <span
                ref={submitFillRef}
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: "var(--page-fg)", clipPath: "circle(0% at 50% 50%)" }}
              />
              <span
                style={{
                  position: "relative",
                  color: "var(--page-fg)",
                  mixBlendMode: "difference",
                  fontFamily: "var(--font-brand)",
                  fontSize: ".9rem",
                  fontWeight: 600,
                  letterSpacing: "-.01em",
                }}
              >
                {t("contact.form.submit")}
              </span>
            </button>
          </form>

          <div className="pt-8">
            <span
              style={{
                fontSize: ".65rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .4)",
              }}
            >
              {t("contact.followUs")}
            </span>
            <div ref={socialsRef} className="flex items-center justify-center gap-5 mt-4 flex-wrap">
              {siteContent.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  className="transition-colors duration-300"
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 500,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "rgba(var(--page-fg-rgb), .55)",
                  }}
                  onMouseEnter={(e) => {
                    cursor.set("link");
                    (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                  }}
                  onMouseLeave={(e) => {
                    cursor.reset();
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(var(--page-fg-rgb), .55)";
                  }}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>

          <div
            className="pt-6 flex flex-col items-center gap-1.5"
            style={{
              fontSize: ".82rem",
              color: "rgba(var(--page-fg-rgb), .5)",
            }}
          >
            <span>
              {t("contact.nap.emailLabel")}:{" "}
              <a
                href={`mailto:${c.email}`}
                style={{ color: "rgba(var(--page-fg-rgb), .7)" }}
              >
                {c.email}
              </a>
            </span>
            <span>
              {t("contact.nap.phoneLabel")}:{" "}
              <a
                href={`tel:${c.whatsapp}`}
                style={{ color: "rgba(var(--page-fg-rgb), .7)" }}
              >
                {c.whatsapp}
              </a>
            </span>
            <span>{t("contact.nap.location")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

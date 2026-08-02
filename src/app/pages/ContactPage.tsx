import { useEffect, useRef } from "react";
import { Mail, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../data/content";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { Breadcrumb } from "../components/Breadcrumb";
import { Seo } from "../components/Seo";
import { getContent } from "../content/loadContent";
import { breadcrumbListSchema } from "../seo/schema";

gsap.registerPlugin(ScrollTrigger);

const contactContent = getContent("contact.md");

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

  const labelRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const socialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
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
      <div className="absolute top-24 left-6 md:left-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      </div>

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
            color: "rgba(var(--page-fg-rgb), .45)",
            display: "inline-block",
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

        {/* Contact form — at the top of the page, per the brief: nobody
            arriving from the pricing FAQ should have to scroll first.
            Netlify Forms (native platform feature, no new dependency):
            the name="contact" + data-netlify="true" + honeypot below are
            enough for Netlify's build-time form detection to pick this
            up, since /contact is prerendered to static HTML. */}
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          action="/contact?submitted=true"
          className="mt-10 mx-auto max-w-md text-left"
        >
          <input type="hidden" name="form-name" value="contact" />
          <p style={{ position: "absolute", left: "-9999px" }}>
            <label>
              Don&apos;t fill this out if you&apos;re human: <input name="bot-field" />
            </label>
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="contact-name"
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .5)",
                  marginBottom: ".4rem",
                }}
              >
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                style={{
                  background: "rgba(var(--page-fg-rgb), .03)",
                  border: "1px solid rgba(var(--page-fg-rgb), .12)",
                  color: "var(--page-fg)",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .5)",
                  marginBottom: ".4rem",
                }}
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                style={{
                  background: "rgba(var(--page-fg-rgb), .03)",
                  border: "1px solid rgba(var(--page-fg-rgb), .12)",
                  color: "var(--page-fg)",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-deadline"
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .5)",
                  marginBottom: ".4rem",
                }}
              >
                Deadline (optional)
              </label>
              <input
                id="contact-deadline"
                name="deadline"
                type="text"
                className="w-full rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                style={{
                  background: "rgba(var(--page-fg-rgb), .03)",
                  border: "1px solid rgba(var(--page-fg-rgb), .12)",
                  color: "var(--page-fg)",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  fontWeight: 500,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .5)",
                  marginBottom: ".4rem",
                }}
              >
                What do you want to achieve?
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                className="w-full rounded-lg px-4 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                style={{
                  background: "rgba(var(--page-fg-rgb), .03)",
                  border: "1px solid rgba(var(--page-fg-rgb), .12)",
                  color: "var(--page-fg)",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-full px-6 py-3 transition-colors duration-300"
              style={{
                background: "var(--page-fg)",
                color: "var(--page-bg)",
                fontSize: ".95rem",
                fontWeight: 600,
              }}
              onMouseEnter={() => cursor.set("link")}
              onMouseLeave={() => cursor.reset()}
            >
              Send
            </button>
          </div>
        </form>

        <div
          ref={contentRef}
          className="mt-12 space-y-6"
        >
          <a
            ref={(el) => { cardsRef.current[0] = el; }}
            href={`mailto:${c.email}`}
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
            <Mail size={18} strokeWidth={1.5} style={{ opacity: 0.72 }} />
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 500,
              }}
            >
              {c.email}
            </span>
            <ArrowUpRight
              size={14}
              className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ opacity: 0.55 }}
            />
          </a>

          <a
            ref={(el) => { cardsRef.current[1] = el; }}
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
              WhatsApp
            </span>
            <ArrowUpRight
              size={14}
              className="transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ opacity: 0.55 }}
            />
          </a>

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
                    color: "rgba(var(--page-fg-rgb), .45)",
                  }}
                  onMouseEnter={(e) => {
                    cursor.set("link");
                    (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                  }}
                  onMouseLeave={(e) => {
                    cursor.reset();
                    (e.currentTarget as HTMLElement).style.color =
                      "rgba(var(--page-fg-rgb), .45)";
                  }}
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

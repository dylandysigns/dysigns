import { useState, useEffect, useRef } from "react";
import { Mail, Instagram } from "lucide-react";
import { siteContent } from "../data/content";
import { TransitionLink } from "./TransitionLink";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { useLocation } from "react-router";
import logoImg from "../../assets/dysigns_white.png";
import { crawlHref } from "../seo/href";

/* WhatsApp inline SVG icon — same as Header */
function WhatsAppIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
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

/** Pill with the icon and its label always visible */
function ContactPill({
  href,
  label,
  ariaLabel,
  cursorLabel,
  icon,
  external,
  cursorApi,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  cursorLabel: string;
  icon: React.ReactNode;
  external?: boolean;
  cursorApi: ReturnType<typeof useCursor>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="relative flex items-center h-9 rounded-full border transition-all duration-300 overflow-hidden group"
      style={{
        paddingLeft: 13,
        paddingRight: 15,
        borderColor: hovered ? "rgba(var(--page-fg-rgb), .25)" : "rgba(var(--page-fg-rgb), .1)",
      }}
      onMouseEnter={() => {
        setHovered(true);
        cursorApi.set("link", cursorLabel);
      }}
      onMouseLeave={() => {
        setHovered(false);
        cursorApi.reset();
      }}
    >
      {/* sweep */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(var(--page-fg-rgb), .1),transparent)",
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform .7s ease-out",
        }}
      />
      {/* icon */}
      <span className="relative z-10 flex-shrink-0" style={{ color: hovered ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .45)", transition: "color .3s" }}>
        {icon}
      </span>
      {/* label */}
      <span
        className="relative z-10 whitespace-nowrap"
        style={{
          fontSize: ".62rem",
          fontWeight: 500,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: hovered ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .6)",
          paddingLeft: 8,
          transition: "color .3s",
        }}
      >
        {label}
      </span>
    </a>
  );
}

export function Footer() {
  const c = siteContent.contact;
  const cursor = useCursor();
  const { t, lang, toggleLang } = useLanguage();
  const { pathname } = useLocation();
  // Real, crawlable link to the same page in the other language (the header
  // toggle is a button, which search engines cannot follow).
  const bare = pathname.replace(/^\/nl(?=\/|$)/, "") || "/";
  const otherLangHref = lang === "en" ? (bare === "/" ? "/nl/" : `/nl${bare}`) : bare;
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const instagram = siteContent.socials.find(
    (s) => s.name.toLowerCase() === "instagram",
  );

  /* ─── SCROLL-REVEAL ENTRANCE ───
     Done with an IntersectionObserver and plain CSS transitions, not ScrollTrigger and GSAP:
     a page change kills every ScrollTrigger and running tween (see Layout.tsx), and a footer
     whose reveal was killed before it played stayed invisible on every page after that. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const footer = footerRef.current;
    const inner = innerRef.current;
    if (reduced || !footer || !inner || typeof IntersectionObserver === "undefined") return;

    const kids = Array.from(inner.children) as HTMLElement[];
    kids.forEach((el) => {
      el.style.transition = "none";
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
    });
    const show = () => {
      kids.forEach((el, i) => {
        el.style.transition = `opacity .6s ease ${i * 0.1}s, transform .6s cubic-bezier(.22,1,.36,1) ${i * 0.1}s`;
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(footer);
    // a page too short to scroll, or a layout that never reports: never leave the footer hidden
    const safety = window.setTimeout(show, 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
      kids.forEach((el) => {
        el.style.transition = "";
        el.style.opacity = "";
        el.style.transform = "";
      });
    };
  }, [pathname]);

  return (
    <footer
      ref={footerRef}
      className="relative py-14 px-6 md:px-12"
      style={{
        background: "var(--page-bg)",
        borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
      }}
    >
      <div ref={innerRef} className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <TransitionLink
            to="/"
            className="flex items-center gap-2"
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            <img
              src={logoImg}
              alt="DYSIGNS, digital design agency Almere"
              className="theme-logo"
              style={{ height: 18, width: "auto" }}
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "1rem",
                fontWeight: 800,
                letterSpacing: "-.02em",
                color: "var(--page-fg)",
              }}
            >
              DYSIGNS
            </span>
          </TransitionLink>
          <p style={{ fontSize: ".75rem", color: "rgba(var(--page-fg-rgb), .4)" }}>
            &copy; {new Date().getFullYear()} DYSIGNS. {t("footer.rights")}
          </p>
          {/* SEO entity signal — invisible to visitors, readable by search crawlers */}
          <p
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            DYSIGNS is a full-service digital agency based in Almere, Netherlands. Services include UX/UI design, web design, Shopify development, branding, and social media marketing.
          </p>
          <p
            style={{
              fontSize: ".62rem",
              letterSpacing: ".04em",
              color: "rgba(var(--page-fg-rgb), .55)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            KVK: 83710418 | BTW: NL003861601B85
          </p>
          {/* the privacy link and the language switch on one line */}
          <div className="flex items-center gap-2.5" style={{ fontSize: ".62rem", color: "rgba(var(--page-fg-rgb), .3)" }}>
            <TransitionLink
              to="/privacy"
              style={{
                fontSize: ".62rem",
                letterSpacing: ".04em",
                color: "rgba(var(--page-fg-rgb), .55)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
              onMouseEnter={() => cursor.set("link")}
              onMouseLeave={() => cursor.reset()}
            >
              {t("footer.privacyLink")}
            </TransitionLink>
            <span aria-hidden="true">|</span>
            <a
              href={crawlHref(otherLangHref)}
              hrefLang={lang === "en" ? "nl" : "en"}
              lang={lang === "en" ? "nl" : "en"}
              data-cursor-label={t("cursor.translate")}
              onClick={(e) => {
                e.preventDefault();
                toggleLang();
              }}
              style={{
                fontSize: ".62rem",
                letterSpacing: ".04em",
                color: "rgba(var(--page-fg-rgb), .55)",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              {lang === "en" ? "Nederlands" : "English"}
            </a>
          </div>
        </div>

        {/* Contact icons — Email first, WhatsApp second (matches Header order) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {instagram && (
            <ContactPill
              href={instagram.url}
              label="Instagram"
              ariaLabel="Instagram"
              cursorLabel="Instagram"
              cursorApi={cursor}
              external
              icon={<Instagram size={14} strokeWidth={1.5} />}
            />
          )}
          <ContactPill
            href={`mailto:${c.email}`}
            label="Email"
            ariaLabel="Email"
            cursorLabel={t("cursor.email")}
            cursorApi={cursor}
            icon={<Mail size={14} strokeWidth={1.5} />}
          />
          <ContactPill
            href={`https://wa.me/${c.whatsapp.replace(/\+/g, "")}`}
            label="WhatsApp"
            ariaLabel="WhatsApp"
            cursorLabel={t("cursor.whatsapp")}
            cursorApi={cursor}
            external
            icon={<WhatsAppIcon size={14} />}
          />
        </div>
      </div>
    </footer>
  );
}

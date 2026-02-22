import { useState } from "react";
import { Mail, Instagram } from "lucide-react";
import { siteContent } from "../data/content";
import { TransitionLink } from "./TransitionLink";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";

const logoImg = "/dysigns_white.png";

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

/** Pill-style icon button that expands to show a label on hover */
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
        paddingLeft: 11,
        paddingRight: hovered ? 14 : 11,
        borderColor: hovered ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.1)",
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
            "linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)",
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform .7s ease-out",
        }}
      />
      {/* icon */}
      <span className="relative z-10 flex-shrink-0" style={{ color: hovered ? "#fff" : "rgba(255,255,255,.45)", transition: "color .3s" }}>
        {icon}
      </span>
      {/* expanding label */}
      <span
        className="relative z-10 overflow-hidden whitespace-nowrap"
        style={{
          maxWidth: hovered ? 90 : 0,
          opacity: hovered ? 1 : 0,
          transition: "max-width .35s ease-out, opacity .3s ease-out",
        }}
      >
        <span
          style={{
            fontSize: ".6rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.7)",
            paddingLeft: 8,
          }}
        >
          {label}
        </span>
      </span>
    </a>
  );
}

export function Footer() {
  const c = siteContent.contact;
  const cursor = useCursor();
  const { t } = useLanguage();

  const instagram = siteContent.socials.find(
    (s) => s.name.toLowerCase() === "instagram",
  );

  return (
    <footer
      className="relative py-14 px-6 md:px-12"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
      }}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <TransitionLink
            to="/"
            className="flex items-center gap-2"
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            <img
              src={logoImg}
              alt="DYSIGNS"
              style={{ height: 18, width: "auto" }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <span
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "1rem",
                fontWeight: 800,
                letterSpacing: "-.02em",
                color: "#fff",
              }}
            >
              DYSIGNS
            </span>
          </TransitionLink>
          <p style={{ fontSize: ".75rem", color: "rgba(255,255,255,.4)" }}>
            &copy; {new Date().getFullYear()} DYSIGNS. {t("footer.rights")}
          </p>
        </div>

        {instagram && (
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300 hover:text-white"
            style={{
              fontSize: ".68rem",
              fontWeight: 500,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.4)",
            }}
            onMouseEnter={() => cursor.set("link")}
            onMouseLeave={() => cursor.reset()}
          >
            <Instagram size={14} strokeWidth={1.5} />
            <span>Instagram</span>
          </a>
        )}

        {/* Contact icons — Email first, WhatsApp second (matches Header order) */}
        <div className="flex items-center gap-3">
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

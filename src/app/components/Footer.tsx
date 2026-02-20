import { Mail, Instagram } from "lucide-react";
import { siteContent } from "../data/content";
import { TransitionLink } from "./TransitionLink";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import logoImg from "figma:asset/10e8a99ba0b681f6e788604d78bfdd3b23a66ae0.png";

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

        <div className="flex items-center gap-3">
          <a
            href={`https://wa.me/${c.whatsapp.replace(/\+/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="relative grid place-items-center w-9 h-9 rounded-full border border-white/10 hover:border-white/25 transition-colors overflow-hidden group"
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
            <WhatsAppIcon
              size={14}
              className="relative z-10 text-white/45 group-hover:text-white transition-colors duration-300"
            />
          </a>
          <a
            href={`mailto:${c.email}`}
            aria-label="Email"
            className="relative grid place-items-center w-9 h-9 rounded-full border border-white/10 hover:border-white/25 transition-colors overflow-hidden group"
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
            <Mail
              size={14}
              strokeWidth={1.5}
              className="relative z-10 text-white/45 group-hover:text-white transition-colors duration-300"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

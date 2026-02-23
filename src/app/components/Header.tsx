import { useRef, useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Mail, Menu, X } from "lucide-react";
import gsap from "gsap";
import { useCursor } from "../hooks/useCursor";
import { usePageTransition } from "../hooks/useTransition";
import { siteContent } from "../data/content";
import { useLanguage } from "../hooks/useLanguage";
import logoImg from "../../assets/dysigns_white.png";

/**
 * Header — Floating pill navigation + utility contact circles.
 *
 * Not a traditional navbar. Minimal floating capsule, centered,
 * with magnetic micro-interactions. DYSIGNS wordmark fixed left,
 * "Available for projects" centered, contact quick-actions fixed right.
 */

/* WhatsApp inline SVG icon (lucide doesn't include it) */
function WhatsAppIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
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

/** Format phone for wa.me link — strip + and spaces */
function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

/* ─── MAGNETIC CONTACT PILL — icon that expands to show label on hover ─── */
function HeaderContactPill({
  href,
  label,
  ariaLabel,
  cursorLabel,
  icon,
  external,
  mag,
  unmag,
  cursorApi,
}: {
  href: string;
  label: string;
  ariaLabel: string;
  cursorLabel: string;
  icon: React.ReactNode;
  external?: boolean;
  mag: (e: React.MouseEvent, el: HTMLElement, strength?: number) => void;
  unmag: (el: HTMLElement) => void;
  cursorApi: ReturnType<typeof useCursor>;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="relative flex items-center rounded-full overflow-hidden"
      style={{
        height: 40,
        paddingLeft: 12,
        paddingRight: hovered ? 16 : 12,
        border: hovered
          ? "1px solid rgba(255,255,255,.3)"
          : "1px solid rgba(255,255,255,.1)",
        background: "rgba(255,255,255,.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "border-color .4s, box-shadow .4s, padding-right .35s ease-out",
        boxShadow: hovered ? "0 0 20px rgba(255,255,255,.08)" : "none",
      }}
      onMouseMove={(e) => {
        if (ref.current) mag(e, ref.current, 0.45);
        cursorApi.set("link", cursorLabel);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (ref.current) unmag(ref.current);
        cursorApi.reset();
      }}
    >
      {/* sweep */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)",
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform .7s ease-out",
        }}
      />
      {/* icon */}
      <span
        className="relative z-10 flex-shrink-0"
        style={{
          color: hovered ? "#fff" : "rgba(255,255,255,.5)",
          transition: "color .3s",
        }}
      >
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

/* ─── LANGUAGE TOGGLE BUTTON ─── */
function LangToggle() {
  const { lang, toggleLang, t } = useLanguage();
  const cursor = useCursor();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={btnRef}
      onClick={toggleLang}
      aria-label={lang === "en" ? "Switch to Dutch" : "Schakel naar Engels"}
      className="relative grid place-items-center rounded-full overflow-hidden group"
      style={{
        width: 40,
        height: 40,
        border: "1px solid rgba(255,255,255,.1)",
        background: "rgba(255,255,255,.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "border-color .4s, box-shadow .4s",
      }}
      onMouseMove={(e) => {
        if (btnRef.current) {
          const r = btnRef.current.getBoundingClientRect();
          const dx = (e.clientX - r.left - r.width / 2) * 0.45;
          const dy = (e.clientY - r.top - r.height / 2) * 0.45;
          gsap.to(btnRef.current, { x: dx, y: dy, duration: 0.3, ease: "power3.out" });
        }
        cursor.set("link", t("lang.switchTo"));
      }}
      onMouseLeave={() => {
        if (btnRef.current) {
          gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,.4)" });
          btnRef.current.style.borderColor = "rgba(255,255,255,.1)";
          btnRef.current.style.boxShadow = "none";
        }
        cursor.reset();
      }}
      onMouseEnter={() => {
        if (btnRef.current) {
          btnRef.current.style.borderColor = "rgba(255,255,255,.3)";
          btnRef.current.style.boxShadow = "0 0 20px rgba(255,255,255,.08)";
        }
      }}
    >
      {/* sweep */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent)",
          transition: "transform .7s ease-out",
        }}
      />

      {/* Language code with sliding animation */}
      <span
        className="relative z-10 overflow-hidden"
        style={{
          width: 20,
          height: 14,
        }}
      >
        <span
          className="flex flex-col items-center"
          style={{
            transition: "transform .4s cubic-bezier(.22,1,.36,1)",
            transform: lang === "en" ? "translateY(0)" : "translateY(-50%)",
          }}
        >
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: ".6rem",
              fontWeight: 700,
              letterSpacing: ".06em",
              color: "rgba(255,255,255,.55)",
              lineHeight: "14px",
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color .3s",
            }}
            className="group-hover:text-white"
          >
            EN
          </span>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: ".6rem",
              fontWeight: 700,
              letterSpacing: ".06em",
              color: "rgba(255,255,255,.55)",
              lineHeight: "14px",
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color .3s",
            }}
            className="group-hover:text-white"
          >
            NL
          </span>
        </span>
      </span>
    </button>
  );
}

/* ─── MOBILE LANGUAGE TOGGLE ─── */
function MobileLangToggle() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      onClick={toggleLang}
      className="grid place-items-center w-10 h-10 rounded-full border border-white/10 hover:border-white/25 transition-colors"
      aria-label={lang === "en" ? "Switch to Dutch" : "Schakel naar Engels"}
    >
      <span
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: ".6rem",
          fontWeight: 700,
          letterSpacing: ".06em",
          color: "rgba(255,255,255,.45)",
        }}
      >
        {lang === "en" ? "NL" : "EN"}
      </span>
    </button>
  );
}

export function Header() {
  const cursor = useCursor();
  const { navigateTo } = usePageTransition();
  const { t } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  /* magnetic pull */
  const mag = useCallback(
    (e: React.MouseEvent, el: HTMLElement, strength = 0.35) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * strength;
      const dy = (e.clientY - r.top - r.height / 2) * strength;
      gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: "power3.out" });
    },
    [],
  );
  const unmag = useCallback((el: HTMLElement) => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1,.4)",
    });
  }, []);

  /* close menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* focus trap for mobile menu */
  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const links = [
    { key: "nav.work", path: "/work" },
    { key: "nav.about", path: "/about" },
    { key: "nav.contact", path: "/contact" },
  ];

  const handleNav = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMenuOpen(false);
    navigateTo(path);
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ─── LEFT: DYSIGNS WORDMARK ─── */}
      <a
        href="/"
        onClick={(e) => handleNav(e, "/")}
        className="fixed flex items-center gap-2"
        style={{ top: 24, left: 24, zIndex: 160 }}
        onMouseEnter={() => cursor.set("link", t("cursor.home"))}
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
          className="hidden md:inline"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: ".8rem",
            fontWeight: 800,
            letterSpacing: "-.02em",
            color: "#fff",
          }}
        >
          DYSIGNS
        </span>
      </a>

      {/* ─── CENTER: FLOATING PILL NAV (desktop) ─── */}
      <nav
        className="fixed left-1/2 -translate-x-1/2 hidden md:block"
        style={{ top: 20, zIndex: 160 }}
      >
        <div
          ref={pillRef}
          className="flex items-center gap-0.5 rounded-full"
          style={{
            padding: "5px 6px",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            background: "rgba(255,255,255,.035)",
            border: "1px solid rgba(255,255,255,.08)",
            boxShadow:
              "0 4px 24px rgba(0,0,0,.4), inset 0 0.5px 0 rgba(255,255,255,.06)",
          }}
          onMouseMove={(e) => {
            if (pillRef.current) mag(e, pillRef.current, 0.06);
          }}
          onMouseLeave={() => {
            if (pillRef.current) unmag(pillRef.current);
          }}
        >
          {links.map((l) => (
            <a
              key={l.key}
              href={l.path}
              onClick={(e) => handleNav(e, l.path)}
              className="relative rounded-full group"
              style={{
                padding: "7px 18px",
                fontSize: ".68rem",
                fontWeight: 500,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: isActive(l.path)
                  ? "rgba(255,255,255,.9)"
                  : "rgba(255,255,255,.55)",
                transition: "color .3s",
                background: isActive(l.path)
                  ? "rgba(255,255,255,.06)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(l.path)) {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,.85)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,.04)";
                }
                cursor.set("link", t("cursor.open"));
              }}
              onMouseLeave={(e) => {
                if (!isActive(l.path)) {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(255,255,255,.55)";
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                }
                cursor.reset();
              }}
            >
              {t(l.key)}
              {/* underline sweep */}
              <span
                className="absolute bottom-1 left-3 right-3 h-px origin-left transition-transform duration-500"
                style={{
                  background: "rgba(255,255,255,.25)",
                  transform: isActive(l.path) ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </a>
          ))}
        </div>
      </nav>

      {/* ─── RIGHT: UTILITY PILLS (desktop) — Email + WhatsApp + Lang ─── */}
      <div
        className="fixed hidden md:flex items-center gap-2"
        style={{ top: 20, right: 24, zIndex: 160 }}
      >
        {/* Email */}
        <HeaderContactPill
          href={`mailto:${siteContent.contact.email}`}
          label="Email"
          ariaLabel="Email"
          cursorLabel={t("cursor.email")}
          icon={<Mail size={15} strokeWidth={1.5} />}
          mag={mag}
          unmag={unmag}
          cursorApi={cursor}
        />

        {/* WhatsApp */}
        <HeaderContactPill
          href={waLink(siteContent.contact.whatsapp)}
          label="WhatsApp"
          ariaLabel="WhatsApp"
          cursorLabel={t("cursor.whatsapp")}
          icon={<WhatsAppIcon size={15} />}
          external
          mag={mag}
          unmag={unmag}
          cursorApi={cursor}
        />

        {/* Language Toggle */}
        <LangToggle />
      </div>

      {/* ─── MOBILE: HAMBURGER TOGGLE ─── */}
      <button
        className="md:hidden fixed grid place-items-center rounded-full"
        style={{
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          zIndex: 160,
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(0,0,0,.85)",
        }}
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={16} className="text-white/60" />
      </button>

      {/* ─── MOBILE FULLSCREEN MENU ─── */}
      {menuOpen && (
        <div
          className="fixed inset-0 flex flex-col"
          style={{ zIndex: 200, background: "#000" }}
        >
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                  color: "#fff",
                }}
              >
                DYSIGNS
              </span>
            </div>
            <button
              className="grid place-items-center w-10 h-10 rounded-full border border-white/10"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>

          {/* Available badge in mobile menu */}
          <div className="flex justify-center mt-2 mb-4">
            <div
              className="flex items-center gap-2 rounded-full"
              style={{
                padding: "5px 12px 5px 9px",
                background: "rgba(255,255,255,.04)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <span
                className="relative flex-shrink-0"
                style={{ width: 6, height: 6 }}
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "#4ade80",
                    boxShadow:
                      "0 0 4px rgba(74,222,128,.6), 0 0 10px rgba(74,222,128,.3)",
                    animation: "headerDotPulse 3.2s ease-in-out infinite",
                  }}
                />
              </span>
              <span
                style={{
                  fontSize: ".6rem",
                  fontWeight: 500,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.55)",
                  fontFamily: "'Inter',sans-serif",
                }}
              >
                {t("hero.available")}
              </span>
            </div>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {links.map((l) => (
              <a
                key={l.key}
                href={l.path}
                onClick={(e) => handleNav(e, l.path)}
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: isActive(l.path) ? "#fff" : "rgba(255,255,255,.5)",
                  transition: "color .3s",
                }}
              >
                {t(l.key)}
              </a>
            ))}
          </nav>
          <div className="flex justify-center gap-4 pb-10">
            <a
              href={`mailto:${siteContent.contact.email}`}
              aria-label="Email"
              className="grid place-items-center w-10 h-10 rounded-full border border-white/10 hover:border-white/25 transition-colors"
            >
              <Mail size={15} strokeWidth={1.5} className="text-white/45" />
            </a>
            <a
              href={waLink(siteContent.contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid place-items-center w-10 h-10 rounded-full border border-white/10 hover:border-white/25 transition-colors"
            >
              <WhatsAppIcon size={15} className="text-white/45" />
            </a>
            <MobileLangToggle />
          </div>
        </div>
      )}

      {/* Keyframe for header availability dot */}
      <style>{`
        @keyframes headerDotPulse {
          0%, 100% {
            box-shadow: 0 0 4px rgba(74,222,128,.6), 0 0 10px rgba(74,222,128,.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 8px rgba(74,222,128,.8), 0 0 16px rgba(74,222,128,.4);
            transform: scale(1.15);
          }
        }
      `}</style>
    </>
  );
}
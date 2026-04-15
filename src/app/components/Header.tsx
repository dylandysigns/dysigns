import { useRef, useCallback, useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Mail, Menu, X } from "lucide-react";
import gsap from "gsap";
import { useCursor } from "../hooks/useCursor";
import { usePageTransition } from "../hooks/useTransition";
import { siteContent } from "../data/content";
import { useLanguage } from "../hooks/useLanguage";
import logoImg from "../../assets/dysigns_white.png";

/* ─── SCROLL-AWARE HIDE/SHOW HOOK ─── */
function useHeaderVisibility() {
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScroll.current;
        // Show when: scrolling up, near top (<80px), or menu is open
        if (delta < -5 || y < 80) {
          setVisible(true);
        } else if (delta > 8 && y > 120) {
          setVisible(false);
        }
        lastScroll.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

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
          ? "var(--header-pill-border-hover, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .3))"
          : "var(--header-pill-border, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .1))",
        background:
          "var(--header-pill-bg, rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .03))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: "border-color .4s, box-shadow .4s, padding-right .35s ease-out",
        boxShadow: hovered
          ? "var(--header-pill-shadow-hover, 0 0 20px rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .08))"
          : "none",
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
            "linear-gradient(90deg,transparent,rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .12),transparent)",
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform .7s ease-out",
        }}
      />
      {/* icon */}
      <span
        className="relative z-10 flex-shrink-0"
        style={{
          color: hovered
            ? "var(--header-fg, var(--page-fg))"
            : "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .5)",
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
            color: "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .7)",
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
      type="button"
      onClick={toggleLang}
      aria-label={lang === "en" ? "Switch to Dutch" : "Schakel naar Engels"}
      className="relative grid place-items-center rounded-full overflow-hidden group"
      style={{
        width: 40,
        height: 40,
        border:
          "var(--header-pill-border, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .1))",
        background:
          "var(--header-pill-bg, rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .03))",
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
          btnRef.current.style.border =
            "var(--header-pill-border, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .1))";
          btnRef.current.style.boxShadow = "none";
        }
        cursor.reset();
      }}
      onMouseEnter={() => {
        if (btnRef.current) {
          btnRef.current.style.border =
            "var(--header-pill-border-hover, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .3))";
          btnRef.current.style.boxShadow =
            "var(--header-pill-shadow-hover, 0 0 20px rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .08))";
        }
      }}
    >
      {/* sweep */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full"
        style={{
          background:
            "linear-gradient(90deg,transparent,rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .12),transparent)",
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
              color: "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .55)",
              lineHeight: "14px",
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color .3s",
            }}
          >
            EN
          </span>
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: ".6rem",
              fontWeight: 700,
              letterSpacing: ".06em",
              color: "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .55)",
              lineHeight: "14px",
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color .3s",
            }}
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
      type="button"
      onClick={toggleLang}
      className="grid place-items-center w-10 h-10 rounded-full transition-colors"
      aria-label={lang === "en" ? "Switch to Dutch" : "Schakel naar Engels"}
      style={{
        border: "1px solid rgba(var(--page-fg-rgb), .1)",
        background: "rgba(var(--page-fg-rgb), .03)",
      }}
    >
      <span
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: ".6rem",
          fontWeight: 700,
          letterSpacing: ".06em",
          color: "rgba(var(--page-fg-rgb), .45)",
        }}
      >
        {lang === "en" ? "NL" : "EN"}
      </span>
    </button>
  );
}

/* ─── ANIMATED MOBILE MENU ─── */
function MobileMenu({
  open,
  onClose,
  links,
  isActive,
  handleNav,
  t,
}: {
  open: boolean;
  onClose: () => void;
  links: { key: string; path: string }[];
  isActive: (path: string) => boolean;
  handleNav: (e: React.MouseEvent, path: string) => void;
  t: (key: string) => string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const navLinksRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    if (!menu) return;

    const tl = gsap.timeline();

    // Slide menu in from right
    tl.fromTo(
      menu,
      { clipPath: "inset(0 0 0 100%)" },
      { clipPath: "inset(0 0 0 0%)", duration: 0.4, ease: "power3.inOut" },
    );

    // Stagger header row, badge, links, footer
    if (headerRowRef.current) {
      tl.fromTo(
        headerRowRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: "power3.out" },
        0.2,
      );
    }
    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.4)" },
        0.3,
      );
    }
    if (navLinksRef.current) {
      const navItems = navLinksRef.current.children;
      tl.fromTo(
        navItems,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.32,
      );
    }
    if (footerRef.current) {
      const footerItems = footerRef.current.children;
      tl.fromTo(
        footerItems,
        { y: 16, opacity: 0, scale: 0.85 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.35,
          stagger: 0.06,
          ease: "back.out(1.4)",
        },
        0.5,
      );
    }

    return () => { tl.kill(); };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className="fixed inset-0 flex flex-col"
      style={{ zIndex: 200, background: "var(--page-bg)", clipPath: "inset(0 0 0 100%)" }}
    >
      <div ref={headerRowRef} className="px-6 py-5 flex items-center justify-between" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="DYSIGNS"
            className="theme-logo"
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
              color: "var(--page-fg)",
            }}
          >
            DYSIGNS
          </span>
        </div>
        <button
          type="button"
          className="grid place-items-center w-10 h-10 rounded-full"
          onClick={onClose}
          aria-label="Close menu"
          style={{
            border: "1px solid rgba(var(--page-fg-rgb), .1)",
            background: "rgba(var(--page-fg-rgb), .03)",
          }}
        >
          <X
            size={18}
            style={{ color: "rgba(var(--page-fg-rgb), .6)" }}
          />
        </button>
      </div>

      {/* Available badge in mobile menu */}
      <div ref={badgeRef} className="flex justify-center mt-2 mb-4" style={{ opacity: 0 }}>
        <div
          className="flex items-center gap-2 rounded-full"
          style={{
            padding: "5px 12px 5px 9px",
            background: "rgba(var(--page-fg-rgb), .04)",
            border: "1px solid rgba(var(--page-fg-rgb), .07)",
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
              color: "rgba(var(--page-fg-rgb), .55)",
              fontFamily: "'Inter',sans-serif",
            }}
          >
            {t("hero.available")}
          </span>
        </div>
      </div>

      <nav ref={navLinksRef} className="flex-1 flex flex-col items-center justify-center gap-8">
        {links.map((l) => (
          <a
            key={l.key}
            href={l.path}
            onClick={(e) => handleNav(e, l.path)}
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: isActive(l.path) ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .5)",
              transition: "color .3s",
            }}
          >
            {t(l.key)}
          </a>
        ))}
      </nav>
      <div ref={footerRef} className="flex justify-center gap-4 pb-10">
        <a
          href={`mailto:${siteContent.contact.email}`}
          aria-label="Email"
          className="grid place-items-center w-10 h-10 rounded-full transition-colors"
          style={{
            border: "1px solid rgba(var(--page-fg-rgb), .1)",
            background: "rgba(var(--page-fg-rgb), .03)",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          <Mail size={15} strokeWidth={1.5} />
        </a>
        <a
          href={waLink(siteContent.contact.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="grid place-items-center w-10 h-10 rounded-full transition-colors"
          style={{
            border: "1px solid rgba(var(--page-fg-rgb), .1)",
            background: "rgba(var(--page-fg-rgb), .03)",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          <WhatsAppIcon size={15} />
        </a>
        <MobileLangToggle />
      </div>
    </div>
  );
}

export function Header() {
  const cursor = useCursor();
  const { navigateTo } = usePageTransition();
  const { t } = useLanguage();
  const location = useLocation();
  const isCasePage = /^\/work\/[^/]+$/.test(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [caseNavIntroDone, setCaseNavIntroDone] = useState(!isCasePage);
  const pillRef = useRef<HTMLDivElement>(null);
  const headerVisible = useHeaderVisibility();
  const caseHeaderZIndex = isCasePage ? 100000 : 160;

  /* Refs for animated header groups */
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const utilRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const targets = [
      logoRef.current,
      navRef.current,
      utilRef.current,
      burgerRef.current,
    ].filter(Boolean);

    if (!targets.length) return;

    if (!isCasePage) {
      setCaseNavIntroDone(true);
      gsap.set(targets, { opacity: 1 });
      return;
    }

    setCaseNavIntroDone(false);
    gsap.set(targets, { opacity: 0 });

    const tl = gsap.timeline({
      delay: 0.3,
      onComplete: () => setCaseNavIntroDone(true),
    });

    tl.to(targets, {
      opacity: 1,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.03,
      overwrite: true,
    });

    return () => {
      tl.kill();
    };
  }, [isCasePage, location.pathname]);

  /* Animate header elements on visibility change */
  useEffect(() => {
    if (menuOpen) return; // Don't hide while menu is open
    if (isCasePage && !caseNavIntroDone) return;
    const targets = [logoRef.current, navRef.current, utilRef.current, burgerRef.current].filter(Boolean);
    gsap.to(targets, {
      y: headerVisible ? 0 : -80,
      opacity: headerVisible ? 1 : 0,
      duration: 0.35,
      ease: headerVisible ? "power3.out" : "power2.in",
      stagger: headerVisible ? 0.03 : 0,
      overwrite: true,
    });
  }, [caseNavIntroDone, headerVisible, isCasePage, menuOpen]);

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
        ref={logoRef}
        href="/"
        onClick={(e) => handleNav(e, "/")}
        className="fixed flex items-center gap-2"
        style={{ top: 24, left: 24, zIndex: caseHeaderZIndex, willChange: "transform, opacity" }}
        onMouseEnter={() => cursor.set("link", t("cursor.home"))}
        onMouseLeave={() => cursor.reset()}
      >
        <img
          src={logoImg}
          alt="DYSIGNS"
          className="theme-logo"
          style={{
            height: 18,
            width: "auto",
            filter: "var(--header-logo-filter, none)",
          }}
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
            color: "var(--header-fg, var(--page-fg))",
          }}
        >
          DYSIGNS
        </span>
      </a>

      {/* ─── CENTER: FLOATING PILL NAV (desktop) ─── */}
      <nav
        ref={navRef}
        className="fixed left-1/2 -translate-x-1/2 hidden md:block"
        style={{ top: 20, zIndex: caseHeaderZIndex, willChange: "transform, opacity" }}
      >
        <div
          ref={pillRef}
          className="flex items-center gap-0.5 rounded-full"
          style={{
            padding: "5px 6px",
            backdropFilter: "blur(20px) saturate(1.2)",
            WebkitBackdropFilter: "blur(20px) saturate(1.2)",
            background:
              "var(--header-nav-bg, rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .035))",
            border:
              "var(--header-nav-border, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .08))",
            boxShadow:
              "var(--header-nav-shadow, 0 4px 24px rgba(var(--page-shadow-rgb), .14), inset 0 0.5px 0 rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .06))",
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
                  ? "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .9)"
                  : "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .55)",
                transition: "color .3s",
                background: isActive(l.path)
                  ? "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .06)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(l.path)) {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .85)";
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .04)";
                }
                cursor.set("link", t("cursor.open"));
              }}
              onMouseLeave={(e) => {
                if (!isActive(l.path)) {
                  (e.currentTarget as HTMLElement).style.color =
                    "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .55)";
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
                  background: "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .25)",
                  transform: isActive(l.path) ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </a>
          ))}
        </div>
      </nav>

      {/* ─── RIGHT: UTILITY PILLS (desktop) — Email + WhatsApp + Lang ─── */}
      <div
        ref={utilRef}
        className="fixed hidden md:flex items-center gap-2"
        style={{ top: 20, right: 24, zIndex: caseHeaderZIndex, willChange: "transform, opacity" }}
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
        ref={burgerRef}
        className="md:hidden fixed grid place-items-center rounded-full"
        style={{
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          zIndex: caseHeaderZIndex,
          border:
            "var(--header-pill-border, 1px solid rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .1))",
          background: "var(--header-mobile-bg, rgba(var(--page-bg-rgb), .85))",
          willChange: "transform, opacity",
        }}
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu
          size={16}
          style={{ color: "rgba(var(--header-fg-rgb, var(--page-fg-rgb)), .6)" }}
        />
      </button>

      {/* ─── MOBILE FULLSCREEN MENU ─── */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        isActive={isActive}
        handleNav={handleNav}
        t={t}
      />

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

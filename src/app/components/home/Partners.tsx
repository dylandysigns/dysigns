import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useLanguage } from "../../hooks/useLanguage";
import { useCursor } from "../../hooks/useCursor";

/**
 * Partners / "Trusted by" — continuous logo slider.
 *
 * INFINITE LOOP: the track contains 3× copies of the logos. GSAP tweens
 * raw pixel `x` from 0 → -oneSetWidth, repeat: -1. Because logos are
 * tripled, the snap from -oneSetWidth back to 0 is visually identical —
 * seamless, no jump. No xPercent anywhere — everything is in raw pixels
 * to avoid the offsetWidth vs scrollWidth mismatch that caused jumps.
 *
 * Every logo is a plain <img alt="{brand name}">, always in the HTML
 * regardless of scroll/animation state — these are entity signals, not
 * decoration. Only the 2nd and 3rd (duplicate) copies get
 * aria-hidden="true" so screen readers don't announce each name three
 * times; the first copy stays fully accessible.
 */

interface Logo {
  name: string;
  url: string;
  src: string;
}

const LOGOS: Logo[] = [
  { name: "STËLZ", url: "https://drinkstelz.com/", src: "/logos/STELZ1.svg" },
  { name: "BIYU", url: "https://www.biyu.world/", src: "/logos/BIYU.svg" },
  { name: "KULT AND ACE", url: "http://kultandace.com/", src: "/logos/KultAndAce.svg" },
  { name: "FIJNE GASTEN", url: "http://www.fijnegasten.nl/", src: "/logos/Fijne-gasten.svg" },
  { name: "JD", url: "https://www.jdsports.nl/", src: "/logos/JD.svg" },
  { name: "PACT", url: "https://pact-worldwide.com/en/corporates/", src: "/logos/PACT.svg" },
  { name: "A/CAFE", url: "https://acafegroup.com/", src: "/logos/ACAFE.svg" },
  { name: "XPRNZ", url: "https://xprnz.nl/", src: "/logos/XPRNZ.svg" },
  { name: "PUREANDCURE", url: "https://pureandcure.com/", src: "/logos/pureandcure.svg" },
];

interface PartnersProps {
  variant?: "section" | "hero";
}

export function Partners({ variant = "section" }: PartnersProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const cursor = useCursor();
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isHero = variant === "hero";

  /* ── Auto-scroll — pure pixel x, no xPercent ── */
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    let cancelled = false;

    // Defer briefly so layout is fully settled and scrollWidth is accurate.
    // setTimeout rather than requestAnimationFrame deliberately — rAF is
    // paused entirely in a backgrounded tab, which would leave the slider
    // stuck uninitialised if the page was opened in the background.
    const timeout = window.setTimeout(() => {
      if (cancelled || !track) return;

      const oneSet = track.scrollWidth / 3;
      if (oneSet <= 0) return;

      // Ensure clean starting position
      gsap.set(track, { x: 0 });

      tweenRef.current = gsap.to(track, {
        x: -oneSet,
        duration: 34,
        repeat: -1,
        ease: "none",
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      gsap.set(track, { clearProps: "transform" });
    };
  }, [reduced]);

  /* Pause on hover and on keyboard focus (whichever is active) — resume
     only once neither is true. React's onFocus/onBlur bubble (unlike
     native DOM focus/blur), so putting them on the track container
     catches focus entering/leaving any logo link inside it. */
  useEffect(() => {
    const tween = tweenRef.current;
    if (!tween) return;
    if (hovered || focused) {
      tween.pause();
    } else {
      tween.resume();
    }
  }, [hovered, focused]);

  /* 3× copies for a seamless infinite loop, same for both variants —
     only copies 2 and 3 are aria-hidden so names aren't announced 3x. */
  const items = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section
      className={
        isHero
          ? "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-1 md:py-4"
          : "relative overflow-hidden py-16 md:py-20"
      }
      style={
        isHero
          ? { background: "transparent" }
          : {
              background: "var(--page-bg)",
              borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
              borderBottom: "1px solid rgba(var(--page-fg-rgb), .04)",
            }
      }
    >
      <div className={isHero ? "mb-2 px-6 text-center md:mb-5" : "mb-10 text-center"}>
        <span
          style={{
            fontSize: isHero ? ".66rem" : ".8rem",
            fontWeight: 600,
            letterSpacing: isHero ? ".24em" : ".18em",
            textTransform: "uppercase",
            color: isHero
              ? "rgba(var(--page-fg-rgb), 1)"
              : "rgba(var(--page-fg-rgb), .55)",
          }}
        >
          {t("partners.label")}
        </span>
      </div>
      <div className="relative">
        <div
          className={`absolute left-0 top-0 bottom-0 pointer-events-none ${isHero ? "w-24" : "w-32"}`}
          style={{
            zIndex: 2,
            background: isHero
              ? "linear-gradient(to right, rgba(0,0,0,.55), rgba(0,0,0,0))"
              : "linear-gradient(to right,var(--page-bg),transparent)",
          }}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 pointer-events-none ${isHero ? "w-24" : "w-32"}`}
          style={{
            zIndex: 2,
            background: isHero
              ? "linear-gradient(to left, rgba(0,0,0,.55), rgba(0,0,0,0))"
              : "linear-gradient(to left,var(--page-bg),transparent)",
          }}
        />
        <div>
          <div
            ref={trackRef}
            className={`flex items-center whitespace-nowrap select-none touch-pan-y ${isHero ? "py-1" : ""}`}
            style={{ willChange: "transform" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
          {items.map((logo, i) => (
            <a
              key={`${logo.name}-${i}`}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              aria-hidden={i >= LOGOS.length ? "true" : undefined}
              tabIndex={i >= LOGOS.length ? -1 : undefined}
              className="flex-shrink-0 transition-colors duration-350 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded"
              style={{
                color: isHero
                  ? "rgba(var(--page-fg-rgb), .94)"
                  : "rgba(var(--page-fg-rgb), .35)",
                height: isHero ? 64 : 52,
                paddingLeft: isHero ? 30 : 0,
                paddingRight: isHero ? 30 : 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 1,
                transition: isHero
                  ? "opacity .32s ease, transform .32s ease"
                  : "color .32s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  isHero
                    ? "rgba(var(--page-fg-rgb), 1)"
                    : "rgba(var(--page-fg-rgb), .75)";
                (e.currentTarget as HTMLElement).style.transform = isHero
                  ? "translateY(-1px)"
                  : "none";
                cursor.set("link", logo.name.toUpperCase());
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  isHero
                    ? "rgba(var(--page-fg-rgb), .94)"
                    : "rgba(var(--page-fg-rgb), .35)";
                (e.currentTarget as HTMLElement).style.transform = "none";
                cursor.reset();
              }}
            >
              <img
                src={logo.src}
                alt={logo.name}
                style={{
                  // Fixed box, not height-only — some logo files are
                  // square (1200x1200) and some are wide wordmarks
                  // (e.g. pureandcure.svg is ~5.7:1), so matching only
                  // height let the wide one render nearly 6x wider than
                  // the square ones. object-fit: contain keeps every
                  // logo the same optical footprint regardless of its
                  // native aspect ratio.
                  width: isHero ? 84 : 68,
                  height: isHero ? 48 : 40,
                  objectFit: "contain",
                  objectPosition: "center",
                  display: "block",
                }}
                draggable={false}
                loading="lazy"
              />
            </a>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}

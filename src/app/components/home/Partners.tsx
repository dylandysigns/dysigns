import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLanguage } from "../../hooks/useLanguage";
import { useCursor } from "../../hooks/useCursor";

/**
 * Partners / "Trusted by" — Monochrome SVG placeholder logos.
 *
 * INFINITE LOOP: The track contains 3× copies of the logos.
 * GSAP tweens raw pixel `x` from 0 → -oneSetWidth, repeat: -1.
 * Because logos are tripled, the snap from -oneSetWidth back to 0
 * is visually identical — seamless.
 *
 * No xPercent is used anywhere — everything is in raw pixels to
 * avoid the offsetWidth vs scrollWidth mismatch that caused jumps.
 */

/* ─── Individual logo components ─── */
const LOGO_H = 60;
const FILL = "currentColor";

const MARK_W = 32;  // width of the logo mark portion, used to position text
const TEXT_X = 0;

function StelzLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="STËLZ">
      <image href="/logos/STELZ1.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="700" letterSpacing="0.2" fill={FILL}>

      </text>
    </svg>
  );
}

function BiyuLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="BIYU">
      <image href="/logos/BIYU.svg" x="0" y="-1" width={MARK_W} height="30" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="700" letterSpacing="0.1" fill={FILL}>

      </text>
    </svg>
  );
}

function KultAndAceLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="KULT AND ACE">
      <image href="/logos/KultAndAce.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.1" fill={FILL}>
     </text>
    </svg>
  );
}

function FijneGastenLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="FIJNE GASTEN">
      <image href="/logos/Fijne-gasten.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.1" fill={FILL}>

      </text>
    </svg>
  );
}

function JdLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="JD">
      <image href="/logos/JD.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="700" letterSpacing="0.2" fill={FILL}>
      </text>
    </svg>
  );
}

function PactLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="PACT">
      <image href="/logos/PACT.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="700" letterSpacing="0.2" fill={FILL}>

      </text>
    </svg>
  );
}

function ACafeLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="A/CAFE">
      <image href="/logos/ACAFE.svg" x="0" y="-1" width={MARK_W} height="30" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="0.15" fill={FILL}>

      </text>
    </svg>
  );
}

function XprnzLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="XPRNZ">
      <image href="/logos/XPRNZ.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="14" fontWeight="700" letterSpacing="0.1" fill={FILL}>

      </text>
    </svg>
  );
}

function PureAndCureLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 50 24" fill="none" role="img" aria-label="PUREANDCURE">
      <image href="/logos/pureandcure.svg" x="0" y="-1" width={MARK_W} height="26" preserveAspectRatio="xMidYMid meet" />
      <text x={TEXT_X} y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="12" fontWeight="700" letterSpacing="0.1" fill={FILL}>
      </text>
    </svg>
  );
}

const LOGOS: { name: string; url: string; Component: React.FC }[] = [
  { name: "STËLZ", url: "https://drinkstelz.com/", Component: StelzLogo },
  { name: "BIYU", url: "https://bi-yu.nl/", Component: BiyuLogo },
  { name: "KULT AND ACE", url: "http://kultandace.com/", Component: KultAndAceLogo },
  { name: "FIJNE GASTEN", url: "http://www.fijnegasten.nl/", Component: FijneGastenLogo },
  { name: "JD", url: "https://www.jdsports.nl/", Component: JdLogo },
  { name: "PACT", url: "https://www.pactamsterdam.nl/", Component: PactLogo },
  { name: "A/CAFE", url: "https://acafe.amsterdam/", Component: ACafeLogo },
  { name: "XPRNZ", url: "https://xprnz.nl/", Component: XprnzLogo },
  { name: "PUREANDCURE", url: "https://pureandcure.com/", Component: PureAndCureLogo },
];

interface PartnersProps {
  variant?: "section" | "hero";
}

export function Partners({ variant = "section" }: PartnersProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const cursor = useCursor();
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Auto-scroll — pure pixel x, no xPercent ── */
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    let cancelled = false;

    // Defer one frame so layout is fully settled and scrollWidth is accurate
    const raf = requestAnimationFrame(() => {
      if (cancelled || !track) return;

      const oneSet = track.scrollWidth / 3;
      if (oneSet <= 0) return;

      // Ensure clean starting position
      gsap.set(track, { x: 0 });

      tweenRef.current = gsap.to(track, {
        x: -oneSet,
        duration: 32,
        repeat: -1,
        ease: "none",
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
      gsap.set(track, { clearProps: "transform" });
    };
  }, [reduced]);

  /* 3× copies for seamless infinite loop */
  const items = [...LOGOS, ...LOGOS, ...LOGOS];
  const isHero = variant === "hero";

  return (
    <section
      className={
        isHero
          ? "relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-3 md:py-4"
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
      <div className={isHero ? "mb-4 px-6 text-center md:mb-5" : "mb-10 text-center"}>
        <span
          style={{
            fontSize: isHero ? ".66rem" : ".8rem",
            fontWeight: 600,
            letterSpacing: isHero ? ".24em" : ".18em",
            textTransform: "uppercase",
            color: isHero
              ? "rgba(var(--page-fg-rgb), 1)"
              : "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          {t("partners.label")}
        </span>
      </div>
      <div className="relative">
        <div
          className={`absolute left-0 top-0 bottom-0 pointer-events-none ${isHero ? "w-14 md:w-24" : "w-32"}`}
          style={{
            zIndex: 2,
            background: isHero
              ? "linear-gradient(to right, rgba(0,0,0,.55), rgba(0,0,0,0))"
              : "linear-gradient(to right,var(--page-bg),transparent)",
          }}
        />
        <div
          className={`absolute right-0 top-0 bottom-0 pointer-events-none ${isHero ? "w-14 md:w-24" : "w-32"}`}
          style={{
            zIndex: 2,
            background: isHero
              ? "linear-gradient(to left, rgba(0,0,0,.55), rgba(0,0,0,0))"
              : "linear-gradient(to left,var(--page-bg),transparent)",
          }}
        />
        <div
          ref={trackRef}
          className={`flex items-center whitespace-nowrap select-none touch-pan-y ${isHero ? "py-1" : ""}`}
          style={{ willChange: "transform" }}
        >
          {items.map((logo, i) => (
            <a
              key={`${logo.name}-${i}`}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              className="flex-shrink-0 transition-colors duration-350"
              style={{
                color: isHero
                  ? "rgba(var(--page-fg-rgb), .94)"
                  : "rgba(var(--page-fg-rgb), .35)",
                height: isHero ? 76 : LOGO_H,
                paddingLeft: isHero ? 30 : 0,
                paddingRight: isHero ? 30 : 0,
                opacity: 1,
                filter: "none",
                transition: isHero
                  ? "opacity .32s ease, transform .32s ease"
                  : "color .32s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  isHero
                    ? "rgba(var(--page-fg-rgb), 1)"
                    : "rgba(var(--page-fg-rgb), .75)";
                (e.currentTarget as HTMLElement).style.opacity = "1";
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
                (e.currentTarget as HTMLElement).style.opacity = "1";
                (e.currentTarget as HTMLElement).style.transform = "none";
                cursor.reset();
              }}
            >
              <logo.Component />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

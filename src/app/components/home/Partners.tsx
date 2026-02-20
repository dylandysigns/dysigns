import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLanguage } from "../../hooks/useLanguage";

/**
 * Partners / "Trusted by" — Monochrome SVG placeholder logos.
 *
 * Each logo is an inline SVG with a geometric mark + wordmark.
 * Replace with real client SVGs in /src/app/assets/logos/ when provided.
 *
 * Folder path for real logos: /src/app/assets/logos/
 * Expected format: SVG preferred, PNG fallback at 2× for retina.
 * Name convention: stripe.svg, notion.svg, etc.
 *
 * INFINITE LOOP: The track contains 3× copies of the logos.
 * GSAP tweens xPercent from 0 → -33.333% (one full set), then
 * repeats seamlessly with no jump.
 */

const LOGO_H = 26;
const FILL = "currentColor";

/* ─── Individual logo components ─── */
function StripeLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 76 24" fill="none" role="img" aria-label="Stripe">
      <rect x="1" y="5" width="12" height="2" rx="1" fill={FILL} />
      <rect x="1" y="11" width="12" height="2" rx="1" fill={FILL} />
      <rect x="1" y="17" width="12" height="2" rx="1" fill={FILL} />
      <text x="19" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Stripe</text>
    </svg>
  );
}

function NotionLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 84 24" fill="none" role="img" aria-label="Notion">
      <rect x="1" y="3" width="14" height="18" rx="2.5" stroke={FILL} strokeWidth="1.6" fill="none" />
      <line x1="5" y1="8" x2="12" y2="16" stroke={FILL} strokeWidth="1.6" strokeLinecap="round" />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Notion</text>
    </svg>
  );
}

function LinearLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 80 24" fill="none" role="img" aria-label="Linear">
      <circle cx="8" cy="12" r="6.5" stroke={FILL} strokeWidth="1.6" fill="none" />
      <line x1="4" y1="12" x2="12" y2="12" stroke={FILL} strokeWidth="1.4" strokeLinecap="round" />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Linear</text>
    </svg>
  );
}

function VercelLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 82 24" fill="none" role="img" aria-label="Vercel">
      <path d="M8 4L15 20H1L8 4Z" fill={FILL} />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Vercel</text>
    </svg>
  );
}

function FigmaLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 78 24" fill="none" role="img" aria-label="Figma">
      <circle cx="6" cy="7" r="3.5" stroke={FILL} strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="7" r="3.5" stroke={FILL} strokeWidth="1.4" fill="none" />
      <circle cx="6" cy="15" r="3.5" stroke={FILL} strokeWidth="1.4" fill="none" />
      <circle cx="12" cy="15" r="3.5" fill={FILL} opacity=".5" />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Figma</text>
    </svg>
  );
}

function WebflowLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 98 24" fill="none" role="img" aria-label="Webflow">
      <path d="M2 7L6 18L10 9L14 18L18 7" stroke={FILL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <text x="24" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Webflow</text>
    </svg>
  );
}

function FramerLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 88 24" fill="none" role="img" aria-label="Framer">
      <path d="M3 3H15V11H3V3Z" fill={FILL} />
      <path d="M3 11H9L15 19H3V11Z" fill={FILL} opacity=".6" />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Framer</text>
    </svg>
  );
}

function ArcLogo() {
  return (
    <svg height={LOGO_H} viewBox="0 0 56 24" fill="none" role="img" aria-label="Arc">
      <path d="M2 19Q8 3 14 19" stroke={FILL} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <text x="20" y="18" fontFamily="Inter,system-ui,sans-serif" fontSize="13" fontWeight="700" letterSpacing="-0.3" fill={FILL}>Arc</text>
    </svg>
  );
}

const LOGOS: { name: string; Component: React.FC }[] = [
  { name: "Stripe", Component: StripeLogo },
  { name: "Notion", Component: NotionLogo },
  { name: "Linear", Component: LinearLogo },
  { name: "Vercel", Component: VercelLogo },
  { name: "Figma", Component: FigmaLogo },
  { name: "Webflow", Component: WebflowLogo },
  { name: "Framer", Component: FramerLogo },
  { name: "Arc", Component: ArcLogo },
];

export function Partners() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      /* Tween exactly one set width (33.333%) so the loop is seamless */
      gsap.to(track, {
        xPercent: -33.333,
        duration: 28,
        repeat: -1,
        ease: "none",
      });
    });
    return () => ctx.revert();
  }, []);

  /* 3× copies for seamless infinite loop */
  const items = [...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
        borderBottom: "1px solid rgba(255,255,255,.04)",
      }}
    >
      <div className="mb-10 text-center">
        <span
          style={{
            fontSize: ".8rem",
            fontWeight: 600,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {t("partners.label")}
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
          style={{
            zIndex: 2,
            background: "linear-gradient(to right,#000,transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
          style={{
            zIndex: 2,
            background: "linear-gradient(to left,#000,transparent)",
          }}
        />
        <div
          ref={trackRef}
          className="flex items-center whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          {items.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex-shrink-0"
              style={{
                color: "rgba(255,255,255,.35)",
                transition: "color .35s ease",
                height: LOGO_H,
                paddingLeft: 40,
                paddingRight: 40,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.65)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.35)";
              }}
            >
              <logo.Component />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

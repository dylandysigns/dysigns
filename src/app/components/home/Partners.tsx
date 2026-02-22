import { useEffect, useRef, useCallback } from "react";
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
 * DRAG: pointer-based drag with momentum. On release the current
 * pixel position is wrapped into the valid range and the auto-scroll
 * tween resumes from that exact spot.
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
  { name: "STËLZ", url: "#", Component: StelzLogo },
  { name: "BIYU", url: "#", Component: BiyuLogo },
  { name: "KULT AND ACE", url: "#", Component: KultAndAceLogo },
  { name: "FIJNE GASTEN", url: "#", Component: FijneGastenLogo },
  { name: "JD", url: "#", Component: JdLogo },
  { name: "PACT", url: "#", Component: PactLogo },
  { name: "A/CAFE", url: "#", Component: ACafeLogo },
  { name: "XPRNZ", url: "#", Component: XprnzLogo },
  { name: "PUREANDCURE", url: "#", Component: PureAndCureLogo },
];

export function Partners() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const cursor = useCursor();
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const oneSetWidthRef = useRef(0);

  /* ── Drag state ── */
  const isDragging = useRef(false);
  const dragStartPointerX = useRef(0);
  const dragStartTrackX = useRef(0);
  const lastPointerX = useRef(0);
  const lastPointerTime = useRef(0);
  const velocityX = useRef(0);
  const didDrag = useRef(false);
  const momentumTween = useRef<gsap.core.Tween | null>(null);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Wrap a pixel x value into the seamless loop range [-oneSet, 0).
   * Because the track is 3× duplicated, any value in this range
   * produces a valid visual.
   */
  const wrapX = useCallback((val: number): number => {
    const oneSet = oneSetWidthRef.current;
    if (oneSet <= 0) return val;
    let w = val % oneSet;
    if (w > 0) w -= oneSet;  // always negative or zero
    return w;
  }, []);

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
      oneSetWidthRef.current = oneSet;

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

  /**
   * Resume auto-scroll from the track's current pixel position.
   * Wraps x into range, syncs tween progress, resumes.
   */
  const resumeAutoScroll = useCallback(() => {
    if (reduced) return;
    const track = trackRef.current;
    const tween = tweenRef.current;
    if (!track || !tween) return;

    const oneSet = oneSetWidthRef.current;
    if (oneSet <= 0) return;

    // Read current position and wrap into loop range
    const rawX = gsap.getProperty(track, "x") as number;
    const wrapped = wrapX(rawX);

    // Snap to wrapped position
    gsap.set(track, { x: wrapped });

    // Progress = how far through the 0 → -oneSet journey
    // wrapped is in [-oneSet, 0], so progress = abs(wrapped) / oneSet
    const progress = Math.min(Math.abs(wrapped) / oneSet, 0.9999);

    tween.progress(progress);
    tween.resume();
  }, [reduced, wrapX]);

  /* ── Drag handlers ── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const track = trackRef.current;
      if (!track) return;

      isDragging.current = true;
      didDrag.current = false;

      // Kill momentum tween if still gliding
      if (momentumTween.current) {
        momentumTween.current.kill();
        momentumTween.current = null;
      }

      // Pause auto-scroll
      if (tweenRef.current) tweenRef.current.pause();

      // Snapshot current position
      const currentX = gsap.getProperty(track, "x") as number;
      dragStartTrackX.current = currentX;
      dragStartPointerX.current = e.clientX;
      lastPointerX.current = e.clientX;
      lastPointerTime.current = Date.now();
      velocityX.current = 0;

      track.setPointerCapture(e.pointerId);
      track.style.cursor = "grabbing";
    },
    [],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const track = trackRef.current;
    if (!track) return;

    const dx = e.clientX - dragStartPointerX.current;
    if (Math.abs(dx) > 3) didDrag.current = true;

    // Velocity tracking
    const now = Date.now();
    const dt = now - lastPointerTime.current;
    if (dt > 0) {
      velocityX.current = (e.clientX - lastPointerX.current) / dt;
    }
    lastPointerX.current = e.clientX;
    lastPointerTime.current = now;

    // Move track — raw pixel offset from drag start
    gsap.set(track, { x: dragStartTrackX.current + dx });
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const track = trackRef.current;
      if (!track) return;

      track.releasePointerCapture(e.pointerId);
      track.style.cursor = "grab";

      const currentX = gsap.getProperty(track, "x") as number;
      const momentum = velocityX.current * 180;

      if (Math.abs(momentum) > 10) {
        momentumTween.current = gsap.to(track, {
          x: currentX + momentum,
          duration: 0.7,
          ease: "power3.out",
          onComplete: resumeAutoScroll,
        });
      } else {
        resumeAutoScroll();
      }
    },
    [resumeAutoScroll],
  );

  /* Prevent click navigation when user was dragging */
  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = false;
    }
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
          className="flex items-center whitespace-nowrap select-none touch-pan-y"
          style={{ willChange: "transform", cursor: "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClickCapture={handleClickCapture}
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
                color: "rgba(255,255,255,.35)",
                height: LOGO_H,
                paddingLeft: 0,
                paddingRight: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.75)";
                cursor.set("link", logo.name.toUpperCase());
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,.35)";
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
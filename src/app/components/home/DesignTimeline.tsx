import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "../../hooks/useLanguage";
import { useSiteContent } from "../../hooks/useSiteContent";
import logoImg from "../../../assets/dysigns_white.png";

gsap.registerPlugin(ScrollTrigger);

/**
 * Design Process Timeline
 *
 * Behaviour:
 *  - User scrolls vertically
 *  - This section pins when it hits the top
 *  - Inside the pin, the cards track moves horizontally via scrub
 *  - A progress line and logo circle travel along a baseline
 *  - When horizontal content is exhausted, normal vertical scroll continues
 *
 * Reduced-motion fallback:
 *  - No pin, cards are laid out in a normal horizontal overflow with scroll-snap
 */
export function DesignTimeline() {
  const { t } = useLanguage();
  const content = useSiteContent();
  const steps = content.designProcess;
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getDistance = useCallback(() => {
    const track = trackRef.current;
    const wrap = wrapRef.current;
    if (!track || !wrap) return 0;
    return Math.max(0, track.scrollWidth - wrap.clientWidth);
  }, []);

  /* ─── ANIMATED VERSION ─── */
  useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${getDistance()}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: -2,
          onUpdate: (self) => {
            const p = self.progress;

            // Fill line
            if (lineRef.current) {
              gsap.set(lineRef.current, { scaleX: p });
            }

            // Move logo circle
            if (circleRef.current) {
              const padL = 60;
              const padR = 60;
              const cx = padL + (wrap.clientWidth - padL - padR) * p;
              gsap.set(circleRef.current, {
                left: cx,
                xPercent: -50,
              });
            }

            // Highlight active step
            const activeIdx = Math.round(p * (steps.length - 1));
            cardsRef.current.forEach((c, i) => {
              if (!c) return;
              const isActive = i === activeIdx;
              gsap.to(c, {
                opacity: isActive ? 1 : 0.25,
                scale: isActive ? 1 : 0.94,
                duration: 0.35,
                overwrite: "auto",
              });
            });
            dotsRef.current.forEach((d, i) => {
              if (!d) return;
              const isActive = i === activeIdx;
              d.style.borderColor = isActive
                ? "rgba(255,255,255,.55)"
                : "rgba(255,255,255,.1)";
              d.style.boxShadow = isActive
                ? "0 0 18px rgba(255,255,255,.12)"
                : "none";
              d.style.background = isActive
                ? "rgba(255,255,255,.08)"
                : "transparent";
            });
          },
        },
      });

      // Move track horizontally via timeline scrub (not manual gsap.set)
      tl.to(track, {
        x: () => -getDistance(),
        ease: "none",
        duration: 1,
      });
    }, wrap);

    return () => {
      ctx.revert();
    };
  }, [reduced, getDistance, steps.length]);

  /* ─── REDUCED MOTION ─── */
  if (reduced) {
    return (
      <div
        id="process"
        className="relative py-24"
        style={{
          background: "#000",
          borderTop: "1px solid rgba(255,255,255,.04)",
        }}
      >
        <div className="px-6 md:px-14 mb-8">
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.45)",
            }}
          >
            {t("timeline.label")}
          </span>
        </div>
        <div
          className="flex gap-5 px-6 md:px-14 pb-4 overflow-x-auto"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.id}
              className="flex-shrink-0 w-72 p-6 rounded-xl"
              style={{
                scrollSnapAlign: "start",
                border: "1px solid rgba(255,255,255,.06)",
                background: "rgba(255,255,255,.02)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: ".55rem",
                  fontWeight: 600,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.18)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  letterSpacing: "-.03em",
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3"
                style={{
                  fontSize: ".82rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,.38)",
                }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── FULL ANIMATED VERSION ─── */
  return (
    <div
      ref={wrapRef}
      id="process"
      className="relative"
      style={{
        background: "#000",
        borderTop: "1px solid rgba(255,255,255,.04)",
        /* height must be at least 100vh so pin start triggers correctly */
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* section label */}
      <div
        className="absolute top-8 left-6 md:left-14 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <span
          style={{
            fontSize: ".85rem",
            fontWeight: 600,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.5)",
          }}
        >
          {t("timeline.label")}
        </span>
      </div>

      {/* progress baseline — sits at lower third */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ zIndex: 10, bottom: "22%", height: 1 }}
      >
        {/* bg line */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(255,255,255,.06)" }}
        />
        {/* fill line */}
        <div
          ref={lineRef}
          className="absolute top-0 left-0 h-full"
          style={{
            width: "100%",
            background:
              "linear-gradient(90deg, rgba(255,255,255,.3), rgba(255,255,255,.5))",
            transformOrigin: "left center",
            transform: "scaleX(0)",
          }}
        />

        {/* step dots along the baseline */}
        {steps.map((_, i) => {
          const pct = (i / (steps.length - 1)) * 100;
          return (
            <div
              key={i}
              ref={(el) => {
                dotsRef.current[i] = el;
              }}
              className="absolute rounded-full"
              style={{
                top: -5,
                left: `calc(${pct}%)`,
                marginLeft: -5,
                width: 10,
                height: 10,
                border: "1px solid rgba(255,255,255,.1)",
                transition:
                  "border-color .3s, box-shadow .3s, background .3s",
              }}
            />
          );
        })}

        {/* logo traveler circle */}
        <div
          ref={circleRef}
          className="absolute flex items-center justify-center"
          style={{
            top: -22,
            left: 60,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,.18)",
            boxShadow: "0 0 24px rgba(255,255,255,.06)",
            transform: "translateX(-50%)",
            transition: "box-shadow .3s",
          }}
        >
          <img
            src={logoImg}
            alt="DYSIGNS"
            style={{
              width: 20,
              height: "auto",
              objectFit: "contain",
              opacity: 0.7,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                const s = document.createElement("span");
                s.textContent = "D";
                s.style.cssText =
                  "font-family:'Inter',sans-serif;font-size:.5rem;font-weight:800;color:rgba(255,255,255,.55)";
                parent.appendChild(s);
              }
            }}
          />
        </div>
      </div>

      {/* horizontal cards track */}
      <div
        ref={trackRef}
        className="flex items-center h-full"
        style={{
          /* each card is 100vw so total = steps.length * 100vw */
          width: `${steps.length * 100}vw`,
          willChange: "transform",
        }}
      >
        {steps.map((step, i) => (
          <div
            key={step.id}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: "100vw",
              opacity: i === 0 ? 1 : 0.25,
              transform: i === 0 ? "scale(1)" : "scale(.94)",
            }}
          >
            <div className="max-w-lg px-8 text-center">
              <span
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: ".65rem",
                  fontWeight: 600,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.45)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  letterSpacing: "-.03em",
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </h3>
              <p
                className="mt-3"
                style={{
                  fontSize: ".88rem",
                  lineHeight: 1.7,
                  color: "rgba(255,255,255,.55)",
                }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
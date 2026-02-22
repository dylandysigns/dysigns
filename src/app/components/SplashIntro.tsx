import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import logoImg from "../../assets/dysigns_white.png";

const SESSION_KEY = "dysigns_splash_done";

export function SplashIntro({ onDone }: { onDone: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    onDone();
  }, [onDone]);

  useEffect(() => {
    // skip if already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        finish();
        return;
      }
    } catch {}

    const el = wrapRef.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.to(el, { opacity: 0, duration: 0.3, delay: 0.2, onComplete: finish });
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });

    // Phase 1: Logo blur-in with scale zoom (0 → 0.8s)
    tl.fromTo(
      logoRef.current,
      { scale: 0.6, opacity: 0, filter: "blur(30px)" },
      { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1, ease: "power3.out" },
      0,
    );

    // Expanding ring burst behind logo
    tl.fromTo(
      ringRef.current,
      { scale: 0, opacity: 0.6 },
      { scale: 3, opacity: 0, duration: 1.2, ease: "power2.out" },
      0.2,
    );

    // Scan line sweep
    tl.fromTo(
      scanRef.current,
      { y: "-100%", opacity: 0 },
      { y: "100vh", opacity: 0.5, duration: 0.7, ease: "power1.in" },
      0.4,
    );

    // Tagline wipe-reveal
    tl.fromTo(
      lineRef.current,
      { clipPath: "inset(0 100% 0 0)", opacity: 0 },
      {
        clipPath: "inset(0 0% 0 0)",
        opacity: 1,
        duration: 0.6,
        ease: "power2.inOut",
      },
      0.7,
    );

    // Hold — branded moment (brings total to ~3s)
    tl.to({}, { duration: 1 });

    // Phase 2: Zoom-in dissolve — content scales up as it fades
    tl.to(logoRef.current, {
      scale: 1.3,
      opacity: 0,
      filter: "blur(8px)",
      duration: 0.55,
      ease: "power2.in",
    }, "-=0.1");
    tl.to(lineRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.35,
      ease: "power2.in",
    }, "<");
    tl.to(el, { opacity: 0, duration: 0.4, ease: "power2.inOut" });

    return () => {
      tl.kill();
    };
  }, [finish]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 20000, background: "#000" }}
      onClick={finish}
    >
      {/* noise */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* scan line */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background: "rgba(255,255,255,.4)",
          boxShadow: "0 0 24px rgba(255,255,255,.15)",
          opacity: 0,
        }}
      />

      {/* expanding ring */}
      <div
        ref={ringRef}
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 120,
          height: 120,
          border: "1px solid rgba(255,255,255,.15)",
          opacity: 0,
        }}
      />

      {/* logo */}
      <div ref={logoRef} className="relative mb-5" style={{ opacity: 0 }}>
        <img
          src={logoImg}
          alt="DYSIGNS"
          style={{
            height: "clamp(32px, 6vw, 56px)",
            width: "auto",
            objectFit: "contain",
            filter: "brightness(1)",
          }}
          onError={(e) => {
            // fallback to text if image fails
            (e.target as HTMLImageElement).style.display = "none";
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent) {
              const span = document.createElement("span");
              span.textContent = "DYSIGNS";
              span.style.cssText =
                "font-family:'Inter',sans-serif;font-size:clamp(1.8rem,4vw,2.8rem);font-weight:800;letter-spacing:-.04em;color:#fff";
              parent.appendChild(span);
            }
          }}
        />
      </div>

      {/* tagline */}
      <div ref={lineRef} style={{ opacity: 0 }}>
        <span
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "clamp(.85rem,1.3vw,1.05rem)",
            fontStyle: "italic",
            color: "rgba(255,255,255,.4)",
            letterSpacing: ".01em",
          }}
        >
          Something worth remembering.
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-8 right-8 px-3 py-1 rounded"
        style={{
          fontSize: ".55rem",
          fontWeight: 500,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,.25)",
        }}
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
}
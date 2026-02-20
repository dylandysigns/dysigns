import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PremiumCursorProvider } from "./PremiumCursor";
import { SplashIntro } from "./SplashIntro";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TransitionContext } from "../hooks/useTransition";
import { LanguageProvider } from "../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/**
 * Layout — Root shell for all pages
 *
 * Handles:
 *  - Session-once splash intro
 *  - Black overlay wipe page transition (no stutter)
 *  - SINGLE centralized ScrollTrigger.refresh on resize, font load, image load
 *    (individual components should NOT add their own — avoids thrash)
 *  - Low-power device guard
 *  - Constant black background underlay
 */

/* ─── LOW-POWER GUARD ─── */
const isLowPower = (() => {
  if (typeof window === "undefined") return false;
  const cores = navigator.hardwareConcurrency || 4;
  return cores <= 2;
})();

export { isLowPower };

/* ─── DEV DEBUG HELPER ─── */
const __DEV__ =
  typeof import.meta !== "undefined" &&
  (import.meta as Record<string, unknown>).env &&
  ((import.meta as Record<string, { MODE?: string }>).env as { MODE?: string })
    .MODE === "development";

function debugNav(label: string) {
  if (!__DEV__) return;
  console.groupCollapsed(`[DYSIGNS nav] ${label}`);
  console.log(
    "ScrollTriggers active:",
    ScrollTrigger.getAll().length,
  );
  console.log(
    "GSAP timelines active:",
    gsap.globalTimeline.getChildren(true, true, true).length,
  );
  const overlay = document.querySelector<HTMLElement>(
    "[data-transition-overlay]",
  );
  if (overlay) {
    console.log("Overlay display:", overlay.style.display);
    console.log("Overlay pointer-events:", overlay.style.pointerEvents);
  }
  console.groupEnd();
}

export default function Layout() {
  const [splashDone, setSplashDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const resizeTimer = useRef<ReturnType<typeof setTimeout>>();
  const isTransitioning = useRef(false);
  const refreshQueued = useRef(false);
  /* Safety: ref to the active transition timeline so we can exclude it from killAll */
  const activeTl = useRef<gsap.core.Timeline | null>(null);
  /* Safety timeout to force-reset stuck transitions */
  const safetyTimer = useRef<ReturnType<typeof setTimeout>>();

  /**
   * Centralized debounced ScrollTrigger.refresh
   */
  const scheduleRefresh = useCallback((delayMs = 200) => {
    if (refreshQueued.current) return;
    refreshQueued.current = true;
    setTimeout(() => {
      refreshQueued.current = false;
      ScrollTrigger.refresh();
    }, delayMs);
  }, []);

  const onSplashDone = useCallback(() => {
    setSplashDone(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => ScrollTrigger.refresh()),
    );
  }, []);

  /* ─── DEBOUNCED RESIZE REFRESH ─── */
  useEffect(() => {
    const handler = () => {
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
      resizeTimer.current = setTimeout(() => ScrollTrigger.refresh(), 300);
    };
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("resize", handler);
      if (resizeTimer.current) clearTimeout(resizeTimer.current);
    };
  }, []);

  /* ─── FONT-LOAD REFRESH ─── */
  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() =>
        requestAnimationFrame(() => ScrollTrigger.refresh()),
      );
    }
  }, []);

  /* ─── IMAGE-LOAD REFRESH AFTER SPLASH ─── */
  useEffect(() => {
    if (!splashDone) return;
    const imgs = document.querySelectorAll("img");
    let loaded = 0;
    const total = imgs.length;
    if (!total) return;
    const check = () => {
      loaded++;
      if (loaded >= total) scheduleRefresh(150);
    };
    imgs.forEach((img) => {
      if (img.complete) loaded++;
      else {
        img.addEventListener("load", check);
        img.addEventListener("error", check);
      }
    });
    if (loaded >= total) scheduleRefresh(150);
    return () => {
      imgs.forEach((img) => {
        img.removeEventListener("load", check);
        img.removeEventListener("error", check);
      });
    };
  }, [splashDone, location.pathname, scheduleRefresh]);

  /* ─── SCROLL TO TOP + REFRESH ON ROUTE CHANGE ─── */
  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    });
  }, [location.pathname]);

  /**
   * Kill all page-level GSAP animations and ScrollTriggers.
   * CRITICAL: excludes the active transition timeline so it can complete.
   */
  const killPageAnimations = useCallback(
    (protectedTl?: gsap.core.Timeline | null) => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.getChildren(true, true, true).forEach((child) => {
        if (
          child !== gsap.globalTimeline &&
          child !== protectedTl
        ) {
          child.kill();
        }
      });
    },
    [],
  );

  /**
   * Force-reset transition state — safety valve for stuck transitions.
   */
  const forceResetTransition = useCallback(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      gsap.set(overlay, {
        display: "none",
        yPercent: 100,
        pointerEvents: "none",
      });
    }
    isTransitioning.current = false;
    activeTl.current = null;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    debugNav("force-reset");
  }, []);

  /* ─── ROUTE TRANSITION HANDLER ─── */
  const navigateTo = useCallback(
    (path: string) => {
      debugNav(`navigateTo("${path}") called`);

      // If stuck from a prior transition, force-reset
      if (isTransitioning.current) {
        debugNav("stuck transition detected — force-resetting");
        if (activeTl.current) {
          activeTl.current.kill();
          activeTl.current = null;
        }
        forceResetTransition();
      }

      if (path === location.pathname) return;
      isTransitioning.current = true;

      // Safety timeout: if transition doesn't complete in 3s, force-reset
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => {
        debugNav("safety timeout — force-resetting");
        forceResetTransition();
      }, 3000);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        killPageAnimations(null);
        navigate(path);
        window.scrollTo(0, 0);
        isTransitioning.current = false;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        return;
      }

      const overlay = overlayRef.current;
      const edge = edgeRef.current;
      if (!overlay) {
        killPageAnimations(null);
        navigate(path);
        window.scrollTo(0, 0);
        isTransitioning.current = false;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        return;
      }

      // Build the transition timeline
      const tl = gsap.timeline();
      activeTl.current = tl;

      // Phase 1: wipe in from bottom
      tl.set(overlay, {
        yPercent: 100,
        display: "block",
        pointerEvents: "auto",
      });
      if (edge) tl.set(edge, { opacity: 1 });
      tl.to(overlay, {
        yPercent: 0,
        duration: 0.45,
        ease: "power3.inOut",
      });

      // Phase 2: kill PAGE animations (NOT tl!) and navigate
      tl.call(() => {
        killPageAnimations(tl); // ← protect tl from being killed
        navigate(path);
        window.scrollTo(0, 0);
        debugNav("mid-transition — navigated");
      });

      // Small pause for new DOM to mount
      tl.to({}, { duration: 0.12 });

      // Phase 3: wipe out to top
      tl.to(overlay, {
        yPercent: -100,
        duration: 0.45,
        ease: "power3.inOut",
      });
      if (edge) {
        tl.to(edge, { opacity: 0, duration: 0.2 }, "-=.25");
      }

      // Phase 4: clean up — ALWAYS runs now that tl isn't killed
      tl.call(() => {
        gsap.set(overlay, {
          display: "none",
          yPercent: 100,
          pointerEvents: "none",
        });
        isTransitioning.current = false;
        activeTl.current = null;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        debugNav("transition complete");
        // Let new page animations init
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        });
      });
    },
    [navigate, location.pathname, killPageAnimations, forceResetTransition],
  );

  const transitionApi = useMemo(() => ({ navigateTo }), [navigateTo]);

  return (
    <LanguageProvider>
    <PremiumCursorProvider>
      <TransitionContext.Provider value={transitionApi}>
        {!splashDone && <SplashIntro onDone={onSplashDone} />}

        {/* ─── CONSTANT BLACK UNDERLAY ─── */}
        <div
          className="fixed inset-0"
          style={{ background: "#000", zIndex: -1 }}
          aria-hidden
        />

        <div
          data-cursor-content
          className="min-h-screen relative"
          style={{
            fontFamily: "'Inter',sans-serif",
            background: "#000",
            color: "#fff",
            ...(splashDone ? {} : { overflow: "hidden", height: "100vh" }),
          }}
        >
          {/* global noise */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              zIndex: 9990,
              opacity: 0.032,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>

        {/* ─── ROUTE TRANSITION OVERLAY ─── */}
        <div
          ref={overlayRef}
          data-transition-overlay
          className="fixed inset-0"
          style={{
            zIndex: 10050,
            background: "#000",
            display: "none",
            transform: "translateY(100%)",
            willChange: "transform",
            pointerEvents: "none",
          }}
        >
          {/* white edge cue line */}
          <div
            ref={edgeRef}
            className="absolute top-0 left-0 right-0"
            style={{
              height: 1,
              background:
                "linear-gradient(90deg, transparent 10%, rgba(255,255,255,.3) 50%, transparent 90%)",
              opacity: 0,
            }}
          />
        </div>
      </TransitionContext.Provider>
    </PremiumCursorProvider>
    </LanguageProvider>
  );
}
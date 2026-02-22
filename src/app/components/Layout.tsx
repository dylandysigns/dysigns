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
import logoImg from "../../assets/dysigns_white.png";

gsap.registerPlugin(ScrollTrigger);

/**
 * Layout — Root shell for all pages
 *
 * Handles:
 *  - Session-once splash intro
 *  - Crossfade page transition
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
  const navigate = useNavigate();
  const location = useLocation();
  const resizeTimer = useRef<ReturnType<typeof setTimeout>>();
  const busy = useRef(false);
  const refreshQueued = useRef(false);
  const activeTl = useRef<gsap.core.Timeline | null>(null);
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

  /* ─── FAVICON — same logo as header ─── */
  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = logoImg;
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
   * Uses shallow getChildren (false) so tweens nested inside the
   * protected transition timeline are NOT destroyed.
   */
  const killPageAnimations = useCallback(
    (protectedTl?: gsap.core.Timeline | null) => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.globalTimeline.getChildren(false, true, true).forEach((child) => {
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
  const forceReset = useCallback(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      gsap.set(overlay, { opacity: 0, visibility: "hidden", pointerEvents: "none" });
    }
    busy.current = false;
    activeTl.current = null;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);

  /* ─── ROUTE TRANSITION HANDLER ─── */
  const navigateTo = useCallback(
    (path: string) => {
      // If stuck from a prior transition, force-reset
      if (busy.current) {
        if (activeTl.current) {
          activeTl.current.kill();
          activeTl.current = null;
        }
        forceReset();
      }

      if (path === location.pathname) return;
      busy.current = true;

      // Safety timeout
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(forceReset, 3500);

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        killPageAnimations(null);
        navigate(path);
        window.scrollTo(0, 0);
        busy.current = false;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) {
        killPageAnimations(null);
        navigate(path);
        window.scrollTo(0, 0);
        busy.current = false;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        return;
      }

      const tl = gsap.timeline();
      activeTl.current = tl;

      // Phase 1: fade IN the black overlay (old page fades to black)
      tl.set(overlay, { opacity: 0, visibility: "visible", pointerEvents: "auto" });
      tl.to(overlay, {
        opacity: 1,
        duration: 0.35,
        ease: "power2.inOut",
      });

      // Phase 2: swap route while fully covered
      tl.call(() => {
        killPageAnimations(tl);
        navigate(path);
        window.scrollTo(0, 0);
      });

      // Brief hold for new DOM to mount
      tl.to({}, { duration: 0.1 });

      // Phase 3: fade OUT the overlay (new page fades in from black)
      tl.to(overlay, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
      });

      // Phase 4: cleanup
      tl.call(() => {
        gsap.set(overlay, { visibility: "hidden", pointerEvents: "none" });
        busy.current = false;
        activeTl.current = null;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      });
    },
    [navigate, location.pathname, killPageAnimations, forceReset],
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

        {/* ─── CROSSFADE TRANSITION OVERLAY ─── */}
        <div
          ref={overlayRef}
          className="fixed inset-0"
          style={{
            zIndex: 10050,
            background: "#000",
            opacity: 0,
            visibility: "hidden",
            pointerEvents: "none",
            willChange: "opacity",
          }}
        />
      </TransitionContext.Provider>
    </PremiumCursorProvider>
    </LanguageProvider>
  );
}
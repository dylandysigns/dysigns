import { useState, useCallback, useEffect, useRef, useMemo, startTransition } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronUp } from "lucide-react";
import { PremiumCursorProvider } from "./PremiumCursor";
import { SplashIntro } from "./SplashIntro";
import { createWarp, type Warp } from "./SpaceWarp";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FixedAgent } from "../../../preview/FixedAgent";
import { TransitionContext } from "../hooks/useTransition";
import { LanguageProvider, pathIsDutch } from "../hooks/useLanguage";
/* ─── BACK TO TOP BUTTON ─── */
function BackToTop() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      scale: show ? 1 : 0,
      opacity: show ? 1 : 0,
      duration: 0.3,
      ease: show ? "back.out(1.7)" : "power2.in",
      overwrite: true,
    });
  }, [show]);

  return (
    <button
      ref={btnRef}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed z-[9999] grid place-items-center rounded-full group"
      style={{
        // above the agent's fixed button (preview/FixedAgent.tsx), centred on it
        bottom: "var(--fa-stack, 28px)",
        right: "var(--fa-stack-right, 28px)",
        width: 44,
        height: 44,
        background: "rgba(var(--page-fg-rgb), .06)",
        border: "1px solid rgba(var(--page-fg-rgb), .1)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        color: "rgba(var(--page-fg-rgb), .5)",
        cursor: "pointer",
        transform: "scale(0)",
        opacity: 0,
        transition: "background .3s, border-color .3s, color .3s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .12)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .25)";
        (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .06)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .1)";
        (e.currentTarget as HTMLElement).style.color = "rgba(var(--page-fg-rgb), .5)";
      }}
    >
      <ChevronUp size={18} strokeWidth={2} />
    </button>
  );
}

gsap.registerPlugin(ScrollTrigger);

// Prevent iOS address-bar resize events (≈44px height change on scroll up/down)
// from triggering ScrollTrigger.refresh() and snapping scrub animations.
ScrollTrigger.config({ ignoreMobileResize: true });

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

/* The order of the main pages in the menu: going to a later one flies you to the right, to an earlier
   one to the left. Every other page counts as sitting between Work and About. */
const PAGE_ORDER: Record<string, number> = { "/": 0, "/work": 1, "/about": 2, "/contact": 3 };
function pageIndex(path: string): number {
  const bare = path.replace(/^\/nl(?=\/|$)/, "") || "/";
  const top = "/" + (bare.split("/")[1] ?? "");
  return PAGE_ORDER[top] ?? 1.5;
}

export default function Layout() {
  const [splashDone, setSplashDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const warpCanvasRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef<Warp | null>(null);
  const flightCancel = useRef<(() => void) | null>(null);
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
    // the hero's agent starts its speech bubble on this (preview/SpaceAgent.tsx)
    window.dispatchEvent(new Event("dysigns:splash-done"));
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

  /* ─── FAVICON — /favicon.png (custom round mark) ─── */
  useEffect(() => {
    // Standard favicon
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/png";
    link.href = "/favicon.png";

    // Apple touch icon (home screen on iOS)
    let touchLink = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!touchLink) {
      touchLink = document.createElement("link");
      touchLink.rel = "apple-touch-icon";
      document.head.appendChild(touchLink);
    }
    touchLink.href = "/favicon.png";
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
    flightCancel.current?.();
    flightCancel.current = null;
    warpRef.current?.stop();
    if (overlay) {
      overlay.style.backdropFilter = "none";
      overlay.style.background = "#000";
    }
    const m = document.querySelector<HTMLElement>("main");
    if (m) gsap.set(m, { clearProps: "transform,opacity,willChange,transformOrigin" });
    document.documentElement.style.overflowX = "";
    busy.current = false;
    activeTl.current = null;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
  }, []);

  useEffect(() => {
    if (!warpCanvasRef.current) return;
    warpRef.current = createWarp(warpCanvasRef.current);
    return () => {
      warpRef.current?.destroy();
      warpRef.current = null;
    };
  }, []);

  /* ─── ROUTE TRANSITION HANDLER ─── */
  const navigateTo = useCallback(
    (rawPath: string, opts?: { instant?: boolean }) => {
      // Preserve the current language segment on internal navigation —
      // a plain "/work" target from a page/component that doesn't know
      // about /nl still lands on "/nl/work" while browsing Dutch.
      const isNl = pathIsDutch(location.pathname);
      const path =
        isNl && !pathIsDutch(rawPath)
          ? rawPath === "/"
            ? "/nl"
            : `/nl${rawPath}`
          : rawPath;

      // If stuck from a prior transition, force-reset
      if (busy.current) {
        if (activeTl.current) {
          activeTl.current.kill();
          activeTl.current = null;
        }
        forceReset();
      }

      if (path === location.pathname) return;
      if (opts?.instant) {
        // the caller flies on its own: just change the page, in slices so the caller's frames go on
        window.dispatchEvent(new Event("dysigns:cursor-reset"));
        killPageAnimations(null);
        startTransition(() => navigate(path));
        window.scrollTo(0, 0);
        return;
      }
      busy.current = true;

      // Safety timeout
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(forceReset, 6000);

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
      const main = document.querySelector<HTMLElement>("main");
      if (!overlay || !main) {
        killPageAnimations(null);
        navigate(path);
        window.scrollTo(0, 0);
        busy.current = false;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        return;
      }

      // The same sideways move as when the contact form is sent: the page lets go and slides away to one
      // side while soft streaks of stars flow past, and the new page comes in from the other side. To the
      // right in the menu: the old page goes out to the left and the new one comes in from the right;
      // to the left in the menu: the other way round.
      const dir: 1 | -1 = pageIndex(path) >= pageIndex(location.pathname) ? 1 : -1;
      const tl = gsap.timeline();
      activeTl.current = tl;
      const warp = warpRef.current;
      const xOut = `${-dir * 8}vw`;
      const xIn = `${dir * 8}vw`;
      const root = document.documentElement;
      const prevOverflow = root.style.overflowX;
      root.style.overflowX = "hidden"; // the sliding page must not make a horizontal scrollbar

      // the overlay is only the layer of the streaks now: see-through, no black cover
      overlay.style.background = "transparent";
      gsap.set(overlay, { opacity: 0, visibility: "visible", pointerEvents: "auto" });
      gsap.set(main, { willChange: "transform, opacity", transformOrigin: "50% 40vh" });
      if (warp) {
        warp.state.dir = dir;
        warp.state.speed = 0;
        warp.start();
        tl.to(warp.state, { speed: 0.5, duration: 0.9, ease: "sine.inOut" }, 0);
      }
      tl.to(overlay, { opacity: 1, duration: 0.5, ease: "sine.inOut" }, 0);
      tl.to(main, { x: xOut, scale: 0.96, opacity: 0, duration: 0.6, ease: "sine.inOut" }, 0);

      // swap the route while the old page is out of sight, and put the new one on the other side at once
      tl.call(() => {
        window.dispatchEvent(new Event("dysigns:cursor-reset"));
        killPageAnimations(tl);
        navigate(path);
        window.scrollTo(0, 0);
        gsap.set(main, { x: xIn, scale: 0.96, opacity: 0 });
      }, [], 0.65);

      // the new page glides in; the stars calm down and let go
      tl.to(main, { x: 0, scale: 1, opacity: 1, duration: 0.85, ease: "sine.inOut" }, 0.78);
      if (warp) tl.to(warp.state, { speed: 0.02, duration: 1.0, ease: "sine.inOut" }, 0.8);
      tl.to(overlay, { opacity: 0, duration: 0.7, ease: "sine.inOut" }, 1.0);

      tl.call(() => {
        warp?.stop();
        gsap.set(overlay, { visibility: "hidden", pointerEvents: "none" });
        overlay.style.background = "#000";
        gsap.set(main, { clearProps: "transform,opacity,willChange,transformOrigin" });
        root.style.overflowX = prevOverflow;
        busy.current = false;
        activeTl.current = null;
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => ScrollTrigger.refresh()),
        );
      }, [], 1.75);
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
            fontFamily: "var(--font-brand)",
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
              transform: "translateZ(0)",
              contain: "strict",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }}
          />

          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>

        {/* ─── BACK TO TOP ─── */}
        {splashDone && <BackToTop />}

        {/* ─── THE DYSIGNS AGENT, fixed bottom right on every screen (preview/FixedAgent.tsx) ─── */}
        {splashDone && <FixedAgent />}

        {/* ─── SPACE TRANSITION OVERLAY ─── */}
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
        >
          {/* the stars of the sideways flight, see SpaceWarp.ts */}
          <canvas
            ref={warpCanvasRef}
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </TransitionContext.Provider>
    </PremiumCursorProvider>
    </LanguageProvider>
  );
}

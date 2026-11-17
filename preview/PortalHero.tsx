import { AvailGlobe } from "./AvailGlobe";
import { SpaceAgent } from "./SpaceAgent";
import { useEffect, useRef, useState } from "react";
import { openGlobeScene } from "./openGlobeScene";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../src/styles/effra.css";
import "./portal-hero.css";
import { createSpace, type Space } from "./portalSpace";
import { arriveAt, type Travel } from "./portalTravel";
import { EMBLEM_SPIN_REST, PLANET_SHARE, emblemWidthPx, type Emblem } from "./portalEmblem";
import { PARTNERS } from "./copy";
import { TransitionLink } from "../src/app/components/TransitionLink";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { usePageTransition } from "../src/app/hooks/useTransition";
import { useNavigate } from "react-router";
import { pathIsDutch } from "../src/app/hooks/useLanguage";
import { getLocalizedContent } from "../src/app/content/loadContent";


/* Preview only. Portal hero for DYSIGNS, made to stand in for the live hero on the
   homepage (dev only, see src/app/pages/HomePage.tsx): a black universe with fine
   stars, soft light and thin lines of light. Scroll and you fly into it, towards a
   white planet. The planet turns and unrolls, in 3D, into the chrome DYSIGNS emblem;
   then carbon black sweeps over it, and from then on follows the pointer. From there
   the hero is simply the first screen of the page: you scroll on, down into selected
   projects and the rest of the site. The site's own header and cursor sit on top. */

type Scene = "a" | "toB" | "b" | "toA";

/* The service pills that float around the emblem, in the order the CSS places them.
   Each one opens its service page; hovering shows what is behind it. Strategy has no
   page of its own, so it goes to the services section further down the homepage. */
const SERVICES = [
  { label: "hero.chip.ux", slug: "ux-ui-design", img: "/images/stelz-app-work-cover.avif" },
  { label: "hero.chip.web", slug: "web-design", img: "/images/stelz-laptop.avif" }, // the STËLZ store
  { label: "hero.chip.brand", slug: "branding", img: "/images/studio75-cover-v2.avif" },
  { label: "hero.chip.strategy", slug: null, img: "/images/sfumato-principles.avif" }, // brand principles
  { label: "hero.chip.product", slug: "social-media-meta-ads", img: "/images/merelymade-cover.avif" },
  // no case image for this one yet: its card shows the title and text only
  { label: "hero.chip.ai", slug: "ai-implementation", img: null },
] as const;

// set when a pill takes you to a service page, so coming back lands you at the emblem again
const RETURN_KEY = "ph-return";
const SPIN_FROM = EMBLEM_SPIN_REST + 360; // the planet makes one full turn while it becomes the emblem

/* What you fly to does not just appear: it comes out of the distance, small and far away in
   the middle of the screen, and grows towards you until it fills it. Kept outside the
   component on purpose: on a page change the hero is gone before this has finished. */
function comeForward(el: Element | null, delayMs = 0) {
  if (!el) return;
  const run = () =>
    gsap.fromTo(
      el,
      { scale: 0.16, opacity: 0, transformOrigin: "50% 50vh" },
      { scale: 1, opacity: 1, duration: 1.25, ease: "power3.out", clearProps: "transform,opacity,transformOrigin" },
    );
  if (delayMs) window.setTimeout(run, delayMs);
  else run();
}
/* ─── Travelling to another page ───
   The flight does not end in a fade. A second space canvas, on the same clock and in the same
   state as the hero's, is laid behind the page content. When the route changes the hero
   disappears and that canvas is simply what was already there: the same stars, still
   stretching. The new page is in it from the first moment, tiny and far ahead in the middle of
   the screen, and it is what you are flying towards: it grows until it fills the screen, the
   stars slow down, and the canvas lets go. */
function openTravel(from: Space): Travel | null {
  const main = document.querySelector<HTMLElement>("main");
  const host = main?.parentElement;
  if (!main || !host) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "ph-travel";
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);
  const space = createSpace(canvas, { t0: from.t0 });
  if (!space) {
    canvas.remove();
    return null;
  }
  // the page content sits in front of the travel canvas
  gsap.set(main, { position: "relative", zIndex: 1 });
  Object.assign(space.state, from.state);
  space.start();
  return { space, canvas, main };
}

export default function PortalHero() {
  const [noGl, setNoGl] = useState(false);
  const { t, lang } = useLanguage();
  const { navigateTo } = usePageTransition();
  const navRef = useRef(navigateTo);
  navRef.current = navigateTo;
  // the router's own navigate: a flight swaps the page itself, without the site's fade to black
  const routerNavigate = useNavigate();
  const openGlobe = (origin: { cx: number; cy: number; diameter: number }) =>
    openGlobeScene({ mode: "projects", origin, t, lang, navigateTo: (p, o) => navRef.current(p, o) });
  const goRef = useRef((path: string) => {});
  goRef.current = (path: string) => routerNavigate(pathIsDutch(window.location.pathname) && !pathIsDutch(path) ? `/nl${path}` : path);
  const services = SERVICES.map((sv) => {
    const page = sv.slug ? getLocalizedContent(`services/${sv.slug}.md`, lang).frontmatter : null;
    return {
      ...sv,
      name: t(sv.label),
      title: page ? page.heading || page.title : t("services.label"),
      text: page ? page.description : t("services.introHeading"),
    };
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const landRef = useRef<HTMLCanvasElement>(null);
  const cardCanvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<{ forward: () => void; hover: (on: boolean) => void; warpTo: (path: string | null) => boolean; toWork: () => void; flyTo: (path: string) => boolean } | null>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const cardEl = cardCanvasRef.current!;
    const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
    // In `npm run dev`, ?motion=reduce forces the reduced-motion version, to check it without
    // changing a system setting.
    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (import.meta.env.DEV && new URLSearchParams(window.location.search).get("motion") === "reduce");

    let scene: Scene = "a";
    let tl: gsap.core.Timeline | null = null;
    let card: Emblem | null = null;
    let cardLoading: Promise<void> | null = null;
    let wantShow = false; // the emblem should be on screen as soon as it has loaded
    let inkDue = false; // and should then get its sweep of carbon black
    let inkOk = false; // carbon black only once it is the emblem
    let alive = true;
    let scrubbing = false; // the flight is being driven by the visitor's own scroll
    // a trackpad keeps sending wheel events after the fingers lift: one swipe is one step
    let quietUntil = 0;
    // The flight owns the scroll. Once the emblem is there the hero is an ordinary first
    // screen: the lock comes off and the page scrolls on from it.
    const lock = (on: boolean) => document.documentElement.classList.toggle("ph-lock", on);
    let topSince = 0; // since when the page has been resting at the very top
    let unlockLater: gsap.core.Tween | null = null;
    /** `holdMs`: keep the page locked that long after arriving at the emblem, so the scroll
        that brought you there does not carry on into the page. */
    const settle = (to: Scene, holdMs = 0) => {
      scene = to;
      root.dataset.scene = to;
      scrubbing = false;
      quietUntil = topSince = performance.now() + 450;
      unlockLater?.kill();
      if (to === "b" && holdMs) {
        lock(true);
        unlockLater = gsap.delayedCall(holdMs / 1000, () => scene === "b" && lock(false));
      } else lock(to !== "b");
    };
    window.scrollTo(0, 0);
    lock(true);

    const land: Space | null = createSpace(landRef.current!);
    if (!land) setNoGl(true);
    const simple = reduced || !land; // plain crossfade instead of the fly-through

    function layout() {
      land?.resize();
      card?.resize();
      if (land && reduced) land.renderOnce();
    }
    layout();
    if (land && !reduced) land.start();
    else land?.renderOnce();

    gsap.set(q(".ph-b [data-rise]"), { autoAlpha: 0, y: 14 });

    /* ─── The emblem loads after idle, or on the first trip through the portal ─── */
    function loadCard() {
      if (cardLoading) return cardLoading;
      cardLoading = import("./portalEmblem")
        .then((m) => m.createEmblem(cardEl))
        .then((c) => {
          if (!alive) return c.destroy();
          card = c;
          c.state.still = reduced;
          if (wantShow) showEmblem();
        })
        .catch((err) => {
          console.warn("[portal hero] emblem failed to load", err);
          root.classList.add("ph--nocard");
        });
      return cardLoading;
    }
    const idle = window.setTimeout(loadCard, 1800);

    /* The planet and the emblem are one object. `grow` brings it closer; `morph` unrolls the
       sphere into the emblem while `spin` turns it once. As long as it is a planet, the white
       disc and halo in the space canvas sit exactly behind it (`shrink` lets them go). */
    const fx = { grow: 0, shrink: 1, morph: 0, spin: SPIN_FROM };
    const planetR = () => {
      const vh = window.innerHeight || 1;
      return (emblemWidthPx(window.innerWidth || 1, vh) * PLANET_SHARE) / vh;
    };
    function syncEmblem() {
      if (!land || simple) return;
      // a touch larger than the wrapped emblem, so its edge never peeks out
      land.state.planet = planetR() * 1.03 * fx.grow * fx.shrink;
      if (card) {
        card.state.scale = Math.max(0.02, fx.grow);
        card.state.morph = fx.morph;
        card.state.spin = fx.spin;
      }
      cardEl.style.opacity = fx.grow > 0.01 ? "1" : "0";
    }
    function showEmblem() {
      wantShow = true;
      if (!card) return;
      wantShow = false;
      const c = card;
      c.resize();
      c.start();
      gsap.killTweensOf(c.state);
      c.state.auto = -1;
      inkOk = false;
      if (simple || scene === "b") {
        // no flight to ride on (reduced motion, or it loaded late): the emblem just fades in
        c.state.scale = 1;
        c.state.morph = 1;
        c.state.spin = EMBLEM_SPIN_REST;
        gsap.to(cardEl, { opacity: 1, duration: 0.5, ease: "power1.out" });
      } else syncEmblem();
      if (inkDue) inkEmblem();
    }
    /* Only once it is the emblem, carbon black sweeps over it; after that it follows the pointer. */
    function inkEmblem() {
      inkDue = true;
      if (!card) return;
      inkDue = false;
      if (simple) {
        inkOk = true;
        return;
      }
      gsap.fromTo(card.state, { auto: 0 }, { auto: 1.001, duration: 1.9, ease: "power1.inOut", onStart: () => void (inkOk = true) });
    }

    /* ─── Forward: to the planet, which becomes the emblem ─── */
    function forward() {
      if (scene !== "a") return;
      scene = "toB";
      hover(false);
      root.dataset.scene = "toB";
      loadCard();
      tl?.kill();

      const aBlocks = q(".ph-a [data-fade]");
      const bFades = q(".ph-b [data-rise]");
      gsap.set(bFades, { autoAlpha: 0, y: 14 });
      gsap.set(cardEl, { opacity: 0 });
      Object.assign(fx, { grow: 0, shrink: 1, morph: 0, spin: SPIN_FROM });
      card?.clearPointer(); // a pointer left over from an earlier visit must not paint carbon on the planet

      tl = gsap.timeline({
        onUpdate: syncEmblem,
        onComplete: () => settle("b"),
      });
      showEmblem();

      if (simple) {
        if (land) {
          Object.assign(land.state, { planet: 0, fill: 0, room: 1 });
          land.renderOnce();
        }
        tl.to(aBlocks, { autoAlpha: 0, duration: 0.4 }, 0)
          .call(inkEmblem, [], 0)
          .to(bFades, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.2);
        return;
      }

      const s = land!.state;
      s.fill = 1;
      // 0.0 to 0.4: the copy lets go
      tl.to(aBlocks, { autoAlpha: 0, y: 20, filter: "blur(8px)", duration: 0.4, ease: "power2.in", stagger: 0.03 }, 0)
        // 0.3 to 2.3: into the universe; the stars stretch and a white planet comes closer
        .to(s, { warp: 1, duration: 1.3, ease: "power2.in" }, 0.3)
        .to(s, { travel: 1.9, duration: 2.6, ease: "power2.inOut" }, 0.3)
        .to(fx, { grow: 1, duration: 1.8, ease: "power2.inOut" }, 0.5)
        .to(s, { warp: 0, duration: 1.0, ease: "power2.out" }, 1.7)
        // 1.9 to 4.1: space calms down and the planet, facing you and holding still, relaxes into
        // the emblem while its light lets go. It does not turn yet: turning while it changes shape
        // is what made it look crumpled.
        .to(s, { room: 1, duration: 1.8, ease: "sine.inOut" }, 1.9)
        .to(fx, { morph: 1, duration: 2.0, ease: "sine.inOut" }, 2.1)
        .to(s, { fill: 0, duration: 1.4, ease: "sine.inOut" }, 2.2)
        .to(fx, { shrink: 0.7, duration: 1.4, ease: "sine.in" }, 2.2)
        // 3.7 to 5.5: now that it is the emblem, its one full turn; then the pills and the carbon
        .to(fx, { spin: EMBLEM_SPIN_REST, duration: 1.8, ease: "power2.inOut" }, 3.7)
        .to(bFades, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 4.7)
        .call(inkEmblem, [], 5.4);
    }

    /* ─── Back: the same way out ─── */
    function back() {
      if (scene !== "b" && scene !== "toB") return;
      scene = "toA";
      root.dataset.scene = "toA";
      lock(true);
      window.scrollTo(0, 0);
      tl?.kill();
      wantShow = false;
      inkDue = false;
      inkOk = false;
      if (card) {
        gsap.killTweensOf(card.state);
        card.state.auto = -1;
        card.clearPointer();
      }

      const aBlocks = q(".ph-a [data-fade]");
      const aLines = q(".ph-a .ph-line");
      const bFades = q(".ph-b [data-rise]");

      tl = gsap.timeline({
        onUpdate: syncEmblem,
        onComplete: () => {
          settle("a");
          card?.stop();
        },
      });

      if (simple) {
        if (land) {
          Object.assign(land.state, { planet: 0, fill: 1, room: 0 });
          land.renderOnce();
        }
        tl.to(bFades, { autoAlpha: 0, duration: 0.3 }, 0)
          .to(cardEl, { opacity: 0, duration: 0.3 }, 0)
          .to(aBlocks, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.4 }, 0.1);
        return;
      }

      const s = land!.state;
      gsap.set(aBlocks, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
      gsap.set(aLines, { yPercent: 105 });
      gsap.set(q(".ph-a [data-rise]"), { autoAlpha: 0, y: 14 });

      // the emblem rolls back up into the planet, and the planet falls away behind you
      tl.to(bFades, { autoAlpha: 0, duration: 0.25 }, 0)
        .set(fx, { spin: SPIN_FROM }, 0) // the same pose, one turn further: ready for the next visit
        .to(fx, { morph: 0, duration: 0.8, ease: "power2.inOut" }, 0)
        .to(fx, { shrink: 1, duration: 0.5, ease: "power1.out" }, 0.15)
        .to(s, { fill: 1, duration: 0.5, ease: "power1.out" }, 0.15)
        .to(s, { room: 0, duration: 0.9, ease: "power1.inOut" }, 0.2)
        .to(s, { warp: 0, travel: 0, duration: 1.2, ease: "power3.out" }, 0)
        .to(fx, { grow: 0, duration: 0.8, ease: "power2.in" }, 0.6)
        .to(aLines, { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.07 }, 1.1)
        .to(q(".ph-a [data-rise]"), { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.05 }, 1.15);
    }

    /* ─── The flight follows the scroll ───
       From the opening screen to the emblem is one timeline, and the visitor's own scroll is
       its playhead: scroll down and you fly in, the planet arrives and relaxes into the emblem;
       stop and it stops; scroll back up and it runs backwards. At the emblem the page takes
       the scroll over; scrolling up from there, at the top of the page, picks the flight up
       again from its end. */
    const scrub = { prog: 0, cur: 0, idleAt: 0 };
    let flight: gsap.core.Timeline | null = null;
    let glide: gsap.core.Tween | null = null;
    if (!simple) {
      const s = land!.state;
      const aBlocks = q(".ph-a [data-fade]");
      const bFades = q(".ph-b [data-rise]");
      flight = gsap
        .timeline({ paused: true, onUpdate: syncEmblem })
        // the copy lets go
        .to(aBlocks, { autoAlpha: 0, y: 20, filter: "blur(8px)", duration: 0.4, ease: "power2.in", stagger: 0.03 }, 0)
        // into the universe; the stars stretch and a white planet comes closer
        .to(s, { warp: 1, duration: 1.3, ease: "power2.in" }, 0.3)
        .to(s, { travel: 1.9, duration: 2.6, ease: "power2.inOut" }, 0.3)
        .to(fx, { grow: 1, duration: 1.8, ease: "power2.inOut" }, 0.5)
        .to(s, { warp: 0, duration: 1.0, ease: "power2.out" }, 1.7)
        // space calms down and the planet, facing you and holding still, relaxes into the emblem
        .to(s, { room: 1, duration: 1.8, ease: "sine.inOut" }, 1.9)
        .to(fx, { morph: 1, duration: 2.0, ease: "sine.inOut" }, 2.1)
        .to(s, { fill: 0, duration: 1.4, ease: "sine.inOut" }, 2.2)
        .to(fx, { shrink: 0.7, duration: 1.4, ease: "sine.in" }, 2.2)
        // its one full turn, and the pills
        .to(fx, { spin: EMBLEM_SPIN_REST, duration: 1.8, ease: "power2.inOut" }, 3.7)
        .to(bFades, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.08 }, 4.7);
    }
    /** Puts the flight at its end without playing it (arriving at the emblem another way). */
    function flightAtEnd() {
      scrub.prog = scrub.cur = 1;
      flight?.progress(1);
    }
    /** Takes the scroll: from the opening screen (at 0) or from the emblem (at 1). */
    function enterScrub() {
      if (scrubbing) return true;
      if (!flight || leaving) return false;
      if (scene === "a") {
        hover(false);
        loadCard();
        card?.clearPointer(); // a pointer left over from an earlier visit must not paint carbon on the planet
        scrub.prog = scrub.cur = 0;
        scrubbing = true;
        scene = "toB";
        root.dataset.scene = "toB";
        showEmblem();
      } else if (scene === "b") {
        unlockLater?.kill();
        lock(true);
        window.scrollTo(0, 0);
        inkDue = false;
        inkOk = false;
        if (card) {
          gsap.killTweensOf(card.state);
          card.state.auto = -1;
          card.clearPointer();
        }
        scrub.prog = scrub.cur = 1;
        scrubbing = true;
        scene = "toB";
        root.dataset.scene = "toB";
      } else return false;
      return true;
    }
    /** The visitor scrolls: `d` is a share of the whole flight, down is positive. */
    function scrubBy(d: number) {
      if ((scene === "a" && d <= 0) || (scene === "b" && d >= 0)) return;
      if (!enterScrub()) return;
      glide?.kill();
      scrub.prog = Math.min(1, Math.max(0, scrub.prog + d));
      scrub.idleAt = performance.now();
    }
    /** Keys and buttons: the flight plays to one of its ends by itself. */
    function scrubTo(v: 0 | 1) {
      if (!enterScrub()) return;
      glide?.kill();
      glide = gsap.to(scrub, { prog: v, duration: 0.4 + Math.abs(v - scrub.prog) * 1.6, ease: "power1.inOut" });
    }
    /* Stopped halfway through the flight: a quiet "keep scrolling" shows up under the middle,
       and goes again as soon as the visitor scrolls on or the flight reaches an end. */
    let midHint = false;
    const showMidHint = (on: boolean) => {
      if (on === midHint) return;
      midHint = on;
      root.classList.toggle("ph--paused", on);
    };
    function tickScrub() {
      if (!scrubbing || !flight) {
        showMidHint(false);
        return;
      }
      showMidHint(!glide?.isActive() && scrub.prog > 0.04 && scrub.prog < 0.97 && performance.now() - scrub.idleAt > 700);
      // released close to an end: it settles there by itself
      if (!glide?.isActive() && performance.now() - scrub.idleAt > 260) {
        if (scrub.prog > 0.9) scrub.prog = 1;
        else if (scrub.prog < 0.06) scrub.prog = 0;
      }
      scrub.cur += (scrub.prog - scrub.cur) * 0.3;
      if (Math.abs(scrub.prog - scrub.cur) < 0.0006) scrub.cur = scrub.prog;
      flight.progress(scrub.cur);
      if (scrub.cur >= 1) {
        settle("b");
        inkEmblem();
      } else if (scrub.cur <= 0 && scrub.prog <= 0) {
        settle("a");
        card?.stop();
      }
    }

    function hover(on: boolean) {
      if (!land) return;
      gsap.to(land.state, { hover: on && scene === "a" ? 1 : 0, duration: 0.4, ease: "power2.out" });
      if (reduced) gsap.delayedCall(0.45, () => land.renderOnce());
    }
    /* ─── A pill: off through space again, to that service's page, or (without a path) to the
       services section further down this page. Returns false when there is no flight
       (reduced motion, no WebGL), so the link just works as a link. ─── */
    let leaving = false;
    function landOnServices() {
      // the hero is black by now: jump down the page, then put the hero back as it was
      const target = document.getElementById("services");
      target?.scrollIntoView({ behavior: "auto", block: "start" });
      comeForward(target);
      tl?.kill();
      const s = land!.state;
      s.warp = 0;
      if (card) card.state.scale = 1;
      gsap.set(cardEl, { opacity: 1 });
      gsap.set(q(".ph-b [data-rise]"), { autoAlpha: 1 });
      leaving = false;
      lock(false);
      onScroll();
    }
    /** `quick`: the short version, for a trip that has already shown the emblem on the way. */
    function warpTo(path: string | null, quick = false) {
      if (scene === "b" && simple && path) {
        // no flight, the link works as a link; coming back still lands at the emblem
        try {
          sessionStorage.setItem(RETURN_KEY, "1");
        } catch {
          /* private mode */
        }
      }
      if (scene !== "b" || simple) return false;
      if (leaving) return true;
      leaving = true;
      lock(true);
      tl?.kill();
      inkOk = false;
      const s = land!.state;
      const bFades = q(".ph-b [data-rise]");
      if (card) {
        gsap.killTweensOf(card.state);
        card.state.auto = -1;
      }

      if (!path) {
        // Strategy: the same flight, landing on the services section of this page
        tl = gsap.timeline();
        tl.to(bFades, { autoAlpha: 0, duration: 0.3 }, 0)
          .to(s, { warp: 1, duration: 1.5, ease: "power2.in" }, 0)
          .to(s, { travel: s.travel + 2.6, duration: 2.6, ease: "power2.in" }, 0)
          .to(cardEl, { opacity: 0, duration: 0.5, ease: "power1.in" }, 1.15)
          .to(root, { opacity: 0, duration: 0.45, ease: "power1.in" }, 1.85)
          .call(landOnServices, [], 2.35);
        if (card) tl.to(card.state, { scale: 6, duration: 1.6, ease: "power2.in" }, 0.05);
        return true;
      }

      // a service page: you fly past the emblem, and the page is already ahead of you
      const travel = openTravel(land!);
      try {
        sessionStorage.setItem(RETURN_KEY, "1");
      } catch {
        /* private mode: coming back then simply starts at the opening screen */
      }
      tl = gsap.timeline({ onUpdate: () => travel && Object.assign(travel.space.state, s) });
      tl.to(bFades, { autoAlpha: 0, duration: 0.3 }, 0)
        .to(s, { warp: 0.75, duration: 1.1, ease: "power2.in" }, 0)
        .to(s, { travel: s.travel + 0.9, duration: 1.1, ease: "power2.in" }, 0)
        .to(cardEl, { opacity: 0, duration: 0.35, ease: "power1.in" }, 0.75)
        .call(() => (travel ? arriveAt(travel, () => goRef.current(path), quick ? 2 : 1) : navRef.current(path)), [], 1.1);
      if (card) tl.to(card.state, { scale: 5, duration: 1.1, ease: "power2.in" }, 0);
      if (quick) tl.timeScale(2);
      return true;
    }
    /* ─── See work: from the opening screen straight through space to selected projects,
       the section right under the hero. The hero is left behind as it is after the full
       flight, so scrolling back up finds the emblem. ─── */
    function landOnWork() {
      tl?.kill();
      flightAtEnd();
      Object.assign(fx, { grow: 1, shrink: 0.7, morph: 1, spin: EMBLEM_SPIN_REST });
      if (land) {
        Object.assign(land.state, { warp: 0, planet: 0, fill: 0, room: 1 });
        if (reduced) land.renderOnce();
      }
      settle("b");
      inkDue = false;
      showEmblem(); // scene is "b": it comes in as the finished emblem
      inkOk = true;
      gsap.set(q(".ph-a [data-fade]"), { autoAlpha: 0 });
      gsap.set(q(".ph-b [data-rise]"), { autoAlpha: 1, y: 0 });
      gsap.set(root, { opacity: 1 });
      window.scrollTo(0, root.offsetHeight);
      onScroll();
      // Selected projects is pinned. The zoom goes on the content inside the pinned element, not
      // on the pin spacer around it: a pinned (fixed) element inside a scaled parent jumps the
      // moment the pin engages, and this way the page can scroll on while it comes forward.
      const nx = nextSection();
      const zoomEl = nx?.classList.contains("pin-spacer") ? nx.firstElementChild?.firstElementChild ?? nx : nx;
      if (!reduced) comeForward(zoomEl);
      playGrid();
    }
    /* Selected projects opens as one card that zooms out into the grid while you scroll through
       its pinned stretch. After See work that plays by itself: the page scrolls through the
       stretch for you. Any scroll, touch or key of your own takes over at once. */
    let autoScroll: gsap.core.Tween | null = null;
    const stopAutoScroll = () => {
      autoScroll?.kill();
      autoScroll = null;
    };
    function playGrid() {
      if (reduced) return;
      const from = window.scrollY;
      const pin = ScrollTrigger.getAll()
        .filter((st) => st.pin && st.end > from + 10)
        .sort((a, b) => a.start - b.start)[0];
      const to = pin ? pin.end - 2 : from + (window.innerHeight || 1) * 3;
      const pos = { y: from };
      stopAutoScroll();
      autoScroll = gsap.to(pos, {
        y: to,
        duration: 3.8,
        // while the work is still coming forward the scroll starts, slowly: one movement
        delay: 0.45,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, pos.y),
        onComplete: () => void (autoScroll = null),
      });
    }
    function toWork() {
      if (scene !== "a") return;
      scene = "toB";
      root.dataset.scene = "toB";
      hover(false);
      loadCard();
      tl?.kill();
      const aBlocks = q(".ph-a [data-fade]");
      tl = gsap.timeline();
      if (simple) {
        tl.to(root, { opacity: 0, duration: 0.3 }, 0).call(landOnWork, [], 0.3);
        return;
      }
      const s = land!.state;
      tl.to(aBlocks, { autoAlpha: 0, y: 20, filter: "blur(8px)", duration: 0.3, ease: "power2.in", stagger: 0.02 }, 0)
        .to(s, { warp: 1, duration: 0.9, ease: "power2.in" }, 0.1)
        .to(s, { travel: s.travel + 1.6, duration: 1.5, ease: "power2.in" }, 0.1)
        // at full speed the stars run out into black, and the work comes out of it
        .to(root, { opacity: 0, duration: 0.35, ease: "power1.in" }, 1.2)
        .call(landOnWork, [], 1.55);
    }
    /* ─── Let's connect: from the opening screen through space to another page. Returns false when
       there is no flight (reduced motion, no WebGL), so the link just works as a link. ─── */
    function flyTo(path: string) {
      if (scene !== "a" || simple) return false;
      scene = "toB";
      root.dataset.scene = "toB";
      hover(false);
      tl?.kill();
      const s = land!.state;
      const travel = openTravel(land!);
      // about three seconds: 1.1 into space, then the page comes out of the stars
      tl = gsap.timeline({ onUpdate: () => travel && Object.assign(travel.space.state, s) });
      tl.to(q(".ph-a [data-fade]"), { autoAlpha: 0, y: 20, filter: "blur(8px)", duration: 0.4, ease: "power2.in", stagger: 0.03 }, 0)
        .to(s, { warp: 0.75, duration: 1.0, ease: "power2.in" }, 0.1)
        .to(s, { travel: s.travel + 0.9, duration: 1.0, ease: "power2.in" }, 0.1)
        .call(() => (travel ? arriveAt(travel, () => goRef.current(path), 1.25) : navRef.current(path)), [], 1.1);
      return true;
    }
    api.current = { forward, hover, warpTo, toWork, flyTo };

    /* ─── Pointer: parallax in space, carbon trail on the emblem ─── */
    const ptr = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let paintUntil = 0;
    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      // with reduced motion the carbon only answers a click
      if (scene === "b") card?.setPointer(e.clientX, e.clientY, inkOk && (!reduced || performance.now() < paintUntil));
    };
    const onDown = (e: PointerEvent) => {
      paintUntil = performance.now() + 500;
      if (scene === "b") card?.setPointer(e.clientX, e.clientY, inkOk);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") card?.clearPointer();
    };
    const tick = () => {
      tickScrub();
      if (!land || offscreen) return;
      const s = land.state;
      s.mx += ((ptr.x / (window.innerWidth || 1) - 0.5) * 2 - s.mx) * 0.05;
      s.my += ((ptr.y / (window.innerHeight || 1) - 0.5) * 2 - s.my) * 0.05;
      if (!Number.isFinite(s.mx + s.my)) s.mx = s.my = 0;
    };
    gsap.ticker.add(tick);

    /* ─── Scroll, swipe and keys ───
       Down from the emblem is the page's own scroll. Up from the emblem, with the page at
       rest at the top, takes you back out to the universe. */
    const restingAtTop = () => window.scrollY <= 0 && performance.now() - topSince > 350;
    const onWheel = (e: WheelEvent) => {
      // scrolling through the space agent's conversation is not a flight
      if ((e.target as Element | null)?.closest?.(".ph-agent, .as")) return;
      stopAutoScroll();
      if (performance.now() < quietUntil) return;
      if (simple) {
        if (scene === "a" && e.deltaY > 6) forward();
        else if (scene === "b" && e.deltaY < -6 && restingAtTop()) back();
        return;
      }
      // the whole flight is about a screen and a quarter of wheel scrolling, so it plays calmly
      const d = e.deltaY / ((window.innerHeight || 1) * 1.25);
      if (scrubbing || scene === "a" || (scene === "b" && e.deltaY < 0 && restingAtTop())) scrubBy(d);
    };
    let touchY = 0;
    let touchAtTop = false;
    const onTouchStart = (e: TouchEvent) => {
      stopAutoScroll();
      touchY = lastTouchY = e.touches[0].clientY;
      touchAtTop = restingAtTop();
    };
    let lastTouchY = 0;
    const onTouchMove = (e: TouchEvent) => {
      if (simple) return;
      const y = e.touches[0].clientY;
      const d = (lastTouchY - y) / ((window.innerHeight || 1) * 0.4);
      lastTouchY = y;
      if (scrubbing || scene === "a" || (scene === "b" && d < 0 && touchAtTop && window.scrollY <= 0)) scrubBy(d);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!simple) return;
      const dy = e.changedTouches[0].clientY - touchY;
      if (scene === "a" && dy < -50) forward();
      else if (scene === "b" && dy > 70 && touchAtTop && window.scrollY <= 0) back();
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as Element | null)?.closest?.(".ph-agent, .as")) return; // typing a question
      stopAutoScroll();
      if (scene === "b" && window.scrollY > 0) return; // further down, the page has the keys
      const goBack = () => (simple ? back() : scrubTo(0));
      if (e.key === "Escape") return goBack();
      if ((e.target as HTMLElement).closest("a, button, input, textarea")) return;
      if ((scene === "a" || scrubbing) && (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")) {
        e.preventDefault();
        simple ? forward() : scrubTo(1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") goBack();
    };
    // nothing is drawn while the hero is scrolled out of view
    let offscreen = false;
    let away = false;
    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    // the section after the hero (selected projects); ScrollTrigger may have wrapped it in a pin-spacer
    const nextSection = () => root.parentElement?.nextElementSibling as HTMLElement | null;
    const onScroll = () => {
      // "resting at the top" starts when the page arrives there, however it got there
      if (window.scrollY > 0) away = true;
      else if (away) {
        away = false;
        topSince = performance.now();
      }
      if (scene !== "b") return;
      // scrolling on is a crossfade: the stars and the emblem fade out as they leave,
      // and selected projects fades in as it arrives
      const p = window.scrollY / (window.innerHeight || 1);
      root.style.opacity = String(1 - clamp01((p - 0.1) / 0.75));
      const nx = nextSection();
      if (nx) nx.style.opacity = p >= 1 ? "" : String(clamp01((p - 0.15) / 0.7));
      const off = p >= 1;
      if (off === offscreen) return;
      offscreen = off;
      if (off) {
        card?.stop();
        land?.stop();
      } else {
        card?.start();
        if (land && !reduced) land.start();
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ─── Coming back from a service page (the back button, the logo, a breadcrumb): you do not
       start over at the opening screen. You travel in through space and arrive at the emblem
       with its pills, where you left. ─── */
    let returning = false;
    try {
      returning = sessionStorage.getItem(RETURN_KEY) === "1";
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      /* no storage, no return trip */
    }
    if (returning) {
      const bFades = q(".ph-b [data-rise]");
      gsap.set(q(".ph-a [data-fade]"), { autoAlpha: 0 });
      scene = "toB";
      root.dataset.scene = "toB";
      loadCard();
      if (simple) {
        Object.assign(fx, { grow: 1, shrink: 0.7, morph: 1, spin: EMBLEM_SPIN_REST });
        if (land) {
          Object.assign(land.state, { warp: 0, planet: 0, fill: 0, room: 1 });
          land.renderOnce();
        }
        settle("b");
        showEmblem();
        inkOk = true;
        gsap.set(bFades, { autoAlpha: 1, y: 0 });
      } else {
        const s = land!.state;
        flightAtEnd();
        gsap.set(bFades, { autoAlpha: 0, y: 14 });
        Object.assign(fx, { grow: 0, shrink: 0.7, morph: 1, spin: EMBLEM_SPIN_REST });
        Object.assign(s, { warp: 1, planet: 0, fill: 0, room: 1 });
        gsap.set(cardEl, { opacity: 0 });
        tl = gsap.timeline({
          onUpdate: syncEmblem,
          onComplete: () => {
            settle("b");
            inkOk = true;
          },
        });
        showEmblem();
        // still at speed when the page opens; the stars slow down and the emblem comes out of the distance
        tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0)
          .to(s, { travel: s.travel + 1.3, duration: 2.0, ease: "power2.out" }, 0)
          .to(s, { warp: 0, duration: 1.7, ease: "power2.out" }, 0.15)
          .to(fx, { grow: 1, duration: 1.6, ease: "power3.out" }, 0.25)
          .to(bFades, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 }, 1.3);
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", layout);

    return () => {
      alive = false;
      window.clearTimeout(idle);
      tl?.kill();
      if (card) gsap.killTweensOf(card.state);
      stopAutoScroll();
      window.removeEventListener("scroll", onScroll);
      const nx = nextSection();
      if (nx) nx.style.opacity = "";
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      flight?.kill();
      glide?.kill();
      unlockLater?.kill();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", layout);
      lock(false);
      land?.destroy();
      card?.destroy();
    };
  }, []);

  return (
    <div ref={rootRef} className={`ph${noGl ? " ph--nogl" : ""}`} data-scene="a">
      <canvas ref={landRef} className="ph-land" aria-hidden="true" />
      {/* shown only while the flight is stopped halfway (the ph--paused class) */}
      <div className="ph-midhint" aria-hidden="true">
        <span>{t("hero.keepScrolling")}</span>
        <svg viewBox="0 0 24 40" fill="none">
          <path className="ph-midhint__line" d="M12 2v34" />
          <path className="ph-midhint__head" d="M7 31l5 5 5-5" />
        </svg>
      </div>

      {/* ─── Scene A: the universe ─── */}
      <section className="ph-a" aria-label={lang === "nl" ? "Introductie" : "Introduction"}>
        <div className="ph-frame" data-fade aria-hidden="true">
          {["tl", "tr", "bl", "br"].map((c) => (
            <svg key={c} className={`ph-frame__${c}`} viewBox="0 0 190 86" fill="none">
              <path d="M0 85.5H78c7 0 12-2 17-7L190 0.5" stroke={`url(#ph-frame-${c})`} />
              <defs>
                <linearGradient id={`ph-frame-${c}`} x1="0" y1="86" x2="190" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity="0.3" />
                  <stop offset="0.55" stopColor="#fff" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          ))}
        </div>
        {/* The scroll hint is written on the inner of the two orbits the space canvas draws
            (portalSpace.ts: 0.78 by 0.20 viewport heights, turned -0.32 rad, centred just below
            the middle), where it passes under the buttons in the middle of the screen. It lies
            on that line like an engraving and drifts a little along it. */}
        <svg className="ph-hint" data-fade viewBox="-1500 -500 3000 1000" aria-hidden="true">
          {/* units are thousandths of the viewport height, so the type is set at a real size
              and the letters are spaced evenly along the curve */}
          <path id="ph-hint-orbit" d="M -780 0 A 780 200 0 0 0 780 0" transform="translate(0 20) rotate(18.33)" fill="none" />
          <text>
            <textPath href="#ph-hint-orbit" startOffset="53%" textAnchor="middle">
              {t("hero.scrollHint")}
              <animate attributeName="startOffset" values="51%;55%;51%" dur="18s" repeatCount="indefinite" />
            </textPath>
          </text>
        </svg>
        <div className="ph-a__main">
          {/* Not a badge: a small wireframe Earth in the corner of the sky, a dot where the Netherlands
              is, and a thin line from it to the words. The words stay real text for readers and crawlers. */}
          {/* desktop only: an AI assistant on the right of the sky, answering from the site's own content */}
          <aside className="ph-agent" aria-label={t("agent.name")}>
            {/* GSAP owns the transform of the fading part, so the placing sits on the aside */}
            <div data-fade data-rise>
              <SpaceAgent />
            </div>
          </aside>
          <p className="ph-avail" data-fade data-rise>
            <AvailGlobe label={t("hero.globeLabel")} onOpen={openGlobe} />
            <span className="ph-avail__text">
              {t("menu.workIn")}
            </span>
          </p>
          <h1 className="ph-h1" data-fade>
            <span className="ph-mask">
              <span className="ph-line">{t("hero.title")}</span>
            </span>
            {/* part of the H1, as in the live hero: the line that says what DYSIGNS is */}
            <span className="ph-a__sub">{t("hero.headline.A")}</span>
          </h1>
          <div className="ph-actions" data-fade data-rise>
            <TransitionLink
              to="/contact"
              className="ph-btn ph-btn--solid"
              onClick={(e) => {
                // a new tab or window is left alone
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (api.current?.flyTo("/contact")) e.preventDefault();
              }}
            >
              {t("hero.cta2")}
            </TransitionLink>
            {/* a real link to the work page for crawlers and new tabs; a plain click flies to
                selected projects on this page instead */}
            <TransitionLink
              to="/work"
              className="ph-btn ph-btn--line"
              onClick={(e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                api.current?.toWork();
              }}
            >
              {t("hero.cta1")}
            </TransitionLink>
          </div>
        </div>

        {/* the same partners as the live hero (src/app/components/home/Partners.tsx) */}
        <aside className="ph-trust" aria-label={t("partners.label")} data-fade data-rise>
          <span className="ph-trust__label">{t("partners.label")}</span>
          <div className="ph-trust__mask">
            <div className="ph-trust__track">
              {[...PARTNERS, ...PARTNERS].map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-hidden={i >= PARTNERS.length ? true : undefined}
                  tabIndex={i >= PARTNERS.length ? -1 : undefined}
                  className={i >= PARTNERS.length ? "is-copy" : undefined}
                >
                  <img src={p.src} alt={p.name} draggable={false} />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* ─── Scene B: the emblem ─── */}
      <section className="ph-b" aria-label="DYSIGNS">
        <div className="ph-b__word" aria-hidden="true" data-rise>
          DYSIGNS
        </div>
        <canvas ref={cardCanvasRef} className="ph-card" aria-hidden="true" />
        {/* the way on: a small glass button with a thin arrow; a plain click scrolls on to the page */}
        <button
          type="button"
          className="ph-down"
          data-rise
          aria-label={t("hero.scrollDown")}
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 72" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <defs>
              <linearGradient id="ph-down-fade" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="66">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path className="ph-down__line" d="M12 2v64" stroke="url(#ph-down-fade)" />
            <path className="ph-down__spark" d="M12 2v64" pathLength="64" />
            <path className="ph-down__head" d="M6.5 60.5L12 66l5.5-5.5" />
          </svg>
        </button>
        <ul className="ph-chips" aria-label={lang === "nl" ? "Diensten" : "Services"}>
          {services.map((sv) => {
            const inner = (
              <>
                {sv.name}
                <span className="ph-chip__card" aria-hidden="true">
                  {sv.img && <img src={sv.img} alt="" loading="lazy" draggable={false} />}
                  <b>{sv.title}</b>
                  <span>{sv.text}</span>
                </span>
              </>
            );
            return (
              <li key={sv.label} data-rise>
                {sv.slug ? (
                  <TransitionLink
                    to={`/${sv.slug}`}
                    className="ph-chip"
                    aria-label={`${sv.name}: ${sv.title}`}
                    onClick={(e) => {
                      // a new tab or window is left alone
                      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      if (api.current?.warpTo(`/${sv.slug}`)) e.preventDefault();
                    }}
                  >
                    {inner}
                  </TransitionLink>
                ) : (
                  <a
                    href="#services"
                    className="ph-chip"
                    aria-label={`${sv.name}: ${sv.title}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (!api.current?.warpTo(null)) document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

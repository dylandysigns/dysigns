import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createSpace, type Space } from "./portalSpace";

/* ─── Travelling to another page ───
   The flight does not end in a fade. A second space canvas, on the same clock and in the same
   state as the hero's, is laid behind the page content. When the route changes the old page
   disappears and that canvas is simply what was already there: the same stars, still stretching.
   The new page is in it from the first moment, tiny and far ahead in the middle of the screen,
   and it is what you are flying towards: it grows until it fills the screen, the stars slow
   down, and the canvas lets go. The hero's "Let's connect" flight and every page change on the
   site use this same flight (see Layout.tsx). */
export type Travel = { space: Space; canvas: HTMLCanvasElement; main: HTMLElement };

export function arriveAt(travel: Travel, go: () => void, speed = 1, onDone?: () => void) {
  const { space, canvas, main } = travel;
  const from = window.location.pathname;
  const done = () => {
    space.stop();
    canvas.remove();
    gsap.set(main, { clearProps: "all" });
    onDone?.();
  };
  // As the site's own page transition does before it swaps a page: let ScrollTrigger put pinned
  // sections back where React expects them, or React cannot take the old page out.
  ScrollTrigger.getAll().forEach((st) => st.kill());
  go();
  const t0 = performance.now();
  const wait = () => {
    if (window.location.pathname === from) {
      if (performance.now() - t0 < 4000) requestAnimationFrame(wait);
      else done();
      return;
    }
    const s = space.state;
    // The page fades in out of the stars while it comes closer. Its edges are feathered away,
    // so it is never a hard rectangle in space: it is light that gathers into a page.
    const feather = "radial-gradient(ellipse at 50% 50vh, #000 calc(var(--ph-m) * 0.45), transparent var(--ph-m))";
    gsap.set(main, {
      transformOrigin: "50% 50vh",
      scale: 0.42,
      opacity: 0,
      "--ph-m": "34vmax",
      maskImage: feather,
      webkitMaskImage: feather,
    });
    gsap
      .timeline({ onComplete: done })
      .timeScale(speed)
      .to(main, { opacity: 1, duration: 1.7, ease: "sine.inOut" }, 0.1)
      .to(main, { scale: 1, duration: 2.3, ease: "power2.out" }, 0)
      .to(main, { "--ph-m": "170vmax", duration: 2.0, ease: "power1.in" }, 0.3)
      .to(s, { warp: 1, duration: 0.7, ease: "power1.in" }, 0)
      .to(s, { travel: s.travel + 2.2, duration: 2.4, ease: "power1.out" }, 0)
      .to(s, { warp: 0, duration: 1.3, ease: "sine.inOut" }, 0.9)
      .to(canvas, { opacity: 0, duration: 0.9, ease: "sine.inOut" }, 1.4);
  };
  requestAnimationFrame(wait);
}

/** From any page to any other: the page lets go, the stars stretch, the new page comes out of
 * them. `go` changes the route, `onDone` runs when the flight is over. Returns a function that
 * cancels it (for a stuck transition), or null when there is no flight (no WebGL): the caller
 * then falls back to its own transition. */
export function flightToPage(go: () => void, onDone: () => void): (() => void) | null {
  const main = document.querySelector<HTMLElement>("main");
  const host = main?.parentElement;
  if (!main || !host) return null;
  const canvas = document.createElement("canvas");
  canvas.className = "ph-travel";
  canvas.setAttribute("aria-hidden", "true");
  host.insertBefore(canvas, host.firstChild);
  const space = createSpace(canvas);
  if (!space) {
    canvas.remove();
    return null;
  }
  // the page content sits in front of the stars
  gsap.set(main, { position: "relative", zIndex: 1 });
  Object.assign(space.state, { room: 1, fill: 0, planet: 0, warp: 0 });
  space.start();
  const travel: Travel = { space, canvas, main };
  const tl = gsap.timeline();
  tl.to(main, { opacity: 0, duration: 0.5, ease: "power2.in" }, 0)
    .to(space.state, { warp: 0.75, duration: 1.0, ease: "power2.in" }, 0)
    .to(space.state, { travel: space.state.travel + 0.9, duration: 1.0, ease: "power2.in" }, 0)
    .call(() => arriveAt(travel, go, 1.25, onDone), [], 0.85);
  return () => {
    tl.kill();
    space.stop();
    canvas.remove();
    gsap.set(main, { clearProps: "all" });
  };
}

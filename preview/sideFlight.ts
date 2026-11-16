import gsap from "gsap";
import { createWarp } from "../src/app/components/SpaceWarp";

/* The flight to the right, from the globe scene to another page. Horizontal streaks of stars rush
   past to the left, as if we were flying off to the right, and the new page comes in from the right.
   Everything that runs across the page change is driven by plain frames and timers, never by GSAP
   tweens: the site's page change kills every GSAP tween (Layout.tsx), and that is what used to make
   the streaks stand still halfway. Even the end is not a stop: the stars keep drifting.

     go       changes the page (call it at the moment the screen is full of streaks)
     onSwap   the new page is there: the caller lets go of what covers it
     onDone   the flight is over */
export function flyRight(go: () => void, onSwap: () => void, onDone: () => void) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "9700",
    pointerEvents: "none",
    opacity: "1",
    transition: "opacity 0.7s ease",
  });
  document.body.appendChild(canvas);
  const warp = createWarp(canvas);
  if (!warp) {
    canvas.remove();
    go();
    onSwap();
    onDone();
    return;
  }
  warp.state.dir = 1;
  warp.state.speed = 0;
  warp.start();

  const RAMP = 650; // up to full speed (ms)
  const SLOW = 1100; // down to a drift (ms)
  const t0 = performance.now();
  let phase: "ramp" | "hold" | "slow" = "ramp";
  let tSlow = 0;
  let raf = 0;
  const from = window.location.pathname;
  let waited = 0;

  const easeIn = (p: number) => p * p * p;
  const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (phase === "ramp") {
      const p = Math.min(1, (now - t0) / RAMP);
      warp.state.speed = easeIn(p);
      if (p >= 1) {
        phase = "hold";
        waited = now;
        go();
      }
    } else if (phase === "hold") {
      warp.state.speed = 1;
      // wait for the new page (at most 3 s), then let the streaks slow down over it
      if (window.location.pathname !== from || now - waited > 3000) {
        phase = "slow";
        tSlow = now;
        onSwap();
        window.setTimeout(() => (canvas.style.opacity = "0"), SLOW * 0.55);
        window.setTimeout(() => {
          cancelAnimationFrame(raf);
          warp.destroy();
          canvas.remove();
          onDone();
        }, SLOW * 0.55 + 750);
      }
    } else {
      const p = Math.min(1, (now - tSlow) / SLOW);
      warp.state.speed = 1 - 0.97 * easeOut(p);
    }
  };
  raf = requestAnimationFrame(frame);
}

/** The page comes in from the right while the streaks slow down. Call right after the page changed. */
export function enterFromRight() {
  const main = document.querySelector<HTMLElement>("main");
  if (!main) return;
  gsap.fromTo(main, { x: "9vw", opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: "power3.out", clearProps: "transform,opacity" });
}

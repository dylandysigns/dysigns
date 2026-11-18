import gsap from "gsap";

export type Point = { x: number; y: number };

/* The camera move the hero's agent and globe open their scenes with (AgentScene.tsx, GlobeScene.tsx).
   One progress p, from 0 (the hero as it was) to 1 (the scene): the camera zooms in on the little
   thing in the hero and swings round towards it, so you see it in the distance, growing as you
   come closer, until it sits in its place in the scene.

   - `from`: the centre of the little thing in the hero, on screen.
   - `to`: the centre of the big one in the scene, on screen, untransformed.
   - `scale`: how big the little one is next to the big one (little / big).
   - `big`: the element of the big one; it is moved and scaled so that at every moment it sits
     exactly where the little one would be at that zoom (the same thing, only sharp).

   The path first runs inwards, level with where it started, then bends into its place. The hero is
   the world the camera moves through: it zooms and pans along (never so far that its edge shows)
   and fades, and the scene's sky fades in. Big and little cross-fade early in the move (late on the way
   back), while they are at the same spot and size and everything is moving, so there is no jump. */
export function createHeroCamera(opts: {
  from: Point;
  to: Point;
  scale: number;
  big: HTMLElement;
  sky?: HTMLElement | null;
  little?: HTMLElement | null;
  /** The world to fly through; the hero by default. `null`: nothing zooms along (the agent's
   *  fixed button on the other pages), the big one simply grows out of the little one. */
  hero?: HTMLElement | null;
}) {
  const { from: O, to: F, scale: s0, big, sky, little } = opts;
  const hero = opts.hero === undefined ? document.querySelector<HTMLElement>(".ph") : opts.hero;
  const hr = hero?.getBoundingClientRect();
  const zEnd = 1 / s0;
  const C = { x: F.x + (O.x - F.x) * 0.3, y: O.y };
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const cam = { p: 0 };

  if (hero) gsap.set(hero, { transformOrigin: "0 0" });
  gsap.set(big, { transformPerspective: 1100 });

  const apply = () => {
    const p = cam.p;
    const u = 1 - p;
    const T = { x: u * u * O.x + 2 * u * p * C.x + p * p * F.x, y: u * u * O.y + 2 * u * p * C.y + p * p * F.y };
    // the zoom gathers speed late, the way you close in on something far away
    const z = 1 + (zEnd - 1) * Math.pow(p, 1.6);
    // it turns in depth on the way, but only once the hand-over is done (below): flat (round) while it
    // still matches the little one, and flat again when it arrives
    const turn = Math.sin(Math.PI * clamp((p - 0.3) / 0.7, 0, 1));
    let pos = T;
    if (hero && hr) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // the hero always covers the screen: it may only move as far as its own zoom leaves room for,
      // or its edge would show as a black band at the side
      const hx = clamp(T.x - hr.left - z * (O.x - hr.left), vw - hr.left - z * hr.width, -hr.left);
      const hy = clamp(T.y - hr.top - z * (O.y - hr.top), vh - hr.top - z * hr.height, -hr.top);
      gsap.set(hero, { x: hx, y: hy, scale: z, opacity: 1 - clamp((p - 0.2) / 0.45, 0, 1) });
      // where the little one really is now, in the zoomed hero (the clamp may hold it back from the
      // curve): during the hand-over the big one sits exactly on it, then it follows the curve
      const L = { x: hr.left + hx + z * (O.x - hr.left), y: hr.top + hy + z * (O.y - hr.top) };
      const w = clamp((p - 0.3) / 0.35, 0, 1);
      const k = w * w * (3 - 2 * w);
      pos = { x: L.x + (T.x - L.x) * k, y: L.y + (T.y - L.y) * k };
    }
    gsap.set(big, { x: pos.x - F.x, y: pos.y - F.y, scale: s0 * z, rotationY: 22 * turn, rotationX: -6 * turn });
    // without a hero to fly through (the fixed button) there is nothing else moving at the start,
    // so the sky answers the click at once instead of waiting for the camera to get going
    if (sky) sky.style.opacity = String(hero ? clamp((p - 0.1) / 0.5, 0, 1) : clamp(p / 0.75, 0, 1));
    // the hand-over happens while everything moves, not at a standstill: early in the move the big one
    // fades in over the little one (which the hero's zoom keeps at exactly the same spot and size) and
    // the little one fades out; on the way back the other way round. Moving, the two never "switch".
    const hand = clamp((p - 0.03) / 0.3, 0, 1);
    gsap.set(big, { opacity: hand });
    if (little) little.style.opacity = String(1 - hand);
  };
  apply();

  /** The hero as it was, whatever happened (also when a link changed the page meanwhile). */
  const reset = () => {
    if (hero) gsap.set(hero, { clearProps: "transform,transformOrigin,opacity" });
    if (little) little.style.opacity = "";
  };

  return {
    cam,
    apply,
    reset,
    /** In: the camera move as a tween, to put on a timeline. */
    flyIn: (duration = 2.1, ease = "power2.inOut") => gsap.to(cam, { p: 1, duration, ease, onUpdate: apply }),
    /** Out: the same move backwards; by the end the little one has taken over again. */
    flyOut: (done: () => void, duration = 1.6) =>
      gsap.to(cam, {
        p: 0,
        duration,
        delay: 0.1,
        ease: "power2.inOut",
        onUpdate: apply,
        onComplete: () => {
          reset();
          done();
        },
      }),
  };
}

/* Watches how long frames really take while a scene runs, and steps its render scale down when the
   device does not keep up: an older laptop, a weak graphics chip, a big screen. A fast device never
   gets past the first step, so nothing changes there. It never steps back up, so it cannot swing to
   and fro. The scenes it is used in are soft (stars, a meadow, light), so fewer pixels mostly reads
   as the same picture; the sharp text and buttons are HTML on top.

   Used by portalLandscape.ts, portalSpace.ts and portalEmblem.ts. */

const WINDOW = 45; // frames per verdict
const SLOW_MS = 24; // average frame time above this (under ~42 fps) counts as not keeping up
const SETTLE = 15; // frames ignored after a start or a step: shader compiles, a resize, a page load

export type FrameBudget = {
  /** The current render scale, 1 at the start. */
  readonly scale: number;
  /** Call once per drawn frame. */
  tick: () => void;
  /** Call when the loop starts again after a stop, so the pause does not count as a slow frame. */
  restart: () => void;
};

export function createFrameBudget(onStep: (scale: number) => void, steps: number[] = [1, 0.7, 0.5]): FrameBudget {
  let level = 0;
  let last = 0;
  let skip = SETTLE;
  let n = 0;
  let sum = 0;
  return {
    get scale() {
      return steps[level];
    },
    tick() {
      const now = performance.now();
      const dt = last ? now - last : 0;
      last = now;
      // a long gap is a pause (a background tab, a stop and start), not a slow frame
      if (!dt || dt > 250) return;
      if (skip > 0) {
        skip--;
        return;
      }
      sum += dt;
      if (++n < WINDOW) return;
      const avg = sum / n;
      n = 0;
      sum = 0;
      if (avg > SLOW_MS && level < steps.length - 1) {
        level++;
        skip = SETTLE;
        onStep(steps[level]);
      }
    },
    restart() {
      last = 0;
      skip = SETTLE;
      n = 0;
      sum = 0;
    },
  };
}

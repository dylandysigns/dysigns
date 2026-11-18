import { useEffect, useRef, type MutableRefObject } from "react";

/* The DYSIGNS agent's face: a sphere of fine dots, like a voice made visible, in the monochrome of
   the globe next to it (AvailGlobe.tsx). The dots sit on a sphere whose surface is pushed in and
   out by slow waves; seen from the front it is mostly empty, and the dots gather into a bright,
   ragged ring along its edge.

   It listens to the chat through `signal` (a ref, so it never re-renders anything). Every change
   of behaviour is eased and every motion runs on its own accumulated phase, so nothing jumps:
   - idle: it breathes slowly and turns.
   - hover: it opens up a little, brighter, its waves a bit livelier.
   - click (`pulse`): one soft wave runs out from the front over the whole surface.
   - thinking: it draws in, twists slowly around its axis and a band of light glides over it.
   - speaking: while the answer is written it swells and settles in a calm rhythm.
   - the pointer: like the carbon on the 3D emblem, it leaves something behind. Where it passes,
     the dots take on colour (blue, violet, coral, the hues of a voice cloud) and swell a little;
     the colour turns with the sphere and slowly fades back to white.
   - rush (0..1): set while the camera flies into it, it spins and its waves run faster.
   There is no microphone, and typing itself does not move it.
   With reduced motion it is drawn once and stands still. */

export type OrbMode = "idle" | "thinking" | "speaking";
/* The motion state lives in the signal, not in the canvas: the little orb in the hero and the big one
   in its scene share one signal, so they are always in the very same pose. Whichever draws first in a
   frame moves the clock on; the other reads it. That makes the hand-over between them invisible. */
type OrbClock = {
  t: number; // time of the last step, ms
  mix: { think: number; speak: number; hover: number; wave: number };
  ph: { yaw: number; flow: number; twist: number; scan: number; voice: number };
  waveAge: number;
  lastPulse: number;
};
export type OrbSignal = { mode: OrbMode; hover: boolean; pulse: number; rush: number; clock: OrbClock };
export const createOrbSignal = (): OrbSignal => ({
  mode: "idle",
  hover: false,
  pulse: 0,
  rush: 0,
  clock: {
    t: 0,
    mix: { think: 0, speak: 0, hover: 0, wave: 0 },
    ph: { yaw: 0, flow: 0, twist: 0, scan: 0, voice: 0 },
    waveAge: 9,
    lastPulse: 0,
  },
});

const DENSE = 3600; // dots, the same in every orb, so a big one scaled down looks like a little one
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export function AgentOrb({
  signal,
  className,
  fps = 60,
  dots = DENSE,
  paused = false,
}: {
  signal: MutableRefObject<OrbSignal>;
  className?: string;
  fps?: number;
  dots?: number;
  /** Stop drawing while it cannot be seen (faded out). Off screen it stops on its own. */
  paused?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  // the loop's own "start again if it may", set by the effect below
  const wake = useRef<() => void>(() => {});
  useEffect(() => wake.current(), [paused]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = dots;

    // points evenly over a sphere (a Fibonacci spiral), each with a little jitter of its own
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const pz = new Float32Array(N);
    const seed = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * GOLDEN;
      px[i] = Math.cos(a) * r;
      py[i] = y;
      pz[i] = Math.sin(a) * r;
      // the same for every orb (not random), so all orbs have their loose dots in the same places
      const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      seed[i] = h - Math.floor(h);
    }

    let S = 0;
    const size = () => {
      S = canvas.clientWidth || 160;
      canvas.width = Math.round(S * dpr);
      canvas.height = Math.round(S * dpr);
    };
    size();
    const ro = new ResizeObserver(() => {
      size();
      if (reduced) draw(0, 0);
    });
    ro.observe(canvas);

    // a round, soft dot, drawn once and stamped for every point (two tints: in front and behind)
    const sprite = (r: number, g: number, b: number) => {
      const c = document.createElement("canvas");
      c.width = c.height = 32;
      const x = c.getContext("2d")!;
      const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      grad.addColorStop(0.45, `rgba(${r},${g},${b},0.95)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      x.fillStyle = grad;
      x.fillRect(0, 0, 32, 32);
      return c;
    };
    const dotFront = sprite(230, 238, 255);
    const dotBack = sprite(196, 212, 255);
    // the ink: a gradient from cool blue at the top to warm coral at the bottom, as dots
    const INK = [
      [96, 170, 255],
      [132, 120, 255],
      [196, 96, 230],
      [244, 92, 150],
      [255, 128, 104],
      [255, 176, 96],
    ];
    const INK_STEPS = 24;
    const inkDots = Array.from({ length: INK_STEPS }, (_, k) => {
      const f = (k / (INK_STEPS - 1)) * (INK.length - 1);
      const i0 = Math.floor(f);
      const i1 = Math.min(INK.length - 1, i0 + 1);
      const m = f - i0;
      const c = INK[i0].map((v, j) => Math.round(v + (INK[i1][j] - v) * m));
      return sprite(c[0], c[1], c[2]);
    });
    const ink = new Float32Array(N);
    const inkTone = new Uint8Array(N);
    for (let i = 0; i < N; i++) inkTone[i] = Math.min(INK_STEPS - 1, Math.max(0, Math.round(((1 - py[i]) / 2) * (INK_STEPS - 1) + (seed[i] - 0.5) * 4)));

    // where the pointer is over the canvas, in CSS pixels (null: not over it)
    let pointer: { x: number; y: number } | null = null;
    let pointerSpeed = 0;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const k = S / (r.width || 1);
      const p = { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k };
      if (pointer) pointerSpeed = Math.min(1, pointerSpeed + Math.hypot(p.x - pointer.x, p.y - pointer.y) / (S * 0.08));
      pointer = p;
    };
    const onLeave = () => void (pointer = null);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    const draw = (t: number, dt: number) => {
      const sig = signal.current;
      const clock = sig.clock;
      // smoothed amounts of each behaviour (so one flows into the next) and phases that only ever move
      // forward at a speed that may change (no jumps when it does): stepped once per frame, shared
      const { mix, ph } = clock;
      const step = clock.t ? Math.min(0.1, Math.max(0, (t - clock.t) / 1000)) : dt;
      if (t > clock.t) {
        clock.t = t;
        const ease = 1 - Math.exp(-step * 2.2);
        mix.think += ((sig.mode === "thinking" ? 1 : 0) - mix.think) * ease;
        mix.speak += ((sig.mode === "speaking" ? 1 : 0) - mix.speak) * ease;
        mix.hover += ((sig.hover ? 1 : 0) - mix.hover) * (1 - Math.exp(-step * 4));
        if (sig.pulse !== clock.lastPulse) {
          clock.lastPulse = sig.pulse;
          clock.waveAge = 0;
          mix.wave = 1;
        }
        clock.waveAge += step;
        mix.wave *= Math.exp(-step * 1.1);
        ph.yaw += step * (0.16 + 0.35 * mix.think + 0.12 * mix.hover + 2.4 * sig.rush);
        ph.flow += step * (0.45 + 0.35 * mix.hover + 0.5 * mix.think + 0.45 * mix.speak + 1.6 * sig.rush);
        ph.twist += step * 0.7;
        ph.scan += step * 1.05;
        ph.voice += step * 2.1;
      }
      const waveAge = clock.waveAge;

      const s = t / 1000;
      // the colour fades back slowly; the brush paints harder the faster the pointer moves
      const inkFade = Math.exp(-dt * 0.3);
      const brush = S * 0.17;
      const paint = pointer ? dt * (3.5 + 16 * pointerSpeed) : 0;
      pointerSpeed *= Math.exp(-dt * 5);
      const cy = Math.cos(ph.yaw);
      const sy = Math.sin(ph.yaw);
      const tilt = 0.32 + 0.1 * Math.sin(s * 0.3);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);

      // speaking: a calm swell and settle, like a voice in long sentences
      const swell = mix.speak * (0.5 + 0.5 * Math.sin(ph.voice));
      const amp = 0.075 + 0.03 * mix.hover + 0.035 * swell + 0.015 * mix.think;
      const radius =
        S * 0.36 * (1 + 0.02 * Math.sin(s * 0.9) + 0.045 * mix.hover - 0.06 * mix.think + 0.04 * swell + 0.03 * mix.wave);
      const cx = S / 2;
      const cyy = S / 2;
      const flow = ph.flow;
      const scan = Math.sin(ph.scan) * 1.05; // the band of light while thinking, -1..1
      const twist = mix.think * 0.75 * Math.sin(ph.twist);
      const waveFront = waveAge * 1.9; // radians from the front, for the click wave

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);

      // a faint glow behind it
      const g = ctx.createRadialGradient(cx, cyy, radius * 0.2, cx, cyy, radius * 1.45);
      g.addColorStop(0, `rgba(180,205,255,${(0.05 + 0.04 * mix.hover + 0.05 * mix.think + 0.05 * swell).toFixed(3)})`);
      g.addColorStop(1, "rgba(180,205,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, S, S);

      // dots in proportion to the orb, so every orb is the same picture at a different size
      // (with a floor, so the little orb on a phone still has dots you can see)
      const unit = Math.max(S / 240, 0.5);
      for (let i = 0; i < N; i++) {
        let x = px[i];
        const y = py[i];
        let z = pz[i];
        // thinking: the sphere twists slowly around its axis, more towards the poles
        if (twist !== 0) {
          const a = twist * y;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const nx = x * ca - z * sa;
          z = x * sa + z * ca;
          x = nx;
        }
        // the surface: slow waves pushing it in and out
        let d =
          Math.sin(x * 3.1 + flow) * Math.cos(y * 2.7 - flow * 0.8) +
          0.6 * Math.sin(z * 3.7 + flow * 1.3 + y * 1.5) +
          0.35 * Math.sin((x + y + z) * 6 - flow * 1.9);
        d *= amp;
        // click: one soft wave running out from the front
        if (mix.wave > 0.01) {
          const front = Math.acos(Math.max(-1, Math.min(1, z * cy + x * sy)));
          d += 0.11 * mix.wave * Math.exp(-Math.pow((front - waveFront) * 2.4, 2));
        }
        // a few loose dots drift off the surface, like the ragged edge in a voice cloud
        const loose = seed[i] > 0.88 ? (0.04 + 0.1 * (seed[i] - 0.88) * 8) * (0.5 + 0.5 * Math.sin(s * 0.9 + seed[i] * 40)) : 0;
        ink[i] *= inkFade;
        const r = 1 + d + loose + 0.05 * ink[i];

        // turn and tilt
        const rx = (x * cy - z * sy) * r;
        const rz0 = (x * sy + z * cy) * r;
        const ry = y * r * ct - rz0 * st;
        const rz = y * r * st + rz0 * ct;
        const sx = cx + rx * radius;
        const syy = cyy - ry * radius;
        // the brush: only the side that faces you takes the colour
        if (paint && rz > -0.35) {
          const dist = Math.hypot(sx - pointer!.x, syy - pointer!.y);
          if (dist < brush) ink[i] = Math.min(1, ink[i] + paint * (1 - dist / brush));
        }

        // bright along the edge, faint in the middle, a little brighter in front than behind
        const rim = 1 - Math.abs(rz) / Math.max(0.0001, r);
        let a = 0.1 + 0.95 * Math.pow(rim, 2.2) + (rz > 0 ? 0.2 * rz : 0) + 0.15 * mix.hover * rim + 0.2 * swell * rim;
        if (mix.think > 0.01) a += mix.think * 0.7 * Math.exp(-Math.pow((ry - scan) * 2.2, 2));
        a *= 0.9 + 0.1 * Math.sin(s * 0.7 + seed[i] * 30);
        if (a < 0.03 && ink[i] < 0.02) continue;
        const sz = (1.1 + 1.1 * Math.pow(rim, 2)) * unit;
        const inked = ink[i];
        if (inked > 0.02) {
          // coloured dots are lit a little more, so the colour reads even in the empty middle
          const ia = Math.min(1, a + 0.75 * inked);
          const isz = sz * (1 + 0.7 * inked);
          ctx.globalAlpha = ia * (1 - inked);
          ctx.drawImage(rz > 0 ? dotFront : dotBack, sx - sz / 2, syy - sz / 2, sz, sz);
          ctx.globalAlpha = ia * Math.min(1, inked * 1.8);
          ctx.drawImage(inkDots[inkTone[i]], sx - isz / 2, syy - isz / 2, isz, isz);
        } else {
          ctx.globalAlpha = Math.min(1, a);
          ctx.drawImage(rz > 0 ? dotFront : dotBack, sx - sz / 2, syy - sz / 2, sz, sz);
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let alive = true;
    let last = 0;
    let prev = 0;
    // Nothing to see, nothing to draw: off screen or paused, the loop stops, and it picks up again
    // where the shared clock is (the step after a pause is capped, so it does not jump).
    let onScreen = true;
    const frame = (t: number) => {
      raf = 0;
      if (!alive || !onScreen || pausedRef.current) {
        prev = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
      if (t - last < 1000 / fps - 2) return;
      last = t;
      const dt = prev ? Math.min(0.1, (t - prev) / 1000) : 0.016;
      prev = t;
      draw(t, dt);
    };
    wake.current = () => {
      if (alive && !reduced && !raf && onScreen && !pausedRef.current) raf = requestAnimationFrame(frame);
    };
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            wake.current();
          });
    io?.observe(canvas);
    if (reduced) draw(0, 0);
    else wake.current();
    return () => {
      alive = false;
      wake.current = () => {};
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

/* The sideways flight between pages: a field of stars that stretch into streaks and rush past to
   one side, as if the whole site were a place you fly through. Drawn on a 2D canvas inside the
   transition overlay (Layout.tsx), only while a transition runs. `dir` is +1 when you travel to
   the right (the stars race to the left) and -1 the other way; `speed` goes from 0 (calm sky)
   to 1 (full streaks). */

export type Warp = {
  state: { speed: number; dir: 1 | -1 };
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

type Star = { x: number; y: number; z: number };

/** `length`: how long the streaks get at full speed (default 300), `alpha`: how bright (1), `count`: how many stars */
export function createWarp(canvas: HTMLCanvasElement, opts: { length?: number; alpha?: number; count?: number } = {}): Warp | null {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const state: Warp["state"] = { speed: 0, dir: 1 };
  const stars: Star[] = [];
  let W = 0;
  let H = 0;
  let raf = 0;
  let last = 0;
  let running = false;

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!stars.length) {
      const n = opts.count ?? (W < 700 ? 150 : 260);
      for (let i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, z: 0.15 + Math.random() * 0.85 });
    }
  };

  const frame = (t: number) => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - (last || t)) / 1000);
    last = t;
    ctx.clearRect(0, 0, W, H);
    const sp = state.speed;
    for (const s of stars) {
      // near stars (large z) move faster and leave longer streaks: that is the depth
      const v = (30 + sp * sp * 2200) * s.z;
      s.x -= state.dir * v * dt;
      if (s.x < -300) s.x += W + 600;
      else if (s.x > W + 300) s.x -= W + 600;
      const len = 1 + sp * sp * (opts.length ?? 300) * s.z * s.z;
      const a = Math.min(1, 0.28 + 0.6 * s.z) * (0.55 + 0.45 * sp) * (opts.alpha ?? 1);
      const tail = s.x + state.dir * len;
      const g = ctx.createLinearGradient(s.x, 0, tail, 0);
      g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 0.6 + 1.1 * s.z;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tail, s.y);
      ctx.stroke();
    }
  };

  return {
    state,
    start() {
      if (running) return;
      size();
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, W, H);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}

import { SEND } from "./sendAnimation";

/* The message as a signal: a glowing orb that is alive. It is not moved along a drawn path: it is
   simulated. In the open it floats and wanders on its own, pulled gently back to where it was born,
   sending out slow rings like a signal. When it is sent it is not slid to a place either: it steers
   towards the Earth, swooping in a curve with a wiggle of its own, picks up speed, leaves sparks and a
   thin line behind it, and goes in. Everything is drawn on one canvas by plain frames, so nothing
   else on the page can stop it. */

export type SignalOrb = {
  /** where the orb is now, on the screen */
  pos: { x: number; y: number };
  /** the radius it grows or shrinks to, with a spring */
  setRadius: (r: number, soft?: boolean) => void;
  /** steer to a target (which may move) and call `arrive` when it is there; takes about `seconds` */
  seek: (target: () => { x: number; y: number }, seconds: number, arrive: () => void) => void;
  /** a ring of light now: the signal answering or being sent */
  ring: () => void;
  /** a burst of sparks at a place */
  burst: (x: number, y: number, n: number) => void;
  /** the envelope's flap: open for the fields, closed when it is full (a spring, so it has a little bounce) */
  setOpen: (open: boolean) => void;
  /** gone into the Earth: it follows the target while it shrinks and fades, so nothing stops or jumps */
  absorb: (target: () => { x: number; y: number }) => void;
  /** dissolve and remove */
  fadeOut: () => void;
  destroy: () => void;
};

type Ring = { t0: number; x: number; y: number; r: number };
type Spark = { x: number; y: number; vx: number; vy: number; born: number; life: number; size: number };

export function createSignalOrb(x: number, y: number): SignalOrb {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "9000", pointerEvents: "none" });
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  let W = 0;
  let H = 0;
  const size = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };
  size();
  window.addEventListener("resize", size);

  const home = { x, y };
  const pos = { x, y };
  const vel = { x: 0, y: 0 };
  let r = 0; // radius now
  let rv = 0; // and how fast it changes (a spring, so growing has a little give)
  let rTarget = 0;
  let rK = 220; // how stiff the radius spring is
  let rZ = 0.55; // and how damped: low is bouncy (growing), 1 is smooth with no overshoot (shrinking)
  let open = 1; // the flap of the envelope: 1 open, 0 closed
  let ov = 0;
  let openTarget = 1;
  let ang = 0; // the envelope leans towards where it is going
  let blend = 0; // 0 floating, 1 steering: the one runs over into the other, so the velocity never jumps
  let absorbTarget: (() => { x: number; y: number }) | null = null;
  const ph = [0, 1, 2, 3, 4, 5].map(() => Math.random() * Math.PI * 2);
  const trail: { x: number; y: number }[] = [];
  const rings: Ring[] = [];
  const sparks: Spark[] = [];
  let lastRing = 0;
  let alive = true;
  let fading = 0; // 0 normal, 1 fading out
  let alpha = 1;
  let raf = 0;
  let last = performance.now();

  let seekTarget: (() => { x: number; y: number }) | null = null;
  let seekStart = 0;
  let seekSecs = 1;
  let seekDist0 = 1;
  let seekArrive: (() => void) | null = null;

  const frame = (now: number) => {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    const real = Math.min(0.3, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    // the motion is simulated in small steps, so that it takes the same time on a slow screen as on a quick one
    const step = (dt: number) => {
      // the flap: a spring with a bounce when it shuts
      ov += ((openTarget - open) * 260 - ov * 2 * Math.sqrt(260) * 0.45) * dt;
      open += ov * dt;
      // the radius: a spring; bouncy when it grows, smooth when it shrinks
      rv += ((rTarget - r) * rK - rv * 2 * Math.sqrt(rK) * rZ) * dt;
      r = Math.max(0, r + rv * dt);

      if (absorbTarget) {
        // in the Earth: it follows the point where it went in, easing onto it
        const T = absorbTarget();
        const k = 1 - Math.exp(-dt * 16);
        pos.x += (T.x - pos.x) * k;
        pos.y += (T.y - pos.y) * k;
        vel.x *= 1 - 6 * dt;
        vel.y *= 1 - 6 * dt;
        return;
      }

      const t = performance.now() / 1000;
      // free: wanders on slow curves, drawn back gently to where it was born
      const A = SEND.floatPx * 5;
      const wx = Math.sin(t * 0.8 + ph[1]) + 0.6 * Math.sin(t * 1.9 + ph[2]);
      const wy = Math.cos(t * 0.65 + ph[3]) + 0.6 * Math.sin(t * 1.6 + ph[4]);
      const wf = 1 - blend; // how much of the floating is left
      vel.x += ((home.x - pos.x) * 1.3 + wx * A) * wf * dt;
      vel.y += ((home.y - pos.y) * 1.3 + wy * A) * wf * dt;

      if (seekTarget) {
        // sent: it takes over from the floating by degrees, steering to the target, swooping, with a wiggle of its own
        blend = Math.min(1, blend + dt / 0.9);
        const e = blend * blend * (3 - 2 * blend); // smooth, so the hand-over has no corner
        const T = seekTarget();
        const dx = T.x - pos.x;
        const dy = T.y - pos.y;
        const dist = Math.hypot(dx, dy) || 1;
        const u = Math.min(1, (performance.now() - seekStart) / 1000 / seekSecs);
        // it picks up speed on the way, and eases off when it is close, so it flies in instead of circling round the target
        const speed = (seekDist0 / seekSecs) * (0.25 + 1.9 * u * u) * (0.3 + 0.7 * Math.min(1, dist / 180));
        const nx = -dy / dist;
        const ny = dx / dist;
        const wig = Math.sin(t * 4.6 + ph[0]) * 130 * SEND.bounce * Math.min(1, dist / 260) * (1 - 0.5 * u);
        const wantX = (dx / dist) * speed + nx * wig;
        const wantY = (dy / dist) * speed + ny * wig;
        // the steering is limited in strength and weighed by the hand-over, so the velocity changes smoothly
        let sx = (wantX - vel.x) * e;
        let sy = (wantY - vel.y) * e;
        const lim = 5200 * e * dt;
        const sm = Math.hypot(sx, sy);
        if (sm > lim) {
          sx = (sx / sm) * lim;
          sy = (sy / sm) * lim;
        }
        vel.x += sx;
        vel.y += sy;
        if (dist < 22 + r && u > 0.25) {
          const done = seekArrive;
          seekTarget = null;
          seekArrive = null;
          done?.();
        }
      }
      // the floating has some drag; while steering it lets go of it
      const drag = 1.1 * (1 - blend);
      vel.x *= Math.max(0, 1 - drag * dt);
      vel.y *= Math.max(0, 1 - drag * dt);
      pos.x += vel.x * dt;
      pos.y += vel.y * dt;
    };
    for (let rem = real; rem > 0; ) {
      const h = Math.min(rem, 1 / 90);
      step(h);
      rem -= h;
    }
    const dt = real;
    const speedNow = Math.hypot(vel.x, vel.y);

    // the line behind it
    trail.push({ x: pos.x, y: pos.y });
    if (trail.length > 46) trail.shift();
    // rings: slow while it floats, quick when it is on its way
    const ringEvery = 1300 - 920 * blend;
    if (r > 2 && now - lastRing > ringEvery) {
      lastRing = now;
      rings.push({ t0: now, x: pos.x, y: pos.y, r });
    }

    if (import.meta.env.DEV) canvas.dataset.orb = `${Math.round(pos.x)},${Math.round(pos.y)},${Math.round(r)},${Math.round(speedNow)}`; // for looking at it while building
    // ── drawing ──
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (fading) {
      alpha = Math.max(0, alpha - dt * 2.2);
      if (alpha <= 0 && sparks.length === 0) return destroy();
    }
    ctx.globalAlpha = alpha;

    // the line behind it: one thin clean line, like the lines of the hero, fading out towards the tail
    const tk = SEND.trail;
    if (tk > 0.01 && trail.length > 4 && speedNow > 60) {
      const n = trail.length;
      const g = ctx.createLinearGradient(trail[0].x, trail[0].y, trail[n - 1].x, trail[n - 1].y);
      g.addColorStop(0, "rgba(255,255,255,0)");
      g.addColorStop(1, `rgba(255,255,255,${(0.8 * tk * Math.min(1, speedNow / 400)).toFixed(3)})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(trail[i].x, trail[i].y, (trail[i].x + trail[i + 1].x) / 2, (trail[i].y + trail[i + 1].y) / 2);
      ctx.lineTo(trail[n - 1].x, trail[n - 1].y);
      ctx.stroke();
    }
    // sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      const a = 1 - (now - s.born) / s.life;
      if (a <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      ctx.fillStyle = `rgba(225,238,255,${(0.8 * a * a).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * (0.4 + a), 0, Math.PI * 2);
      ctx.fill();
    }
    // rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const g = rings[i];
      const age = (now - g.t0) / 1500;
      if (age >= 1) {
        rings.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(205,226,255,${(0.34 * (1 - age) * (1 - age)).toFixed(3)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r * (1.2 + 4.6 * age), 0, Math.PI * 2);
      ctx.stroke();
    }
    if (r > 0.5) {
      const pulse = 1 + SEND.ballBreathe * Math.sin(t * 3.4) + SEND.ballBreathe * 0.5 * Math.sin(t * 5.7 + 1);
      const R = r * pulse;
      const glow = ctx.createRadialGradient(pos.x, pos.y, R * 0.3, pos.x, pos.y, R * 3.4);
      glow.addColorStop(0, "rgba(200,225,255,0.3)");
      glow.addColorStop(0.4, "rgba(170,205,255,0.1)");
      glow.addColorStop(1, "rgba(170,205,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, R * 3.4, 0, Math.PI * 2);
      ctx.fill();
      if (SEND.envelope > 0.5) {
        // an envelope: its flap is open for the fields, shuts when it is full, and it leans towards where it is going
        const sp = Math.hypot(vel.x, vel.y);
        const want = sp > 90 ? Math.max(-0.7, Math.min(0.7, Math.atan2(vel.y, Math.abs(vel.x) + 1) * 0.55)) : Math.sin(t * 1.3 + ph[5]) * 0.08;
        ang += (want - ang) * Math.min(1, dt * 5);
        const w = R * 2.6;
        const h = R * 1.75;
        const x0 = -w / 2;
        const y0 = -h / 2;
        const o = Math.max(-0.15, Math.min(1.1, open));
        const flapH = h * 0.62;
        const tipY = y0 + flapH * (1 - 2 * o); // open: up above the top edge; closed: down over the front
        const vY = y0 + h * 0.5; // where the folds of the pocket meet
        const rr = h * 0.1;
        const lw = Math.max(0.6, R * 0.035);
        // a clean white paper envelope: soft shading instead of outlines
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(ang);
        const body = () => {
          ctx.beginPath();
          ctx.moveTo(x0 + rr, y0);
          ctx.lineTo(x0 + w - rr, y0);
          ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rr);
          ctx.lineTo(x0 + w, y0 + h - rr);
          ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - rr, y0 + h);
          ctx.lineTo(x0 + rr, y0 + h);
          ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - rr);
          ctx.lineTo(x0, y0 + rr);
          ctx.quadraticCurveTo(x0, y0, x0 + rr, y0);
          ctx.closePath();
        };
        const flapPath = () => {
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(0, tipY);
          ctx.lineTo(x0 + w, y0);
          ctx.closePath();
        };
        // the flap, open: behind the pocket, its paper a little darker
        if (o > 0.5) {
          ctx.save();
          flapPath();
          const fg = ctx.createLinearGradient(0, y0, 0, tipY);
          fg.addColorStop(0, "#dfe6f3");
          fg.addColorStop(1, "#f4f7fc");
          ctx.fillStyle = fg;
          ctx.fill();
          ctx.restore();
        }
        ctx.save();
        body();
        ctx.clip();
        // the inside of the pocket
        const ig = ctx.createLinearGradient(0, y0, 0, y0 + h);
        ig.addColorStop(0, "#b9c6e0");
        ig.addColorStop(1, "#e3e9f5");
        ctx.fillStyle = ig;
        ctx.fillRect(x0, y0, w, h);
        // the front of the pocket: white, the top edge a V
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(0, vY);
        ctx.lineTo(x0 + w, y0);
        ctx.lineTo(x0 + w, y0 + h);
        ctx.lineTo(x0, y0 + h);
        ctx.closePath();
        const pg = ctx.createLinearGradient(0, y0, 0, y0 + h);
        pg.addColorStop(0, "#ffffff");
        pg.addColorStop(1, "#e9eef8");
        ctx.fillStyle = pg;
        ctx.fill();
        // the two side folds and the bottom one, shaded softly
        ctx.fillStyle = "rgba(150,168,205,0.16)";
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(0, vY);
        ctx.lineTo(x0, y0 + h);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x0 + w, y0);
        ctx.lineTo(0, vY);
        ctx.lineTo(x0 + w, y0 + h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(140,158,196,0.4)";
        ctx.lineWidth = lw;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x0, y0 + h);
        ctx.lineTo(0, vY);
        ctx.lineTo(x0 + w, y0 + h);
        ctx.stroke();
        ctx.restore();
        // the flap, shut: over the front, with a soft shadow under it
        if (o <= 0.5) {
          ctx.save();
          flapPath();
          ctx.shadowColor = "rgba(40,55,95,0.38)";
          ctx.shadowBlur = R * 0.3;
          ctx.shadowOffsetY = R * 0.09;
          const fg = ctx.createLinearGradient(0, y0, 0, tipY);
          fg.addColorStop(0, "#f2f5fb");
          fg.addColorStop(1, "#ffffff");
          ctx.fillStyle = fg;
          ctx.fill();
          ctx.restore();
          // a faint highlight along its edge
          flapPath();
          ctx.strokeStyle = "rgba(160,176,210,0.35)";
          ctx.lineWidth = lw;
          ctx.lineJoin = "round";
          ctx.stroke();
        }
        ctx.restore();
      } else {
        // the orb: a bright core, breathing slowly
        const core = ctx.createRadialGradient(pos.x - R * 0.25, pos.y - R * 0.3, R * 0.05, pos.x, pos.y, R);
        core.addColorStop(0, "rgba(255,255,255,1)");
        core.addColorStop(0.6, "rgba(238,246,255,0.98)");
        core.addColorStop(1, "rgba(190,214,255,0.9)");
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  const destroy = () => {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", size);
    canvas.remove();
  };
  raf = requestAnimationFrame(frame);

  return {
    pos,
    setRadius(v, soft) {
      rTarget = v;
      rK = soft ? 34 : 220;
      rZ = soft ? 1 : 0.55;
    },
    seek(target, seconds, arrive) {
      seekTarget = target;
      seekArrive = arrive;
      seekStart = performance.now();
      seekSecs = Math.max(0.3, seconds);
      const T = target();
      seekDist0 = Math.hypot(T.x - pos.x, T.y - pos.y) || 1;
      blend = 0; // it keeps the velocity it has: no kick, the steering takes over gradually
    },
    setOpen(v) {
      openTarget = v ? 1 : 0;
    },
    ring() {
      rings.push({ t0: performance.now(), x: pos.x, y: pos.y, r: Math.max(6, r) });
    },
    burst(bx, by, n) {
      const now = performance.now();
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * 160;
        sparks.push({ x: bx, y: by, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, born: now, life: 600 + Math.random() * 600, size: 0.8 + Math.random() * 1.6 });
      }
    },
    absorb(target) {
      absorbTarget = target;
      seekTarget = null;
      rTarget = 0;
      rK = 40;
      rZ = 1;
      fading = 1;
    },
    fadeOut() {
      fading = 1;
      rTarget = 0;
      rK = 60;
      rZ = 1;
    },
    destroy,
  };
}

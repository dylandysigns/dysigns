import gsap from "gsap";
import { SEND } from "./sendAnimation";
import { createWarp } from "../SpaceWarp";
import type { SignalOrb } from "./signalOrb";

/* The end of the send animation: the message is an envelope, and it is sent to a small dark-glass ball, to the right.
   The page recedes to the left and soft streaks of stars flow past, as if the camera moves to the
   right. A portal of light comes in from the right edge, the envelope steers to its middle and goes through, and the
   portal answers with rings, draws together and shows a check mark. Then the camera pans on to the right: it glides to the
   left of the screen, where it stays, and the thank-you comes in on the right.

   Nothing is built in the middle of the flight. `prepareSignal` is called when the message starts to
   go, while the fields are still flying into the ball: it creates the canvases and the inbox
   then, so that when the signal is sent everything is already there, and the flight can
   run without a single hitch. */

export type PreparedSignal = {
  /** send the signal; resolves when the pan is over, with a function that removes the Earth again */
  fly: (orb: SignalOrb, onPan: () => void) => Promise<() => void>;
  /** remove everything, if it is not going to be used */
  dispose: () => void;
};

export function prepareSignal(origin: { x: number; y: number }): PreparedSignal {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const narrow = vw < 700;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const S = Math.round(Math.min(vw, vh) * SEND.earthSize * 3.3); // the canvas, with room for the glow
  // where the Earth is when the signal reaches it (on the right), and where it stays (on the left)
  const rightX = narrow ? vw * 0.78 : vw * 0.8;
  const rightY = narrow ? origin.y - 60 : origin.y;
  const leftX = narrow ? vw / 2 : Math.max(S * 0.55, vw * 0.22);
  const leftY = narrow ? Math.max(S * 0.5, origin.y - 190) : origin.y;

  // the Earth, hidden for now
  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, { position: "fixed", left: "0", top: "0", width: `${S}px`, height: `${S}px`, zIndex: "8999", pointerEvents: "none", opacity: "0", willChange: "transform" });
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = Math.round(S * dpr);
  canvas.height = Math.round(S * dpr);
  canvas.style.transform = `translate(${vw + S}px, ${rightY - S / 2}px)`;
  document.body.appendChild(canvas);
  // streaks of stars, flying to the right, also hidden for now
  const streaks = document.createElement("canvas");
  Object.assign(streaks.style, { position: "fixed", inset: "0", width: "100%", height: "100%", zIndex: "8997", pointerEvents: "none", opacity: "0" });
  streaks.setAttribute("aria-hidden", "true");
  document.body.appendChild(streaks);
  // soft and few: long hard lines were too much; this is a gentle flow of stars
  const warp = createWarp(streaks, { length: 110, alpha: 0.5, count: 110 });
  if (warp) {
    warp.state.dir = 1;
    warp.start(); // from now on, invisible and at speed 0: its first frame is not built in the flight
  }

  const ctx = canvas.getContext("2d");
  let alive = true;
  let raf = 0;
  let running = false; // the Earth is only drawn while it is on the screen
  const dispose = () => {
    if (!alive) return;
    alive = false;
    cancelAnimationFrame(raf);
    canvas.remove();
    streaks.remove();
    warp?.destroy();
  };

  const pos = { x: vw + S, y: rightY }; // the centre of the beacon, on the screen
  const target = { x: rightX, y: rightY }; // the heart of the beacon, where the envelope goes in
  const rings: number[] = [];
  const recoil = { x: 0 };
  const chk = { v: 0 }; // 0: open portal; then it draws together (0 to 0.5) and the tick draws itself (0.5 to 1)
  let pulse = 0;

  // the receiver: a small, quiet ball of dark glass with a thin light rim, like the globes on the site. The envelope goes into it, it answers with a soft
  // ripple and swells a little, and a thin check mark appears in it: received
  const draw = (now: number) => {
    if (!alive || !ctx) return;
    if (running) raf = requestAnimationFrame(draw);
    canvas.style.transform = `translate(${pos.x + recoil.x - S / 2}px, ${pos.y - S / 2}px)`;
    const c = S / 2;
    const k = chk.v;
    const e = Math.min(1, k / 0.5); // it swells a little
    const tp = Math.max(0, (k - 0.5) / 0.5); // then the tick
    const ease = e * e * (3 - 2 * e);
    const breathe = 1 + 0.03 * Math.sin(now / 900);
    const r = (S * 0.036 + S * 0.016 * ease) * breathe;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, S, S);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // the faintest halo
    const gr = r * 3;
    const halo = ctx.createRadialGradient(c, c, r * 0.8, c, c, gr);
    halo.addColorStop(0, `rgba(170,205,255,${(0.1 + 0.16 * pulse).toFixed(3)})`);
    halo.addColorStop(1, "rgba(170,205,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(c, c, gr, 0, Math.PI * 2);
    ctx.fill();
    // the ball: dark glass with a thin light rim, like the globes on the site
    const body = ctx.createRadialGradient(c - r * 0.3, c - r * 0.35, r * 0.1, c, c, r);
    body.addColorStop(0, "rgba(30,34,43,0.97)");
    body.addColorStop(1, "rgba(4,6,9,0.98)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(214,228,255,${(0.5 + 0.4 * Math.max(pulse, ease)).toFixed(3)})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    // a thin white check mark, drawn by hand
    if (tp > 0) {
      const q = r;
      const pts: [number, number][] = [
        [c - q * 0.38, c + q * 0.02],
        [c - q * 0.1, c + q * 0.3],
        [c + q * 0.42, c - q * 0.28],
      ];
      const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
      const l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
      let d = tp * (l1 + l2);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = Math.max(1.2, S / 200);
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      const t1 = Math.min(1, d / l1);
      ctx.lineTo(pts[0][0] + (pts[1][0] - pts[0][0]) * t1, pts[0][1] + (pts[1][1] - pts[0][1]) * t1);
      d -= l1;
      if (d > 0) {
        const t2 = Math.min(1, d / l2);
        ctx.lineTo(pts[1][0] + (pts[2][0] - pts[1][0]) * t2, pts[1][1] + (pts[2][1] - pts[1][1]) * t2);
      }
      ctx.stroke();
    }
    // where the envelope goes in: the middle of the ball
    target.x = pos.x + recoil.x - S / 2 + c;
    target.y = pos.y - S / 2 + c;
    for (const t0 of rings) {
      const a = (now - t0) / 1300;
      if (a < 0 || a > 1) continue;
      ctx.strokeStyle = `rgba(200,220,255,${(0.34 * (1 - a) * (1 - a)).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(c, c, r + S * 0.15 * a, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  // one frame at once: the first thing the camera sees is already finished
  draw(performance.now());

  const fly = (orb: SignalOrb, onPan: () => void) =>
    new Promise<() => void>((resolve) => {
      if (!ctx || !alive) {
        resolve(() => {});
        return;
      }
      running = true;
      raf = requestAnimationFrame(draw);

      // the signal has reached the Earth: it goes in and follows the point where it went in, the Earth answers
      // with rings and gives a little, and the camera pans on at once, without a stop in between
      const arrive = () => {
        const now = performance.now();
        rings.push(now, now + 240, now + 480);
        orb.burst(target.x, target.y, 14);
        orb.ring();
        orb.absorb(() => target);
        gsap.fromTo(recoil, { x: 0 }, { x: 12 * SEND.bounce, duration: 0.08, ease: "power2.out" });
        gsap.to(recoil, { x: 0, duration: 0.9, delay: 0.08, ease: "elastic.out(1, 0.35)" });
        gsap.to(chk, { v: 1, duration: 1.5, delay: 0.45, ease: "power1.inOut" });
        const pl = { v: 0 };
        gsap.to(pl, { v: 1, duration: 0.4, ease: "power2.out", onUpdate: () => (pulse = pl.v) });
        gsap
          .timeline({ delay: 0.1, onComplete: () => resolve(dispose) })
          .call(onPan)
          .to(pos, { x: leftX, y: leftY, duration: SEND.panSec, ease: "sine.inOut" }, 0)
          .to(warp?.state ?? {}, { speed: Math.min(1, SEND.zoomWarp + 0.15), duration: SEND.panSec * 0.4, ease: "sine.inOut" }, 0)
          .to(warp?.state ?? {}, { speed: 0.03, duration: SEND.panSec * 0.6, ease: "sine.inOut" }, ">")
          .to(streaks, { opacity: 0, duration: SEND.panSec * 0.6, ease: "sine.inOut" }, "<")
          .call(() => {
            streaks.remove();
            warp?.destroy();
          });
      };

      gsap
        .timeline()
        // the page recedes to the left and the stars begin to flow to the right, gently; the Earth comes in from the right edge
        .call(() => window.dispatchEvent(new CustomEvent("dysigns:contact", { detail: "zoomout" })), [], 0)
        .to(streaks, { opacity: 1, duration: 0.9, ease: "sine.inOut" }, 0)
        .to(warp?.state ?? {}, { speed: SEND.zoomWarp, duration: SEND.zoomOutSec + 0.4, ease: "sine.inOut" }, 0)
        .to(canvas, { opacity: 1, duration: 0.7, ease: "sine.inOut" }, 0.1)
        .to(pos, { x: rightX, duration: SEND.zoomOutSec + 0.6, ease: "sine.out" }, 0.1)
        // the signal is already small and floating; it begins to steer while the Earth is still coming in, taking over by degrees
        .call(() => orb.seek(() => target, SEND.flightSec, arrive), [], 0.25);
    });

  return { fly, dispose };
}

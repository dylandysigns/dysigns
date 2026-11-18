import { useEffect, useRef } from "react";
import { watchHeroScene } from "./heroScene";

/* A small Earth for the hero: the real land as fine dots (see globeLand.ts), lit from the front
   and fading towards the edge, with a soft rim of atmosphere. It sways slowly around Europe, so
   Amsterdam is always on the side that faces you; there a dot pulses and a thin line leads from it
   to the words next to the globe. It is a button: click it and the globe scene opens (GlobeScene.tsx),
   a big globe you can turn and a holographic map of the Netherlands.

   Without JS nothing is lost: the words next to it are plain text. With reduced motion it is
   drawn once and stands still. */

const RAD = Math.PI / 180;
const AMS = { lon: 4.9 * RAD, lat: 52.37 * RAD };
const W = 190; // drawing space (the canvas is scaled to its CSS size)
const H = 120;
const CX = 60;
const CY = 62;
const R = 44;
const TILT = 27 * RAD; // how far the north pole leans towards the viewer

export type GlobeOriginRect = { cx: number; cy: number; diameter: number };

export function AvailGlobe({ label, onOpen }: { label: string; onOpen: (origin: GlobeOriginRect) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let k = 1;
    let land: Float32Array | null = null;
    let raf = 0;
    let alive = true;
    let last = 0;

    const size = () => {
      k = (canvas.clientWidth || 168) / W;
      canvas.width = Math.round(W * k * dpr);
      canvas.height = Math.round(H * k * dpr);
    };
    size();
    const ro = new ResizeObserver(() => {
      size();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    const draw = (t: number) => {
      ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const lon0 = AMS.lon + (reduced ? 0 : 20 * RAD * Math.sin(t / 6500));
      const sT = Math.sin(TILT);
      const cT = Math.cos(TILT);
      // orthographic projection: screen x, y and how much the point faces the viewer (z)
      const project = (lon: number, lat: number) => {
        const dl = lon - lon0;
        const cl = Math.cos(lat);
        const x = cl * Math.sin(dl);
        const y = cT * Math.sin(lat) - sT * cl * Math.cos(dl);
        const z = sT * Math.sin(lat) + cT * cl * Math.cos(dl);
        return { x: CX + R * x, y: CY - R * y, z };
      };

      const glow = ctx.createRadialGradient(CX, CY, R * 0.92, CX, CY, R * 1.28);
      glow.addColorStop(0, "rgba(180,205,255,0.08)");
      glow.addColorStop(1, "rgba(180,205,255,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.28, 0, Math.PI * 2);
      ctx.fill();
      const body = ctx.createRadialGradient(CX - R * 0.25, CY - R * 0.3, R * 0.1, CX, CY, R);
      body.addColorStop(0, "rgba(30,34,43,0.97)");
      body.addColorStop(1, "rgba(4,6,9,0.98)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(200,220,255,0.4)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      if (land) {
        for (let i = 0; i < land.length; i += 2) {
          const p = project(land[i], land[i + 1]);
          if (p.z <= 0.02) continue;
          const a = 0.16 + 0.7 * Math.pow(p.z, 0.8);
          ctx.fillStyle = `rgba(214,228,255,${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.7 + 0.35 * p.z, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Amsterdam: a line out to the words next to the globe, a dot and a slow ping
      const ams = project(AMS.lon, AMS.lat);
      if (ams.z > 0.1) {
        ctx.strokeStyle = "rgba(255,255,255,0.34)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(ams.x, ams.y);
        ctx.lineTo(100, 22);
        ctx.lineTo(W - 4, 22);
        ctx.stroke();
        const phase = reduced ? 0.4 : (t % 3200) / 3200;
        ctx.strokeStyle = `rgba(255,255,255,${(0.7 * (1 - phase)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(ams.x, ams.y, 2.4 + 9 * phase, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(ams.x, ams.y, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Nothing to see, nothing to draw: off screen, or faded out with the opening scene (scene "b")
    let onScreen = true;
    let heroAway = false;
    const frame = (t: number) => {
      raf = 0;
      if (!alive || !onScreen || heroAway) return;
      raf = requestAnimationFrame(frame);
      if (t - last < 33) return; // 30 frames a second is plenty for something this slow
      last = t;
      draw(t);
    };
    const wake = () => {
      if (alive && !reduced && land && !raf && onScreen && !heroAway) raf = requestAnimationFrame(frame);
    };
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            wake();
          });
    io?.observe(canvas);
    const unwatch = watchHeroScene(canvas, (scene) => {
      heroAway = scene === "b";
      wake();
    });

    import("./globeLand")
      .then((m) => {
        if (!alive) return;
        land = new Float32Array(m.LAND.length);
        for (let i = 0; i < m.LAND.length; i += 2) {
          land[i] = (m.LAND[i] / 10) * RAD;
          land[i + 1] = (m.LAND[i + 1] / 10) * RAD;
        }
        if (reduced) draw(0);
        else wake();
      })
      .catch(() => {
        /* the globe is decoration; without it the words and the line are enough */
      });
    if (reduced) draw(0);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      unwatch();
      ro.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      className="ph-globe-btn"
      aria-label={label}
      onClick={(e) => {
        // where the little globe is, so the scene can grow its globe out of it
        const r = e.currentTarget.getBoundingClientRect();
        const k = r.width / W;
        onOpen({ cx: r.left + CX * k, cy: r.top + CY * k, diameter: 2 * R * k });
      }}
    >
      <canvas ref={ref} className="ph-globe" aria-hidden="true" />
    </button>
  );
}

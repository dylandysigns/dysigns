import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createSpace } from "./portalSpace";
import { flyRight, enterFromRight } from "./sideFlight";
import { createHeroCamera } from "./heroCamera";
import { NL_GRID } from "./globeNL";
import { PLACES } from "./projectPlaces";
import type { useLanguage } from "../src/app/hooks/useLanguage";

type Tfn = ReturnType<typeof useLanguage>["t"];

/* The globe scene: a place of its own that the hero's globe opens. A large Earth of dots that you
   can turn with a finger or the mouse, with the places we have worked marked on it, and next to it
   a holographic map of the Netherlands with Amsterdam and Almere. A thin line links the two: it
   starts at the Netherlands on the globe and ends at the map, and it fades when you turn the
   Netherlands out of sight. A button turns the globe back.

   It is mounted on demand (PortalHero.tsx loads it when the globe is clicked), flies in out of
   the stars, and flies out again on Escape or Back. */

const RAD = Math.PI / 180;
const NL_VIEW = { lon: 5.1 * RAD, lat: 49 * RAD }; // the globe looks at the Netherlands from slightly above
const AMS_LON = 4.9 * RAD;
const ALM = PLACES.find((p) => p.id === "almere")!;
const AMS = PLACES.find((p) => p.id === "amsterdam")!;
const shortest = (from: number, to: number) => from + ((((to - from + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

export type GlobeOrigin = { cx: number; cy: number; diameter: number };

/* The scene lives in a React root of its own (see openGlobeScene in PortalHero.tsx), not inside the
   hero: when the call to action flies on to the contact page, the hero goes away with the route
   change, and the scene has to stay until its sky has let go. So what it needs from the site (the
   texts, the language, the page transition) is handed in. */
export default function GlobeScene({
  mode = "projects",
  onClose,
  origin,
  t,
  lang,
  navigateTo,
}: {
  mode?: "projects" | "thanks";
  onClose: () => void;
  origin: GlobeOrigin | null;
  t: Tfn;
  lang: string;
  navigateTo: (path: string, opts?: { instant?: boolean }) => void;
}) {
  const navRef = useRef(navigateTo);
  navRef.current = navigateTo;
  const rootRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLCanvasElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<HTMLCanvasElement>(null);
  const holoRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const linkRef = useRef<SVGPathElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const flyBack = useRef<(done: () => void) => void>((done) => done());
  const launch = useRef<(go: () => void, done: () => void) => void>((go, done) => (go(), done()));

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    flyBack.current(onClose);
  };
  // The button goes straight on: not back to the home screen first. The globe flies at you and
  // the stars rush, the site starts its flight to the contact page behind the sky of this scene,
  // and the sky lets go when the contact page is coming out of the stars.
  const startProject = () => {
    if (closing.current) return;
    closing.current = true;
    launch.current(() => navRef.current(mode === "thanks" ? "/" : "/contact", { instant: true }), onClose);
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    const root = rootRef.current;
    const sky = skyRef.current;
    const gCv = globeRef.current;
    const hCv = holoRef.current;
    const panel = panelRef.current;
    const link = linkRef.current;
    const resetBtn = resetRef.current;
    if (!root || !sky || !gCv || !hCv || !panel || !link || !resetBtn) return;
    const gctx = gCv.getContext("2d");
    const hctx = hCv.getContext("2d");
    if (!gctx || !hctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const view = { lon: AMS_LON, lat: reduced ? NL_VIEW.lat : 27 * RAD };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    backRef.current?.focus({ preventScroll: true });

    /* ─── the sky: the same stars, still rushing when we arrive, then calm ─── */
    const space = createSpace(sky);
    if (space) {
      Object.assign(space.state, { room: 1, fill: 0, planet: 0, warp: 0, travel: 0 });
      if (reduced) space.renderOnce();
      else space.start();
    }


    /* ─── coming in: the little globe of the hero is the one that grows ─── */
    const appear = { v: reduced ? 1 : 0 }; // how far the holographic map has come up
    // the small globe in the hero: where it was, and how big, so the big one can start from there
    const fromSmall = () => {
      const r = gCv.getBoundingClientRect();
      const full = gCv.offsetWidth * 0.84; // the disc of the big globe, in px
      if (!origin || !r.width) return { x: 0, y: 0, scale: 0.5 };
      return { x: origin.cx - (r.left + r.width / 2), y: origin.cy - (r.top + r.height / 2), scale: origin.diameter / full };
    };
    // the camera starts where the hero's globe looks (tilted 27 degrees) and settles on the Netherlands
    const START_LAT = 27 * RAD;
    /* Opened from the hero's globe: the same camera move as the DYSIGNS agent (heroCamera.ts). The
       camera zooms in on the little globe, you see it come closer and grow, and it settles in its
       place. Opened after the contact form (no little globe) it simply grows in, as before. */
    const heroGlobe = document.querySelector<HTMLElement>(".ph-globe-btn");
    const camera = (() => {
      if (reduced || !origin || !heroGlobe || !document.querySelector(".ph")) return null;
      const r = gCv.getBoundingClientRect();
      const full = gCv.offsetWidth * 0.84; // the disc of the big globe, in px
      if (!r.width || !full) return null;
      return createHeroCamera({
        from: { x: origin.cx, y: origin.cy },
        to: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
        scale: origin.diameter / full,
        big: gCv,
        sky,
        little: heroGlobe,
      });
    })();
    if (!reduced) {
      if (!camera) {
        gsap.set(sky, { opacity: 0 });
        gsap.set(gCv, fromSmall());
      }
      gsap.set(panel, { opacity: 0 });
      gsap.set(root.querySelector(".gs-cta"), { opacity: 0, y: 12 });
      gsap.set(root.querySelectorAll(".gs-head > *"), { opacity: 0 });
    }
    const letLinkGo = () => {
      leaving = true;
      link.style.transition = "opacity 0.3s ease";
      link.style.opacity = "0";
    };
    flyBack.current = (done) => {
      letLinkGo();
      if (reduced) return done();
      // the way in, backwards: the globe shrinks to the little one, the sky lets go
      gsap.to(panel, { opacity: 0, duration: 0.35, ease: "power1.in" });
      gsap.to(root.querySelector(".gs-cta"), { opacity: 0, duration: 0.3 });
      gsap.to(root.querySelectorAll(".gs-head > *"), { opacity: 0, duration: 0.3 });
      if (camera) {
        // the same camera move, backwards
        gsap.to(view, { lon: shortest(view.lon, AMS_LON), lat: START_LAT, duration: 1.6, ease: "power2.inOut" });
        camera.flyOut(done, 1.6);
        return;
      }
      gsap.to(gCv, { ...fromSmall(), duration: 1.0, ease: "power3.inOut" });
      gsap.to(view, { lon: shortest(view.lon, AMS_LON), lat: START_LAT, duration: 1.0, ease: "power3.inOut" });
      gsap.to(sky, { opacity: 0, duration: 0.7, delay: 0.45, ease: "power1.inOut", onComplete: done });
    };
    launch.current = (go, done) => {
      letLinkGo();
      if (reduced) {
        go();
        return done();
      }
      const heads = Array.from(root.querySelectorAll<HTMLElement>(".gs-head > *"));
      const cta = root.querySelector<HTMLElement>(".gs-cta");
      window.setTimeout(() => (drawing = false), 420); // once everything has faded
      // the scene lets go to the left, because we are flying off to the right
      gsap.to([panel, cta, ...heads], { x: -90, opacity: 0, duration: 0.45, ease: "power2.in", stagger: 0.03 });
      gsap.to(gCv, { x: -140, opacity: 0, duration: 0.6, ease: "power2.in" });
      // the flight itself runs on plain frames and timers (see sideFlight.ts), because the page change
      // kills every GSAP tween: that is what made the streaks stand still halfway
      flyRight(
        go,
        () => {
          // the new page is there: our sky lets go with a CSS transition, which cannot be killed either
          sky.style.transition = "opacity 0.9s ease-in-out";
          sky.style.opacity = "0";
          enterFromRight();
        },
        done,
      );
    };

    // the way in: the sky comes up, the stars rush while the globe grows, then everything settles
    if (camera) {
      gsap
        .timeline()
        .add(camera.flyIn(2.1), 0)
        .to(space?.state ?? {}, { warp: 0.45, duration: 0.9, ease: "power2.in" }, 0.2)
        .to(space?.state ?? {}, { travel: 1.0, duration: 2.4, ease: "power2.out" }, 0.2)
        .to(space?.state ?? {}, { warp: 0, duration: 1.2, ease: "sine.out" }, 1.1)
        .to(view, { lon: NL_VIEW.lon, lat: NL_VIEW.lat, duration: 2.1, ease: "power2.inOut" }, 0)
        .to(root.querySelectorAll(".gs-head > *"), { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.7)
        .to(panel, { opacity: 1, duration: 0.6 }, 1.7)
        .to(root.querySelector(".gs-cta"), { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 2.2)
        .to(appear, { v: 1, duration: 1.8, ease: "power3.out" }, 1.7);
    } else if (!reduced) {
      gsap
        .timeline()
        .to(sky, { opacity: 1, duration: 0.7, ease: "power1.out" }, 0)
        .to(space?.state ?? {}, { warp: 0.85, duration: 0.8, ease: "power2.in" }, 0.1)
        .to(space?.state ?? {}, { travel: 1.4, duration: 2.2, ease: "power2.out" }, 0.1)
        .to(space?.state ?? {}, { warp: 0, duration: 1.4, ease: "sine.out" }, 0.9)
        .to(gCv, { x: 0, y: 0, scale: 1, duration: 1.7, ease: "power3.inOut" }, 0.15)
        .to(view, { lon: NL_VIEW.lon, lat: NL_VIEW.lat, duration: 1.7, ease: "power3.inOut" }, 0.15)
        .to(root.querySelectorAll(".gs-head > *"), { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 1.5)
        .to(panel, { opacity: 1, duration: 0.6 }, 1.5)
        .to(root.querySelector(".gs-cta"), { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 2.1)
        .to(appear, { v: 1, duration: 1.8, ease: "power3.out" }, 1.5);
    }

    // the contact page's 3D emblem: fetched and parsed now, while there is time, not in the middle of the flight
    window.setTimeout(() => void import("./portalEmblem"), 600);

    /* ─── the globe ─── */
    let S = 0;
    let R = 0;
    const motion = { vLon: 0, vLat: 0, dragging: false, lastX: 0, lastY: 0, idleSince: performance.now() };
    let lonS: Float32Array | null = null; // sin and cos of the longitude and latitude of each land dot
    let lonC: Float32Array | null = null;
    let latS: Float32Array | null = null;
    let latC: Float32Array | null = null;
    let nlFacing = 1; // how much the Netherlands faces us, for the link line and the button
    let drawing = true; // off when the scene leaves: the dots are faded by then, and the frames are needed for the flight
    let leaving = false; // the scene is on its way out: the link line goes first, it must not hang in the sky

    const sizeGlobe = () => {
      S = gCv.clientWidth || 600;
      R = S * 0.42;
      gCv.width = Math.round(S * dpr);
      gCv.height = Math.round(S * dpr);
    };
    sizeGlobe();

    import("./globeLandHi").then((m) => {
      const n = m.LAND_HI.length / 2;
      lonS = new Float32Array(n);
      lonC = new Float32Array(n);
      latS = new Float32Array(n);
      latC = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const lo = (m.LAND_HI[2 * i] / 10) * RAD;
        const la = (m.LAND_HI[2 * i + 1] / 10) * RAD;
        lonS[i] = Math.sin(lo);
        lonC[i] = Math.cos(lo);
        latS[i] = Math.sin(la);
        latC[i] = Math.cos(la);
      }
    });

    const project = (lon: number, lat: number) => {
      const cl = Math.cos(lat);
      const dl = lon - view.lon;
      const x = cl * Math.sin(dl);
      const y = Math.cos(view.lat) * Math.sin(lat) - Math.sin(view.lat) * cl * Math.cos(dl);
      const z = Math.sin(view.lat) * Math.sin(lat) + Math.cos(view.lat) * cl * Math.cos(dl);
      return { x: S / 2 + R * x, y: S / 2 - R * y, z };
    };

    const BUCKETS = 7;
    const bx: number[][] = Array.from({ length: BUCKETS }, () => []);
    const by: number[][] = Array.from({ length: BUCKETS }, () => []);

    const drawGlobe = (t: number) => {
      gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gctx.clearRect(0, 0, S, S);
      const cx = S / 2;
      const glow = gctx.createRadialGradient(cx, cx, R * 0.94, cx, cx, R * 1.18);
      glow.addColorStop(0, "rgba(160,200,255,0.1)");
      glow.addColorStop(1, "rgba(160,200,255,0)");
      gctx.fillStyle = glow;
      gctx.beginPath();
      gctx.arc(cx, cx, R * 1.18, 0, Math.PI * 2);
      gctx.fill();
      const body = gctx.createRadialGradient(cx - R * 0.3, cx - R * 0.35, R * 0.1, cx, cx, R);
      body.addColorStop(0, "rgba(30,34,43,0.97)");
      body.addColorStop(1, "rgba(4,6,9,0.98)");
      gctx.fillStyle = body;
      gctx.beginPath();
      gctx.arc(cx, cx, R, 0, Math.PI * 2);
      gctx.fill();
      gctx.strokeStyle = "rgba(200,220,255,0.42)";
      gctx.lineWidth = 1;
      gctx.stroke();

      if (lonS && lonC && latS && latC) {
        const sl = Math.sin(view.lat);
        const cl = Math.cos(view.lat);
        const so = Math.sin(view.lon);
        const co = Math.cos(view.lon);
        for (let b = 0; b < BUCKETS; b++) {
          bx[b].length = 0;
          by[b].length = 0;
        }
        for (let i = 0; i < lonS.length; i++) {
          const sd = lonS[i] * co - lonC[i] * so; // sin(lon - lon0)
          const cd = lonC[i] * co + lonS[i] * so; // cos(lon - lon0)
          const z = sl * latS[i] + cl * latC[i] * cd;
          if (z <= 0.03) continue;
          const x = latC[i] * sd;
          const y = cl * latS[i] - sl * latC[i] * cd;
          const b = Math.min(BUCKETS - 1, Math.floor(z * BUCKETS));
          bx[b].push(cx + R * x);
          by[b].push(cx - R * y);
        }
        const d = Math.max(1.3, S / 420);
        for (let b = 0; b < BUCKETS; b++) {
          gctx.fillStyle = `rgba(214,228,255,${(0.18 + 0.72 * (b / (BUCKETS - 1))).toFixed(2)})`;
          gctx.beginPath();
          for (let i = 0; i < bx[b].length; i++) gctx.rect(bx[b][i] - d / 2, by[b][i] - d / 2, d, d);
          gctx.fill();
        }
      }

      // the places: a pulsing dot each, a label when it faces us
      const marks: { x: number; y: number; z: number; name: string; base: boolean; dir: -1 | 1; up: number }[] = [];
      const nl = PLACES.filter((p) => p.cluster === "nl");
      const nlLon = (nl.reduce((a, p) => a + p.lon, 0) / nl.length) * RAD;
      const nlLat = (nl.reduce((a, p) => a + p.lat, 0) / nl.length) * RAD;
      const nlP = project(nlLon, nlLat);
      marks.push({ ...nlP, name: lang === "nl" ? "Nederland" : "The Netherlands", base: true, dir: 1, up: -0.22 });
      for (const p of PLACES.filter((q) => !q.cluster)) {
        const pp = project(p.lon * RAD, p.lat * RAD);
        // without instructions the name is written towards the middle of the globe, so it stays on it
        marks.push({ ...pp, name: p.name, base: false, dir: p.label?.side ?? (pp.x < cx ? 1 : -1), up: p.label?.up ?? -0.13 });
      }
      nlFacing = Math.max(0, Math.min(1, (nlP.z - 0.05) / 0.4));
      const fs = Math.max(11, S / 46);
      gctx.textBaseline = "middle";
      for (const m of marks) {
        if (m.z < 0.12) continue;
        const fade = Math.min(1, (m.z - 0.12) / 0.3);
        const phase = reduced ? 0.4 : ((t + m.x * 3) % 3000) / 3000;
        gctx.strokeStyle = `rgba(255,255,255,${(0.7 * (1 - phase) * fade).toFixed(3)})`;
        gctx.lineWidth = 1;
        gctx.beginPath();
        gctx.arc(m.x, m.y, (m.base ? 4 : 3.2) + 14 * phase, 0, Math.PI * 2);
        gctx.stroke();
        gctx.fillStyle = `rgba(255,255,255,${fade.toFixed(3)})`;
        gctx.beginPath();
        gctx.arc(m.x, m.y, m.base ? 4.2 : 3.4, 0, Math.PI * 2);
        gctx.fill();
        // label up and to the side, towards the middle of the page so it stays on the canvas
        const side = m.dir;
        const ex = m.x + side * R * 0.16;
        const ey = m.y + m.up * R;
        gctx.strokeStyle = `rgba(255,255,255,${(0.5 * fade).toFixed(3)})`;
        gctx.beginPath();
        gctx.moveTo(m.x, m.y);
        gctx.lineTo(ex, ey);
        gctx.lineTo(ex + side * 10, ey);
        gctx.stroke();
        gctx.textAlign = side === 1 ? "left" : "right";
        gctx.font = `600 ${fs}px Effra, system-ui, sans-serif`;
        gctx.fillStyle = `rgba(255,255,255,${(0.95 * fade).toFixed(3)})`;
        gctx.fillText(m.name, ex + side * 16, ey);
      }

      // the line from the Netherlands to the map
      const rect = gCv.getBoundingClientRect();
      const prect = panel.getBoundingClientRect();
      const x0 = rect.left + nlP.x * (rect.width / S);
      const y0 = rect.top + nlP.y * (rect.height / S);
      const hrect = hCv.getBoundingClientRect();
      const x1 = hrect.left + holo.anchorX * (hrect.width / (HW || 1)) - 8;
      const y1 = hrect.top + holo.anchorY * (hrect.height / (HH || 1));
      const dx = Math.max(80, (x1 - x0) * 0.5);
      link.setAttribute("d", `M${x0.toFixed(1)} ${y0.toFixed(1)} C${(x0 + dx).toFixed(1)} ${y0.toFixed(1)} ${(x1 - dx).toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
      if (!leaving) link.style.opacity = String(0.85 * nlFacing * appear.v);
      resetBtn.classList.toggle("is-visible", nlFacing < 0.55);
    };

    /* ─── turning it: drag, with a little momentum; arrows work too ─── */
    const lastPt = { x: 0, y: 0 };
    const onDown = (e: PointerEvent) => {
      gCv.setPointerCapture(e.pointerId);
      motion.dragging = true;
      motion.vLon = motion.vLat = 0;
      lastPt.x = e.clientX;
      lastPt.y = e.clientY;
      gCv.classList.add("is-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!motion.dragging) return;
      const k = 1 / (R * (gCv.getBoundingClientRect().width / S));
      const dLon = -(e.clientX - lastPt.x) * k;
      const dLat = (e.clientY - lastPt.y) * k;
      view.lon += dLon;
      view.lat = Math.max(-1.25, Math.min(1.25, view.lat + dLat));
      motion.vLon = dLon;
      motion.vLat = dLat;
      lastPt.x = e.clientX;
      lastPt.y = e.clientY;
    };
    const onUp = () => {
      motion.dragging = false;
      motion.idleSince = performance.now();
      gCv.classList.remove("is-grabbing");
    };
    gCv.addEventListener("pointerdown", onDown);
    gCv.addEventListener("pointermove", onMove);
    gCv.addEventListener("pointerup", onUp);
    gCv.addEventListener("pointercancel", onUp);
    gCv.addEventListener("lostpointercapture", onUp);
    window.addEventListener("pointerup", onUp);

    const turnBack = () => {
      const goLon = shortest(view.lon, NL_VIEW.lon);
      motion.vLon = motion.vLat = 0;
      gsap.to(view, { lon: goLon, lat: NL_VIEW.lat, duration: 1.2, ease: "power3.inOut" });
    };
    resetBtn.addEventListener("click", turnBack);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        closeRef.current();
        return;
      }
      const step = 0.16;
      if (e.key === "ArrowLeft") view.lon -= step;
      else if (e.key === "ArrowRight") view.lon += step;
      else if (e.key === "ArrowUp") view.lat = Math.min(1.25, view.lat + step);
      else if (e.key === "ArrowDown") view.lat = Math.max(-1.25, view.lat - step);
      else return;
      // the page behind must not hear it (the hero flies on arrow keys and space)
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener("keydown", onKey, true);
    // and no scrolling of the hero behind the scene
    const stop = (e: Event) => e.stopPropagation();
    root.addEventListener("wheel", stop, { passive: true });
    root.addEventListener("touchmove", stop, { passive: true });

    /* ─── the holographic map of the Netherlands, in space ───
       Not a flat picture: the land floats as a slab of light over a round projection base, seen
       in perspective from above at an angle. It turns slowly (and with your finger), Amsterdam
       and Almere stand on it as beams of light with their names at the top, rings spread out over
       the base, and a band of light sweeps over the land from south to north. */
    let HW = 0;
    let HH = 0;
    const sizeHolo = () => {
      HW = hCv.clientWidth || 520;
      HH = hCv.clientHeight || 520;
      hCv.width = Math.round(HW * dpr);
      hCv.height = Math.round(HH * dpr);
    };
    sizeHolo();
    const C_LAT = 52.2;
    const C_LON = 5.1;
    const KM = 111; // kilometres per degree of latitude
    // the land, once, in kilometres from the middle: x east, z north
    const cells: { x: number; z: number; nl: boolean }[] = [];
    {
      const { lon0, lat0, dLon, dLat, rows } = NL_GRID;
      for (let r = 0; r < rows.length; r++)
        for (let c = 0; c < rows[r].length; c++) {
          const ch = rows[r].charCodeAt(c);
          if (ch === 48) continue;
          cells.push({ x: (lon0 + c * dLon - C_LON) * Math.cos(C_LAT * RAD) * KM, z: (lat0 - r * dLat - C_LAT) * KM, nl: ch === 50 });
        }
    }
    const kmOf = (lon: number, lat: number) => ({ x: (lon - C_LON) * Math.cos(C_LAT * RAD) * KM, z: (lat - C_LAT) * KM });
    const holo = { anchorX: 0, anchorY: 0, sway: 0, yaw: 0.25, pitch: 0.95, vYaw: 0, dragging: false, lastX: 0, lastY: 0, idleSince: performance.now() };

    const drawHolo = (t: number) => {
      hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      hctx.clearRect(0, 0, HW, HH);
      const ap = appear.v;
      if (ap < 0.01) return;
      const flick = reduced ? 1 : 0.94 + 0.06 * Math.sin(t / 90) * Math.sin(t / 230);
      // the slow sway fades in and out, it never jumps: it used to switch on after 2.5 s of nothing
      // and off the moment you touched the map, and both were a visible hitch
      const swayGoal = reduced || holo.dragging || t - holo.idleSince < 2500 ? 0 : 1;
      holo.sway += (swayGoal - holo.sway) * 0.04;
      const idleYaw = holo.sway * 0.5 * Math.sin(t / 5200);
      const yaw = holo.yaw + idleYaw;
      const cy0 = Math.cos(yaw);
      const sy0 = Math.sin(yaw);
      const cp = Math.cos(holo.pitch);
      const sp = Math.sin(holo.pitch);
      const F = 1000; // camera distance
      const unit = (Math.min(HW, HH) * 0.78) / 330; // pixels per km at the middle
      const cx = HW / 2;
      const cy = HH * 0.54;
      // a point of the scene (km, km above the slab, km) to the screen
      const P = (x: number, y: number, z: number) => {
        const x1 = x * cy0 - z * sy0;
        const z1 = x * sy0 + z * cy0;
        // looking down at an angle: north is further away and higher up the screen
        const y2 = y * cp + z1 * sp;
        const z2 = z1 * cp - y * sp; // how much further from the camera than the middle
        const k = F / (F + z2 * unit * 0.9);
        return { x: cx + x1 * unit * k, y: cy - y2 * unit * k, k };
      };
      hctx.globalAlpha = flick * ap;
      // where the line from the globe should end: the west edge of the land
      const west = P(-150, 0, 0);
      holo.anchorX = west.x;
      holo.anchorY = west.y;

      // the land: a top layer and, under it, a thinner layer so it has some body; a band of light sweeps from south to north
      const band = reduced ? -999 : -170 + ((t / 3600) % 1) * 380;
      const dot = Math.max(1.5, unit * 2.6);
      for (const c of cells) {
        const near = 1 - Math.min(1, Math.abs(c.z - band) / 24);
        const top = P(c.x, 0, c.z);
        let a: number;
        if (c.nl) a = 0.7 + near * 0.3;
        else {
          // the neighbours fade into nothing with distance, so the land has no square edge
          const dist = Math.hypot(c.x, c.z);
          const fall = Math.max(0, 1 - dist / 215);
          if (fall <= 0) continue;
          a = (0.14 + near * 0.28) * fall * fall;
        }
        hctx.fillStyle = c.nl ? `rgba(160,238,255,${a.toFixed(3)})` : `rgba(110,200,235,${a.toFixed(3)})`;
        hctx.fillRect(top.x - (dot * top.k) / 2, top.y - (dot * top.k) / 2, dot * top.k, dot * top.k);
        if (c.nl) {
          const under = P(c.x, -9, c.z);
          hctx.fillStyle = "rgba(90,190,230,0.2)";
          hctx.fillRect(under.x - (dot * under.k) / 2, under.y - (dot * under.k) / 2, dot * under.k, dot * under.k);
        }
      }

      // the two cities: a beam of light with the name on top
      const fs = Math.max(11, Math.min(HW, HH) / 30);
      hctx.textBaseline = "middle";
      const city = (name: string, lon: number, lat: number, side: -1 | 1, height: number) => {
        const k = kmOf(lon * 1, lat * 1);
        const foot = P(k.x, 0, k.z);
        const head = P(k.x, height, k.z);
        const g = hctx.createLinearGradient(0, foot.y, 0, head.y);
        g.addColorStop(0, "rgba(190,248,255,0.95)");
        g.addColorStop(1, "rgba(190,248,255,0.05)");
        hctx.strokeStyle = g;
        hctx.lineWidth = 2;
        hctx.beginPath();
        hctx.moveTo(foot.x, foot.y);
        hctx.lineTo(head.x, head.y);
        hctx.stroke();
        // a ring on the land where it stands
        const phase = reduced ? 0.4 : ((t + (side === 1 ? 1300 : 0)) % 2600) / 2600;
        hctx.strokeStyle = `rgba(170,240,255,${(0.8 * (1 - phase)).toFixed(3)})`;
        hctx.lineWidth = 1;
        hctx.beginPath();
        for (let a = 0; a <= 28; a++) {
          const th = (a / 28) * Math.PI * 2;
          const q = P(k.x + Math.cos(th) * (4 + 26 * phase), 0, k.z + Math.sin(th) * (4 + 26 * phase));
          if (a === 0) hctx.moveTo(q.x, q.y);
          else hctx.lineTo(q.x, q.y);
        }
        hctx.stroke();
        hctx.fillStyle = "#eefdff";
        hctx.beginPath();
        hctx.arc(head.x, head.y, 3.4, 0, Math.PI * 2);
        hctx.fill();
        hctx.font = `600 ${fs}px Effra, system-ui, sans-serif`;
        hctx.textAlign = side === 1 ? "left" : "right";
        hctx.fillStyle = "rgba(230,251,255,0.98)";
        hctx.fillText(name, head.x + side * 12, head.y - 2);
      };
      // the cities of the Netherlands where we work: each stands as a beam, the names do not touch
      const STYLE: Record<string, { side: -1 | 1; height: number }> = {
        amsterdam: { side: -1, height: 120 },
        almere: { side: 1, height: 84 },
        eindhoven: { side: 1, height: 58 },
      };
      for (const c of PLACES.filter((q) => q.cluster === "nl")) {
        const st = STYLE[c.id] ?? { side: 1, height: 70 };
        city(c.name, c.lon, c.lat, st.side, st.height);
      }
      hctx.globalAlpha = 1;
    };
    // turn it with a finger
    const onHoloDown = (e: PointerEvent) => {
      hCv.setPointerCapture(e.pointerId);
      // the sway that is showing becomes the real angle, so the map does not jump under the finger
      holo.yaw += holo.sway * 0.5 * Math.sin(performance.now() / 5200);
      holo.sway = 0;
      holo.dragging = true;
      holo.vYaw = 0;
      holo.lastX = e.clientX;
      holo.lastY = e.clientY;
      hCv.classList.add("is-grabbing");
    };
    const onHoloMove = (e: PointerEvent) => {
      if (!holo.dragging) return;
      const dYaw = (e.clientX - holo.lastX) * 0.008;
      holo.yaw += dYaw;
      holo.vYaw = dYaw;
      holo.pitch = Math.max(0.55, Math.min(1.3, holo.pitch + (e.clientY - holo.lastY) * 0.005));
      holo.lastX = e.clientX;
      holo.lastY = e.clientY;
    };
    const onHoloUp = () => {
      holo.dragging = false;
      holo.idleSince = performance.now();
      hCv.classList.remove("is-grabbing");
    };
    hCv.addEventListener("pointerdown", onHoloDown);
    hCv.addEventListener("pointermove", onHoloMove);
    hCv.addEventListener("pointerup", onHoloUp);
    hCv.addEventListener("pointercancel", onHoloUp);
    hCv.addEventListener("lostpointercapture", onHoloUp);
    // a release anywhere in the window ends the drag, so the map can never stay stuck in it
    window.addEventListener("pointerup", onHoloUp);

    // the sky follows the pointer a little
    const onPointer = (e: PointerEvent) => {
      if (reduced || !space) return;
      space.state.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      space.state.my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const onResize = () => {
      sizeGlobe();
      sizeHolo();
      if (reduced) {
        drawGlobe(0);
        drawHolo(0);
      }
    };
    window.addEventListener("resize", onResize);

    /* ─── the loop ─── */
    let raf = 0;
    let alive = true;
    let last = 0;
    const frame = (t: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (t - last < 16) return;
      last = t;
      if (!motion.dragging) {
        // momentum, and when nobody has touched it for a while a slow drift
        if (Math.abs(motion.vLon) > 0.00005 || Math.abs(motion.vLat) > 0.00005) {
          view.lon += motion.vLon;
          view.lat = Math.max(-1.25, Math.min(1.25, view.lat + motion.vLat));
          motion.vLon *= 0.95;
          motion.vLat *= 0.95;
        } else if (!reduced && t - motion.idleSince > 3500 && !gsap.isTweening(view)) {
          view.lon += 0.0011;
        }
      }
      if (!holo.dragging && Math.abs(holo.vYaw) > 0.0002) {
        holo.yaw += holo.vYaw;
        holo.vYaw *= 0.95;
      }
      if (drawing) {
        drawGlobe(t);
        drawHolo(t);
      }
    };
    if (reduced) {
      import("./globeLandHi").then(() => window.setTimeout(() => (drawGlobe(0), drawHolo(0)), 50));
    } else raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      camera?.reset(); // the hero is never left zoomed in
      if (camera) gsap.killTweensOf(camera.cam);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      root.removeEventListener("wheel", stop);
      root.removeEventListener("touchmove", stop);
      hCv.removeEventListener("pointerdown", onHoloDown);
      hCv.removeEventListener("pointermove", onHoloMove);
      hCv.removeEventListener("pointerup", onHoloUp);
      hCv.removeEventListener("pointercancel", onHoloUp);
      hCv.removeEventListener("lostpointercapture", onHoloUp);
      window.removeEventListener("pointerup", onHoloUp);
      gCv.removeEventListener("pointerdown", onDown);
      gCv.removeEventListener("pointermove", onMove);
      gCv.removeEventListener("pointerup", onUp);
      gCv.removeEventListener("pointercancel", onUp);
      gCv.removeEventListener("lostpointercapture", onUp);
      window.removeEventListener("pointerup", onUp);
      resetBtn.removeEventListener("click", turnBack);
      gsap.killTweensOf([view, appear, sky, panel, gCv, root, ...Array.from(root.querySelectorAll(".gs-head > *"))]);
      if (space) {
        gsap.killTweensOf(space.state);
        space.stop();
        space.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={rootRef} className="gs" role="dialog" aria-modal="true" aria-label={mode === "thanks" ? t("thankyou.headline") : t("globe.title")}>
      <canvas ref={skyRef} className="gs-sky" aria-hidden="true" />
      <div className="gs-head">
        <button ref={backRef} type="button" className="gs-back" onClick={close}>
          <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
            <path d="M5 1 1 5l4 4M1.5 5H11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("globe.back")}
        </button>
        <h2>{mode === "thanks" ? t("thankyou.headline") : t("globe.title")}</h2>
        <p>{mode === "thanks" ? t("thankyou.sub") : t("globe.hint")}</p>
      </div>
      <div ref={globeWrapRef} className="gs-globe-wrap">
        <canvas ref={globeRef} className="gs-globe" aria-hidden="true" />
        <button ref={resetRef} type="button" className="gs-reset">
          {t("globe.reset")}
        </button>
      </div>
      <svg className="gs-link" aria-hidden="true">
        <path ref={linkRef} />
      </svg>
      <div className="gs-cta">
        {mode === "projects" && <p>{t("globe.ctaLine")}</p>}
        <button type="button" onClick={startProject}>
          {mode === "thanks" ? t("thankyou.backHome") : t("globe.cta")}
          <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
            <path d="M1 6h11M8 1.5 12.5 6 8 10.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <aside ref={panelRef} className="gs-holo" aria-label={t("globe.mapLabel")}>
        <canvas ref={holoRef} className="gs-holo__map" aria-hidden="true" />
        <p className="gs-holo__cap">{t("globe.mapNote")}</p>
      </aside>
    </div>
  );
}

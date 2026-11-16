import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import HeroConcept from "./HeroConcept";
import { createChrome } from "./chrome3d";

// Preview entry. Only served by `npm run dev` at /preview/hero-concept.html;
// the production build does not include this folder.
// Add #logo to the URL to see the 3D logo on its own, large.

function LogoOnly() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", move);
    createChrome(1200).then((c) => {
      c.canvas.style.cssText = "width:min(64vmin,640px);margin:0 auto;height:auto;display:block";
      ref.current?.appendChild(c.canvas);
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:24px;justify-content:center";
      for (const src of Object.values(c.icons)) {
        const img = new Image();
        img.src = src;
        img.style.width = "150px";
        row.appendChild(img);
      }
      ref.current?.appendChild(row);
      const t0 = performance.now();
      const tick = (now: number) => {
        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;
        c.renderLogo((now - t0) / 1000, mx * 1.6, my * 1.2, false);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return <div ref={ref} style={{ height: "100svh", display: "grid", placeContent: "center", background: "#000" }} />;
}

createRoot(document.getElementById("root")!).render(window.location.hash === "#logo" ? <LogoOnly /> : <HeroConcept />);

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createSpace, type Space } from "../../../../preview/portalSpace";

/* The sky behind the contact page: the same stars as the splash and the homepage hero. The
   pointer moves the sky a little, and it otherwise stays still. Without WebGL, or with reduced motion, it is a
   still sky, or nothing at all: the page works without it. */
export function ContactSpace() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let space: Space | null = null;
    try {
      space = createSpace(canvas);
    } catch {
      return;
    }
    if (!space) return;
    const s = space.state;
    Object.assign(s, { room: 1, fill: 0, planet: 0 });
    if (reduced) space.renderOnce();
    else space.start();

    const onMove = (e: PointerEvent) => {
      gsap.to(s, {
        mx: (e.clientX / (window.innerWidth || 1) - 0.5) * 2,
        my: (e.clientY / (window.innerHeight || 1) - 0.5) * 2,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    
    return () => {
      window.removeEventListener("pointermove", onMove);
      
      gsap.killTweensOf(s);
      space?.destroy();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        // the sky dies away towards the bottom, so there is no edge where the footer starts
        maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
      }}
    />
  );
}

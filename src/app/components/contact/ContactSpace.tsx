import { useEffect, useRef } from "react";
import gsap from "gsap";
import { createSpace, type Space } from "../../../../preview/portalSpace";
import { SEND } from "./sendAnimation";

/* The sky behind the contact page: the same stars as the splash and the homepage hero. The
   pointer moves the sky a little, and it otherwise stays still. Without WebGL, or with reduced motion, it is a
   still sky, or nothing at all: the page works without it. */
export function ContactSpace() {
  const ref = useRef<HTMLCanvasElement>(null);

  /* Set up a moment after the page is there, not in the same frame: compiling the shader is the
     heaviest thing the page does, and when it ran in the frame of the page change, the flight from
     the globe scene froze for a moment right there. The sky fades in when it is ready; until then
     the flight's own stars are behind the page. */
  const setup = (): (() => void) | undefined => {
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
    canvas.style.opacity = "1";

    const onMove = (e: PointerEvent) => {
      gsap.to(s, {
        mx: (e.clientX / (window.innerWidth || 1) - 0.5) * 2,
        my: (e.clientY / (window.innerHeight || 1) - 0.5) * 2,
        duration: 1.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    /* Sending: the ball is made of the fields themselves (LeadForm.tsx). Here only the sky joins in. */
    // the sideways streaks of the send animation are its own (sendSignal.ts); the sky only stays calm
    // the full-screen sky is the heaviest thing on the page: it rests while the signal flies, so the
    // flight has all the frames; it picks up again when the camera has panned on
    let wake = 0;
    const onContact = (e: Event) => {
      if (reduced || !space) return;
      const phase = (e as CustomEvent<string>).detail;
      window.clearTimeout(wake);
      if (phase === "zoomout") space.stop();
      else if (phase === "sent") wake = window.setTimeout(() => space?.start(), 1800);
      else if (phase === "failed") space.start();
    };
    window.addEventListener("dysigns:contact", onContact);
    window.addEventListener("pointermove", onMove, { passive: true });
    
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("dysigns:contact", onContact);
      
      gsap.killTweensOf(s);
      space?.destroy();
    };
  };

  useEffect(() => {
    let stop: (() => void) | undefined;
    const timer = window.setTimeout(() => {
      stop = setup();
    }, 220);
    return () => {
      window.clearTimeout(timer);
      stop?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      data-contact-space=""
      className="pointer-events-none"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        opacity: 0,
        transition: "opacity 0.9s ease",
        // the sky dies away towards the bottom, so there is no edge where the footer starts
        maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
      }}
    />
  );
}

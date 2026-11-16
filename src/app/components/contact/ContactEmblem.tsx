import { useEffect, useRef } from "react";
import gsap from "gsap";
import { EMBLEM_SPIN_REST, type Emblem } from "../../../../preview/portalEmblem";

/* The DYSIGNS emblem in 3D chrome at the top of the contact page: the same object you meet in
   the homepage hero. It turns in once, floats, and turns carbon black where the pointer goes.
   Without WebGL, or if the 3D chunk does not load, nothing is shown: the page works without it. */
export function ContactEmblem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let emblem: Emblem | null = null;

    const onMove = (e: PointerEvent) => emblem?.setPointer(e.clientX, e.clientY, !reduced);
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") emblem?.clearPointer();
    };

    // the emblem is not part of the send and the thank-you: it leaves when the message goes, and comes back if it fails
    const onContact = (ev: Event) => {
      const phase = (ev as CustomEvent<string>).detail;
      if (phase === "sending") gsap.to(canvas, { opacity: 0, duration: 0.5, ease: "power1.out", overwrite: "auto", onComplete: () => emblem?.stop() }); // it rests once it is gone
      else if (phase === "failed") {
        emblem?.start();
        gsap.to(canvas, { opacity: 1, duration: 0.6, overwrite: "auto" });
      }
    };

    // not in the frame of the page change: loading and compiling the 3D emblem would freeze the flight in
    let wait = 0;
    new Promise<void>((resolve) => {
      wait = window.setTimeout(resolve, 1700);
    })
      .then(() => import("../../../../preview/portalEmblem"))
      .then((m) => m.createEmblem(canvas))
      .then((e) => {
        if (!alive) return e.destroy();
        emblem = e;
        e.state.still = reduced;
        e.state.morph = 1;
        e.state.scale = 1;
        e.state.auto = -1;
        e.state.spin = reduced ? EMBLEM_SPIN_REST : EMBLEM_SPIN_REST + 360;
        e.start();
        gsap.to(canvas, { opacity: 1, duration: 0.6, ease: "power1.out" });
        if (!reduced) gsap.to(e.state, { spin: EMBLEM_SPIN_REST, duration: 1.8, ease: "power2.inOut" });
        window.addEventListener("dysigns:contact", onContact);
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
      })
      .catch(() => {
        /* no 3D: the page simply starts at the heading */
      });

    return () => {
      alive = false;
      window.clearTimeout(wait);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("dysigns:contact", onContact);
      window.removeEventListener("pointerup", onUp);
      gsap.killTweensOf(canvas);
      if (emblem) {
        gsap.killTweensOf(emblem.state);
        emblem.destroy();
      }
    };
  }, []);

  return (
    // the canvas is larger than the emblem it draws, so the box that takes up room is smaller
    <div aria-hidden="true" style={{ position: "relative", height: 150, marginBottom: 14, pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", left: "50%", top: "50%", width: 460, height: 460, margin: "-230px 0 0 -230px", opacity: 0 }}
      />
    </div>
  );
}

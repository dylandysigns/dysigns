import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { createSpace } from "./portalSpace";
import { AgentOrb, type OrbSignal } from "./AgentOrb";
import { FaqChat } from "../src/app/components/home/FaqChat";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { GreetingBubble } from "./GreetingBubble";
import { createHeroCamera } from "./heroCamera";
import { flyRight, enterFromRight } from "./sideFlight";
import { usePageTransition } from "../src/app/hooks/useTransition";

export type ShipOrigin = { left: number; top: number; width: number; height: number };
/** Set when a link in an answer takes the visitor away: going back reopens the agent (SpaceAgent.tsx). */
export const AGENT_RETURN_KEY = "dysigns-agent-return";
const CHAT_KEY = "dysigns-agent-chat";

/* The DYSIGNS agent's scene: it opens the way the globe scene does (GlobeScene.tsx). The sky comes
   up, the stars rush, and the little orb from the hero is the one that grows into a big orb on
   the left; the conversation with the agent sits on the right, and the orb follows it: it ripples
   as you type, streams while it thinks and pulses while it answers (AgentOrb.tsx). Back or Escape
   plays it backwards: the orb shrinks to its place in the hero and the sky lets go.

   Unlike the globe scene it is a portal inside the hero's own React tree, not a root of its own:
   the chat needs the site's language and router, and a link in an answer simply changes the page. */
/** `signal`: the little orb's own signal, so the big orb is in its very pose (see AgentOrb.tsx). */
export function AgentScene({
  origin,
  onClose,
  signal: orb,
  instant = false,
}: {
  origin: ShipOrigin | null;
  onClose: () => void;
  signal: MutableRefObject<OrbSignal>;
  /** coming back to it (browser back after a link): it is simply there, no flight in */
  instant?: boolean;
}) {
  const { t } = useLanguage();
  const { navigateTo } = usePageTransition();
  const navRef = useRef(navigateTo);
  navRef.current = navigateTo;
  const rootRef = useRef<HTMLDivElement>(null);
  const skyRef = useRef<HTMLCanvasElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const [arrived, setArrived] = useState(false);
  const flyBack = useRef<(done: () => void) => void>((done) => done());

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    flyBack.current(onClose);
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    const root = rootRef.current;
    const sky = skyRef.current;
    const ship = shipRef.current;
    const panel = panelRef.current;
    if (!root || !sky || !ship || !panel) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const head = Array.from(root.querySelectorAll<HTMLElement>(".gs-head > *"));

    // the same stars as the hero, still rushing when we arrive, then calm
    const space = createSpace(sky);
    // without WebGL there are no stars: plain black, so the hero never shows through
    if (!space) sky.style.background = "#000";
    if (space) {
      Object.assign(space.state, { room: 1, fill: 0, planet: 0, warp: 0, travel: 0 });
      if (reduced) space.renderOnce();
      else space.start();
    }

    /* The camera (heroCamera.ts): one continuous move from the hero into the agent's space. You see
       the agent in the distance, growing as you come closer, and the screen settles around it as it
       arrives in its place on the left. */
    const fr = ship.getBoundingClientRect(); // where the orb ends, untransformed
    const F = { x: fr.left + fr.width / 2, y: fr.top + fr.height / 2 };
    const O = origin ? { x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 } : F;
    const camera = reduced
      ? null
      : createHeroCamera({
          from: O,
          to: F,
          scale: origin && fr.width ? origin.width / fr.width : 0.3,
          big: ship,
          sky,
          little: document.querySelector<HTMLElement>(".sa-ship .sa-craft"),
        });

    if (camera && instant) {
      // already there: the camera at the end of its move, everything in place
      camera.cam.p = 1;
      camera.apply();
      if (space) Object.assign(space.state, { warp: 0, travel: 1.0 });
      root.querySelector<HTMLInputElement>(".as-panel input")?.focus({ preventScroll: true });
      setArrived(true);
    } else if (camera) {
      gsap.set(panel, { opacity: 0, x: 40 });
      gsap.set(head, { opacity: 0 });
      gsap
        .timeline()
        .add(camera.flyIn(2.1), 0)
        .to(space?.state ?? {}, { warp: 0.45, duration: 0.9, ease: "power2.in" }, 0.2)
        .to(space?.state ?? {}, { travel: 1.0, duration: 2.4, ease: "power2.out" }, 0.2)
        .to(space?.state ?? {}, { warp: 0, duration: 1.2, ease: "sine.out" }, 1.1)
        .to(head, { opacity: 1, duration: 0.8, stagger: 0.1 }, 1.7)
        .to(panel, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, 1.7)
        .call(() => root.querySelector<HTMLInputElement>(".as-panel input")?.focus({ preventScroll: true }), [], 2.2)
        .call(() => setArrived(true), [], 2.2);
    } else {
      root.querySelector<HTMLInputElement>(".as-panel input")?.focus({ preventScroll: true });
      setArrived(true);
    }

    flyBack.current = (done) => {
      setArrived(false);
      if (!camera) return done();
      // the same camera move, backwards: away from the agent, back into the hero
      gsap.to(panel, { opacity: 0, x: 40, duration: 0.35, ease: "power1.in" });
      gsap.to(head, { opacity: 0, duration: 0.3 });
      camera.flyOut(done, 1.6);
    };

    /* A link in an answer (to the contact page, a service, an article) does not cut away: like the
       globe scene's button, the scene lets go to the left and we fly off to the right (sideFlight.ts),
       stars streaking past, and the new page comes in from the right. A black sky of our own, outside
       React, covers the page change, since this scene goes away with the hero the moment it happens. */
    const leave = (path: string) => {
      if (closing.current) return;
      closing.current = true;
      setArrived(false);
      try {
        sessionStorage.setItem(AGENT_RETURN_KEY, "1");
      } catch {
        /* private mode: going back then shows the home page as usual */
      }
      if (reduced) return navRef.current(path);
      gsap.to([panel, ...head], { x: -90, opacity: 0, duration: 0.45, ease: "power2.in", stagger: 0.03 });
      gsap.to(ship, { x: "-=140", opacity: 0, duration: 0.6, ease: "power2.in" });
      const cover = document.createElement("div");
      cover.setAttribute("aria-hidden", "true");
      Object.assign(cover.style, {
        position: "fixed",
        inset: "0",
        zIndex: "9600",
        background: "#000",
        pointerEvents: "none",
        opacity: "0",
        transition: "opacity 0.5s ease",
      });
      document.body.appendChild(cover);
      requestAnimationFrame(() => (cover.style.opacity = "1"));
      flyRight(
        () => navRef.current(path, { instant: true }),
        () => {
          cover.style.transition = "opacity 0.9s ease-in-out";
          cover.style.opacity = "0";
          enterFromRight();
        },
        () => cover.remove(),
      );
    };
    const onLinkClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const href = a?.getAttribute("href") ?? "";
      if (!a || !href.startsWith("/") || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      e.stopPropagation(); // before React's own link handler, which would change the page at once
      leave(href);
    };
    root.addEventListener("click", onLinkClick, true);

    // the hero listens on the window for scroll and keys: what happens in here stays in here
    const stop = (e: Event) => e.stopPropagation();
    const onKey = (e: KeyboardEvent) => e.stopPropagation();
    // Keys while it is open belong to it, wherever the focus is: a starting question that was
    // clicked is gone, and the focus falls back to the page. Escape always closes it, and no key
    // reaches the hero behind it (which would start its own flight).
    const onWindowKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        closeRef.current();
      } else if (!root.contains(e.target as Node)) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("keydown", onWindowKey, true);
    root.addEventListener("wheel", stop);
    root.addEventListener("touchmove", stop);
    root.addEventListener("keydown", onKey);
    backRef.current?.focus({ preventScroll: true });

    return () => {
      // whatever happens (a link in an answer changes the page), the hero is never left zoomed in
      camera?.reset();
      // the chat is gone: the orb is at rest again (a timer that would have said so went with it)
      orb.current.mode = "idle";
      orb.current.hover = false;
      orb.current.rush = 0;
      document.body.style.overflow = prevOverflow;
      root.removeEventListener("click", onLinkClick, true);
      root.removeEventListener("wheel", stop);
      root.removeEventListener("touchmove", stop);
      root.removeEventListener("keydown", onKey);
      window.removeEventListener("keydown", onWindowKey, true);
      gsap.killTweensOf([sky, ship, panel, orb.current, ...(camera ? [camera.cam] : []), ...head]);
      if (space) {
        gsap.killTweensOf(space.state);
        space.stop();
        space.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div ref={rootRef} className="gs as" role="dialog" aria-modal="true" aria-label={t("agent.name")}>
      <canvas ref={skyRef} className="gs-sky" aria-hidden="true" />
      <div className="gs-head">
        <button ref={backRef} type="button" className="gs-back" onClick={close}>
          <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
            <path d="M5 1 1 5l4 4M1.5 5H11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("globe.back")}
        </button>
        <h2>{t("agent.name")}</h2>
        <p>{t("agent.sceneHint")}</p>
      </div>
      {/* the orb answers a hover and a click too (decoration: the chat is the way in) */}
      <div
        ref={shipRef}
        className="as-ship"
        aria-hidden="true"
        data-cursor-plain=""
        onPointerEnter={() => void (orb.current.hover = true)}
        onPointerLeave={() => void (orb.current.hover = false)}
        onClick={() => void orb.current.pulse++}
      >
        <AgentOrb signal={orb} className="as-craft" />
      </div>
      <GreetingBubble target={shipRef} enabled={arrived} />
      <aside ref={panelRef} className="as-panel" aria-label={t("faq.chat.label")}>
        <FaqChat
          variant="space"
          persistKey={CHAT_KEY}
          onPhase={(phase) => void (orb.current.mode = phase)}
        />
      </aside>
    </div>,
    document.body,
  );
}

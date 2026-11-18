import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { AgentOrb, createOrbSignal } from "./AgentOrb";
import { AgentScene, AGENT_RETURN_KEY, type ShipOrigin } from "./AgentScene";
import { GreetingBubble } from "./GreetingBubble";
import { plop } from "./plop";
import "./portal-hero.css";

const PHONE = "(max-width: 767px)";
const isHome = (path: string) => path === "/" || path === "/nl" || path === "/nl/";

/**
 * The DYSIGNS agent as a round button, fixed in the bottom right corner, so it can be asked
 * something on every screen. Only the orb, in a dark circle; a click opens the same scene as the
 * agent in the hero (AgentScene.tsx): the orb grows into the big one and the conversation comes in.
 *
 * Where it shows:
 * - desktop and tablet: on every page, except while the hero's own agent is on screen (the opening
 *   scene of the home page, SpaceAgent.tsx). Once the hero moves on to the emblem it comes in.
 * - phone: always, the home page too (the hero hides its own agent there, portal-hero.css).
 */
export function FixedAgent() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const navType = useNavigationType();
  const orb = useRef(createOrbSignal());
  const shipRef = useRef<HTMLButtonElement>(null);
  const setHover = (on: boolean) => void (orb.current.hover = on);

  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const read = () => setPhone(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  // On the home page, follow the hero's scene: its own agent is there while it is in scene "a".
  const [heroScene, setHeroScene] = useState<string | null>(() => (isHome(pathname) ? "a" : null));
  useEffect(() => {
    if (!isHome(pathname)) {
      setHeroScene(null);
      return;
    }
    setHeroScene("a");
    let mo: MutationObserver | null = null;
    let raf = 0;
    let tries = 0;
    const hook = () => {
      const ph = document.querySelector<HTMLElement>(".ph");
      if (!ph) {
        // the page may still be changing over: look again for a moment
        if (++tries < 120) raf = requestAnimationFrame(hook);
        return;
      }
      const read = () => setHeroScene(ph.dataset.scene ?? "a");
      read();
      mo = new MutationObserver(read);
      mo.observe(ph, { attributes: true, attributeFilter: ["data-scene"] });
    };
    hook();
    return () => {
      cancelAnimationFrame(raf);
      mo?.disconnect();
    };
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const [origin, setOrigin] = useState<ShipOrigin | null>(null);

  const rect = (): ShipOrigin | null => {
    const c = shipRef.current?.querySelector("canvas")?.getBoundingClientRect();
    return c?.width ? { left: c.left, top: c.top, width: c.width, height: c.height } : null;
  };

  /* A new page: the scene goes (a link in an answer changes the page, the hero's scene goes with
     the hero, this one stays mounted, so it closes here). Back to the page it was left from, with
     the back button: it is open again, the conversation as it was. The hero's own agent takes that
     over where it is on screen (SpaceAgent.tsx). */
  useEffect(() => {
    let back = false;
    try {
      const heroShip = document.querySelector(".ph-agent .sa-ship");
      const heroTakesIt = !!heroShip?.getBoundingClientRect().width;
      if (!heroTakesIt && navType === "POP" && sessionStorage.getItem(AGENT_RETURN_KEY) === pathname) {
        sessionStorage.removeItem(AGENT_RETURN_KEY);
        back = true;
      }
    } catch {
      /* private mode */
    }
    if (back) {
      setOrigin(rect());
      setInstant(true);
      setOpen(true);
    } else {
      setOpen(false);
      setHover(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const shown = phone || heroScene === null || heroScene === "b";

  // The agent arrives in the corner (the hero moves on to the emblem): a small plop
  const wasShown = useRef(shown);
  useEffect(() => {
    if (shown && !wasShown.current) plop();
    wasShown.current = shown;
  }, [shown]);

  const openScene = () => {
    plop();
    setInstant(false);
    orb.current.pulse++; // the click wave, as the camera starts to fly in
    setOrigin(rect());
    setOpen(true);
  };

  return (
    <div className={`fa${shown ? "" : " is-hidden"}${open ? " is-open" : ""}`} aria-hidden={shown ? undefined : true}>
      <button
        ref={shipRef}
        type="button"
        className="fa-ship"
        aria-haspopup="dialog"
        aria-label={t("agent.open")}
        tabIndex={shown ? undefined : -1}
        data-cursor-plain=""
        onClick={openScene}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {/* fewer dots and frames than the hero's orb: it is small and on every page */}
        <AgentOrb signal={orb} className="fa-craft" fps={20} dots={1400} paused={!shown && !open} />
      </button>
      <GreetingBubble target={shipRef} enabled={shown && !open} />
      {open && (
        <AgentScene
          signal={orb}
          instant={instant}
          origin={origin}
          little={shipRef.current?.querySelector("canvas") ?? null}
          zoomHero={false}
          onClose={() => {
            setOpen(false);
            setHover(false);
            shipRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </div>
  );
}

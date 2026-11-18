import { useEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { AgentOrb, createOrbSignal } from "./AgentOrb";
import { AgentScene, AGENT_RETURN_KEY, type ShipOrigin } from "./AgentScene";
import { GreetingBubble } from "./GreetingBubble";
import { greeting } from "./agentGreeting";
import { watchHeroScene } from "./heroScene";

/**
 * The DYSIGNS agent: a small orb of fine dots (AgentOrb.tsx, a voice made visible, monochrome like
 * the globe) in the bottom right corner of the hero, with a quiet invitation with it. A click
 * opens its scene the way the globe opens its own (AgentScene.tsx): this orb grows into a big one
 * on the left, and the conversation sits on the right. The chat is the site's own
 * FaqChat, so it answers from the site's content (functions/api/faq-chat.js).
 */
export function SpaceAgent() {
  const { t } = useLanguage();
  const [origin, setOrigin] = useState<ShipOrigin | null>(null);
  const [open, setOpen] = useState(false);
  const orb = useRef(createOrbSignal());
  const setHover = (on: boolean) => void (orb.current.hover = on);
  const shipRef = useRef<HTMLButtonElement>(null);

  const [instant, setInstant] = useState(false);
  // the greeting goes by the visitor's own clock, so only once mounted (the prerender has no clock)
  const [hi, setHi] = useState("");
  useEffect(() => setHi(greeting(t).split(", ")[0]), [t]);

  // The intro (SplashIntro.tsx) lies over the hero on a first visit: the speech bubble only starts
  // typing once it is gone (Layout.tsx sends dysigns:splash-done), so the visitor sees it happen.
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    let seen = true;
    try {
      seen = sessionStorage.getItem("dysigns_splash_done") === "1";
    } catch {
      /* private mode: no intro to wait for */
    }
    if (seen) return setAwake(true);
    const wake = () => setAwake(true);
    window.addEventListener("dysigns:splash-done", wake, { once: true });
    return () => window.removeEventListener("dysigns:splash-done", wake);
  }, []);
  const navType = useNavigationType();

  // the opening scene is gone (the emblem is there): the orb is faded out, so it stops drawing
  const [heroAway, setHeroAway] = useState(false);
  useEffect(() => watchHeroScene(shipRef.current, (scene) => setHeroAway(scene === "b")), []);

  // Back from a page a link in an answer led to: the agent is open again, with the conversation as it was.
  // Only when this orb is on screen to fly from: on a phone the hero's orb is hidden, and the fixed
  // button (FixedAgent.tsx) picks the return up instead.
  useEffect(() => {
    if (!shipRef.current?.getBoundingClientRect().width) return;
    let wasAway = false;
    try {
      wasAway = sessionStorage.getItem(AGENT_RETURN_KEY) === window.location.pathname;
      if (wasAway) sessionStorage.removeItem(AGENT_RETURN_KEY);
    } catch {
      /* private mode */
    }
    // only with the back (or forward) button
    if (!wasAway || navType !== "POP") return;
    const c = shipRef.current?.querySelector("canvas")?.getBoundingClientRect();
    setOrigin(c?.width ? { left: c.left, top: c.top, width: c.width, height: c.height } : null);
    setInstant(true);
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openScene = () => {
    setInstant(false);
    orb.current.pulse++; // the click wave, as the camera starts to fly in
    const c = shipRef.current?.querySelector("canvas")?.getBoundingClientRect();
    setOrigin(c ? { left: c.left, top: c.top, width: c.width, height: c.height } : null);
    setOpen(true);
  };

  return (
    <div className={`sa${open ? " is-open" : ""}${awake ? " is-awake" : ""}`}>
      <button
        ref={shipRef}
        type="button"
        className="sa-ship"
        aria-haspopup="dialog"
        aria-label={t("agent.open")}
        data-cursor-plain=""
        onClick={openScene}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {/* desktop and tablet: a speech bubble by the orb that types first, then asks, so the
            visitor sees it talks before pointing at it (the cursor bubble takes over on hover) */}
        <span className="sa-hint" aria-hidden="true">
          <span className="sa-hint__bubble">
            <span className="sa-hint__dots">
              <i />
              <i />
              <i />
            </span>
            <span className="sa-hint__text">
              {hi && <span className="sa-hint__hi">{hi}</span>}
              <span className="sa-hint__ask">{t("agent.question")}</span>
            </span>
          </span>
        </span>
        <AgentOrb signal={orb} className="sa-craft" fps={30} paused={heroAway && !open} />
        <span className="sa-name">{t("agent.name")}</span>
        {/* the invitation reads as a button: a pill with a white arrow, like the hero's own buttons */}
        <span className="sa-ask">
          <span className="sa-ask__text">{t("agent.ask")}</span>
          <span className="sa-go" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>
      <GreetingBubble target={shipRef} />
      {open && (
        <AgentScene
          signal={orb}
          instant={instant}
          origin={origin}
          little={shipRef.current?.querySelector("canvas") ?? null}
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

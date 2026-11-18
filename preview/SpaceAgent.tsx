import { useEffect, useRef, useState } from "react";
import { useNavigationType } from "react-router";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { AgentOrb, createOrbSignal } from "./AgentOrb";
import { AgentScene, AGENT_RETURN_KEY, type ShipOrigin } from "./AgentScene";
import { GreetingBubble } from "./GreetingBubble";

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
  const navType = useNavigationType();

  // Back from a page a link in an answer led to: the agent is open again, with the conversation as it was
  useEffect(() => {
    let wasAway = false;
    try {
      wasAway = sessionStorage.getItem(AGENT_RETURN_KEY) === "1";
      sessionStorage.removeItem(AGENT_RETURN_KEY);
    } catch {
      /* private mode */
    }
    // only with the back (or forward) button
    if (!wasAway || navType !== "POP") return;
    const c = shipRef.current?.querySelector("canvas")?.getBoundingClientRect();
    setOrigin(c ? { left: c.left, top: c.top, width: c.width, height: c.height } : null);
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
    <div className={`sa${open ? " is-open" : ""}`}>
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
        <AgentOrb signal={orb} className="sa-craft" fps={30} />
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

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../src/app/hooks/useLanguage";
import { greeting } from "./agentGreeting";

/* A speech bubble that floats next to the cursor while it is over the agent's orb: the greeting of
   the moment ("Goedemiddag" and "Vraag me alles"). It keeps some room from the cursor, follows it a
   little behind, and flips to the left side near the right edge of the screen. The site cursor stays
   its small dot there (data-cursor-plain on the target, see PremiumCursor.tsx). Mouse only. */
const GAP_X = 30; // room between the cursor and the bubble
const GAP_Y = -14;

/** `enabled`: off while the target is still flying in (the cursor would land on it mid-flight). */
export function GreetingBubble({ target, enabled = true }: { target: RefObject<HTMLElement>; enabled?: boolean }) {
  const { t } = useLanguage();
  const [on, setOn] = useState(false);
  const [text, setText] = useState(() => greeting(t).split(", "));
  const ref = useRef<HTMLDivElement>(null);
  // a portal needs the page's body: not there in the prerender, so only once mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = target.current;
    if (!el || !enabled || !window.matchMedia("(pointer: fine)").matches) return;
    const pos = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let shown = false;
    const place = () => {
      const b = ref.current;
      if (!b) return;
      pos.x += (pos.tx - pos.x) * 0.22;
      pos.y += (pos.ty - pos.y) * 0.22;
      const w = b.offsetWidth;
      const flip = pos.tx + GAP_X + w > window.innerWidth - 12;
      b.dataset.side = flip ? "left" : "right";
      const x = flip ? pos.x - GAP_X - w : pos.x + GAP_X;
      b.style.transform = `translate3d(${x.toFixed(1)}px, ${(pos.y + GAP_Y).toFixed(1)}px, 0)`;
      if (shown) raf = requestAnimationFrame(place);
    };
    const enter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setText(greeting(t).split(", "));
      pos.x = pos.tx = e.clientX;
      pos.y = pos.ty = e.clientY;
      shown = true;
      setOn(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    const move = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
    };
    const leave = () => {
      shown = false;
      setOn(false);
    };
    // the cursor may already be resting on it when it is switched on
    if (el.matches(":hover")) {
      const r = el.getBoundingClientRect();
      enter(new PointerEvent("pointerenter", { pointerType: "mouse", clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
    }
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", leave);
      setOn(false);
    };
  }, [target, t, mounted, enabled]);

  if (!mounted) return null;
  return createPortal(
    <div ref={ref} className={`agent-bubble${on ? " is-on" : ""}`} aria-hidden="true">
      <span className="agent-bubble__hi">{text[0]}</span>
      <span className="agent-bubble__ask">{text[1]}</span>
    </div>,
    document.body,
  );
}

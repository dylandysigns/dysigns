import { useEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { TurnstileWidget, TURNSTILE_ENABLED } from "../TurnstileWidget";
import { TransitionLink } from "../TransitionLink";
import { SEND } from "./sendAnimation";
import { prepareSignal, type PreparedSignal } from "./sendSignal";
import { createSignalOrb, type SignalOrb } from "./signalOrb";
import { useLanguage } from "../../hooks/useLanguage";
import "./lead-form.css";

/* The contact form, all at once and immersive: three huge inline fields (name, email, what you
   have in mind) one under the other, written in space (see ContactSpace). The field in use
   lights up, the others dim, and a single send button waits at the bottom. It posts to the same
   /api/contact endpoint as before, with the same spam checks (honeypot, timestamp and
   Turnstile); name, phone and language travel as their own hidden fields. */

type Field = "name" | "email" | "phone" | "idea";
/* What an empty field writes to itself, one phrase after the other: the hint that this is a
   place to type is the field typing. The first phrase is the plain label. */
const PROMPTS: Record<"en" | "nl", Record<Field, string[]>> = {
  en: {
    name: ["your name", "who are we talking to?"],
    email: ["your email", "where can we reach you?"],
    phone: ["your phone (optional)"],
    idea: ["tell us about your project"],
  },
  nl: {
    name: ["jouw naam", "met wie praten we?"],
    email: ["jouw e-mail", "waar bereiken we je?"],
    phone: ["jouw telefoonnummer (optioneel)"],
    idea: ["vertel over je project"],
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* An empty field just shows its label, quietly: no typing, no blinking. */
const useGhost = (prompts: string[], _active: boolean) => prompts[0];

/* One icon family: the same outline weight, the same 48 box and the same footprint (36 wide), so
   the three sit on one line and weigh the same. */
function Icon({ kind }: { kind: Field }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      {kind === "name" && (
        <>
          <circle cx="24" cy="16" r="7.5" {...common} />
          <path d="M9 41c0-8.3 6.7-14 15-14s15 5.7 15 14" {...common} />
        </>
      )}
      {kind === "email" && (
        <>
          <rect x="6" y="11" width="36" height="26" rx="5" {...common} />
          <path d="m8 15 16 12 16-12" {...common} />
        </>
      )}
      {kind === "phone" && (
        <>
          <rect x="13" y="5" width="22" height="38" rx="5" {...common} />
          <path d="M21 36.500h6" {...common} />
        </>
      )}
      {kind === "idea" && (
        <>
          <path d="M9 9h30a3 3 0 0 1 3 3v19a3 3 0 0 1-3 3H21l-9 7v-7H9a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" {...common} />
          <path d="M14 18h20M14 25h12" {...common} />
        </>
      )}
    </svg>
  );
}

export function LeadForm() {
  const { t, lang } = useLanguage();
  // the ball lives in the body, outside the page, so no transform of the page can move them
  const orbRef = useRef<SignalOrb | null>(null);
  const orbTimers = useRef<number[]>([]);
  const prepared = useRef<PreparedSignal | null>(null); // the Earth and its stars, built before they are needed
  const earth = useRef<(() => void) | null>(null); // takes the small Earth of the thank-you away again
  const clearOrb = () => {
    orbTimers.current.forEach((id) => window.clearTimeout(id));
    orbTimers.current = [];
    orbRef.current?.destroy();
    orbRef.current = null;
  };
  useEffect(
    () => () => {
      earth.current?.();
      prepared.current?.dispose();
      clearOrb();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idea, setIdea] = useState("");
  // idle: the form. sending: the fields fly into a ball of light while the message goes out.
  // sent: the ball dissolves into the thank-you. error: the fields come back, nothing is lost.
  const [phase, setPhase] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sending = phase === "sending" || phase === "sent";
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [tried, setTried] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  // Stamped on mount so the server can tell a person from a bot posting straight to the endpoint.
  const tsRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);
  const rowEls = useRef<HTMLElement[]>([]);

  const prompts = PROMPTS[lang === "nl" ? "nl" : "en"];
  const nameGhost = useGhost(prompts.name, name === "");
  const emailGhost = useGhost(prompts.email, email === "");
  const phoneGhost = useGhost(prompts.phone, phone === "");
  const ideaGhost = useGhost(prompts.idea, idea === "");

  const nameOk = name.trim().length >= 1;
  const emailOk = EMAIL_RE.test(email);
  // optional: empty is fine, but if it is filled in it has to look like a number
  const phoneOk = phone.trim() === "" || phone.replace(/\D/g, "").length >= 8;
  const ideaLen = idea.trim().length;
  const ideaOk = ideaLen >= 1; // no minimum length: anything is a start
  const valid = nameOk && emailOk && phoneOk && ideaOk;

  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
    setVerifyFailed(new URLSearchParams(window.location.search).get("error") === "verify");
  }, []);

  // the description grows with what is typed
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${area.scrollHeight}px`;
  }, [idea]);

  const notify = (state: "sending" | "sent" | "failed") =>
    window.dispatchEvent(new CustomEvent("dysigns:contact", { detail: state }));
  const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

  /* The fields fly into the middle of the page, where the ball of light appears behind them
     (ContactSpace.tsx). Each row gets the way to the middle as two CSS variables. */
  function collapse(): { mx: number; my: number; h: number } | null {
    const form = formRef.current;
    if (!form) return null;
    const canvas = document.querySelector("canvas[data-contact-space]");
    const box = canvas?.getBoundingClientRect();
    const mx = box ? box.left + box.width / 2 : window.innerWidth / 2;
    const my = box ? box.top + box.height / 2 : window.innerHeight / 2;
    // where the ball is, as seen from the form: the words under it and the thank-you go there
    const f = form.getBoundingClientRect();
    form.style.setProperty("--lf-ball-x", `${Math.round(mx - f.left)}px`);
    form.style.setProperty("--lf-ball-y", `${Math.round(my - f.top)}px`);
    form.style.setProperty("--lf-ball-r", `${Math.round(SEND.ballSize * (box ? box.height : window.innerHeight))}px`);
    form.style.setProperty("--lf-collapse", `${SEND.collapseSec}s`);
    form.style.setProperty("--lf-stagger", `${SEND.collapseStagger}s`);
    form.style.setProperty("--lf-blur", `${SEND.collapseBlur}px`);
    form.querySelectorAll<HTMLElement>(".lf-row").forEach((row) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty("--lf-dx", `${Math.round(mx - (r.left + r.width / 2))}px`);
      row.style.setProperty("--lf-dy", `${Math.round(my - (r.top + r.height / 2))}px`);
    });
    return { mx, my, h: box ? box.height : window.innerHeight };
  }

  /* The signal: it is the fields. Each one that flies in makes it bigger, quickly, one after the other,
     with a spring; and from the first moment it is alive: it floats, wanders and sends out rings
     (signalOrb.ts). */
  function growBall(mx: number, my: number, h: number) {
    clearOrb();
    const orb = createSignalOrb(mx, my);
    orbRef.current = orb;
    const R = SEND.ballSize * h;
    const rows = formRef.current?.querySelectorAll(".lf-row").length ?? 4;
    for (let i = 0; i < rows; i++) {
      // a field arrives: the signal takes a step bigger
      const id = window.setTimeout(() => orb.setRadius(R * (0.3 + (0.7 * (i + 1)) / rows)), (SEND.collapseSec * 0.8 + i * SEND.collapseStagger) * 1000);
      orbTimers.current.push(id);
    }
    // when it is full of the fields: the envelope shuts (with a little bounce) and then gets small again,
    // smoothly: a small signal that floats about and waits
    const small = Math.max(SEND.envelope > 0.5 ? 11 : 7, Math.min(window.innerWidth, window.innerHeight) * 0.016);
    const lastIn = (SEND.collapseSec * 0.8 + (rows - 1) * SEND.collapseStagger) * 1000;
    orbTimers.current.push(window.setTimeout(() => orb.setOpen(false), lastIn + 120));
    orbTimers.current.push(window.setTimeout(() => orb.setRadius(small, true), lastIn + (SEND.envelope > 0.5 ? 620 : 150)));
  }

  /* Sent with fetch, not a page load, so you see it go: the fields become a ball of light and the
     ball is the message on its way. Turnstile fills its hidden input a moment after the page
     loads, so the post waits for the token (at most about 5 s, then it goes anyway and the server
     decides). Without JS the form still posts the old way, to /api/contact and then /thank-you. */
  async function send() {
    const form = formRef.current;
    if (!form || sending) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = collapse();
    setPhase("sending");
    setVerifyFailed(false);
    notify("sending");
    document.body.style.overflow = "hidden"; // the ball is fixed: the page stays where it is
    if (pos && !reduced) {
      growBall(pos.mx, pos.my, pos.h);
      // the Earth, its stars and the land are built now, while the fields are still flying in
      prepared.current?.dispose();
      prepared.current = prepareSignal({ x: pos.mx, y: pos.my });
    }
    const started = performance.now();
    if (emailRef.current) emailRef.current.value = email;
    // name, phone and language travel as their own fields, so the mails can greet by name and answer in the page's language
    const fields = form.elements;
    (fields.namedItem("name") as HTMLInputElement).value = name.trim();
    (fields.namedItem("phone") as HTMLInputElement).value = phone.trim();
    (fields.namedItem("lang") as HTMLInputElement).value = lang === "nl" ? "nl" : "en";
    if (messageRef.current) messageRef.current.value = idea.trim();
    const hasToken = () =>
      Boolean((form.elements.namedItem("cf-turnstile-response") as HTMLInputElement | null)?.value);
    const waitStart = Date.now();
    while (TURNSTILE_ENABLED && !hasToken() && Date.now() - waitStart < 5000) await sleep(150);

    let ok = false;
    try {
      const res = await fetch("/api/contact", { method: "POST", body: new FormData(form) });
      // the server answers with a redirect: to /thank-you when it went well, back to the form when the check failed
      ok = res.ok && /\/thank-you\/?$/.test(new URL(res.url).pathname);
      if (!ok && res.url.includes("error=verify")) setVerifyFailed(true);
    } catch {
      ok = false;
    }
    // however fast the answer is, the fields and the ball are there long enough to be seen
    await sleep(Math.max(0, SEND.minDurationMs - (performance.now() - started)));
    if (ok) {
      // the message is out: the ball shrinks, the scene zooms out and the ball flies into the Earth as a signal
      const showThanks = () => {
        notify("sent");
        setPhase("sent");
        document.body.style.overflow = "";
      };
      if (pos && !reduced && orbRef.current) {
        earth.current?.();
        // the thank-you is shown when the camera pans on to the right, in the middle of the flight
        earth.current = prepared.current ? await prepared.current.fly(orbRef.current, showThanks) : null;
        prepared.current = null;
        clearOrb();
      } else {
        showThanks();
      }
    } else {
      notify("failed");
      orbRef.current?.fadeOut();
      prepared.current?.dispose();
      prepared.current = null;
      document.body.style.overflow = "";
      setPhase("error");
      (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset?.();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (sending) return;
    if (!valid) {
      setTried(true);
      // take the visitor to the first field that still needs something
      (!nameOk ? nameRef.current : !emailOk ? emailInputRef.current : !phoneOk ? phoneRef.current : areaRef.current)?.focus({ preventScroll: true });
      return;
    }
    send();
  }

  const nameLabel = t("lead.nameLabel");
  const emailLabel = t("lead.emailLabel");
  const phoneLabel = lang === "nl" ? "Jouw telefoonnummer (optioneel)" : "Your phone number (optional)";
  const ideaLabel = t("lead.ideaLabel");

  return (
    <form
      ref={formRef}
      className={`lf ${sending ? "is-collapsing" : ""} ${phase === "sent" ? "is-sent" : ""}`}
      name="contact"
      method="POST"
      action="/api/contact"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="lf-hidden">
        <label>
          {t("form.honeypot")} <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <input type="hidden" name="ts" ref={tsRef} />
      <input type="hidden" name="email" ref={emailRef} />
      <input type="hidden" name="message" ref={messageRef} />
      <input type="hidden" name="name" />
      <input type="hidden" name="phone" />
      <input type="hidden" name="lang" />

      <div
        className={`lf-row ${name ? "is-filled" : ""} ${tried && !nameOk ? "is-missing" : ""}`}
        style={{ ["--lf-i" as string]: 0 }}
        onClick={() => nameRef.current?.focus({ preventScroll: true })}
      >
        <span className="lf-icon" aria-hidden="true">
          <Icon kind="name" />
        </span>
        <label className="lf-sr" htmlFor="lf-name">
          {nameLabel}
        </label>
        <span className="lf-field">
          {!name && (
            <span className="lf-ghost" aria-hidden="true">
              {nameGhost}
              <i className="lf-caret" />
            </span>
          )}
          <input
            id="lf-name"
            ref={nameRef}
            className="lf-input"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                emailInputRef.current?.focus({ preventScroll: true });
              }
            }}
            aria-label={nameLabel}
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            disabled={sending}
          />
        </span>
      </div>

      <div
        className={`lf-row ${email ? "is-filled" : ""} ${tried && !emailOk ? "is-missing" : ""}`}
        style={{ ["--lf-i" as string]: 1 }}
        onClick={() => emailInputRef.current?.focus({ preventScroll: true })}
      >
        <span className="lf-icon" aria-hidden="true">
          <Icon kind="email" />
        </span>
        <label className="lf-sr" htmlFor="lf-email">
          {emailLabel}
        </label>
        <span className="lf-field">
          {!email && (
            <span className="lf-ghost" aria-hidden="true">
              {emailGhost}
              <i className="lf-caret" />
            </span>
          )}
          <input
            id="lf-email"
            ref={emailInputRef}
            className="lf-input"
            value={email}
            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                phoneRef.current?.focus({ preventScroll: true });
              }
            }}
            aria-label={emailLabel}
            inputMode="email"
            type="email"
            autoComplete="email"
            autoCapitalize="off"
            disabled={sending}
          />
        </span>
      </div>

      <div
        className={`lf-row ${phone ? "is-filled" : ""} ${tried && !phoneOk ? "is-missing" : ""}`}
        style={{ ["--lf-i" as string]: 2 }}
        onClick={() => phoneRef.current?.focus({ preventScroll: true })}
      >
        <span className="lf-icon" aria-hidden="true">
          <Icon kind="phone" />
        </span>
        <label className="lf-sr" htmlFor="lf-phone">
          {phoneLabel}
        </label>
        <span className="lf-field">
          {!phone && (
            <span className="lf-ghost" aria-hidden="true">
              {phoneGhost}
              <i className="lf-caret" />
            </span>
          )}
          <input
            id="lf-phone"
            ref={phoneRef}
            className="lf-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-()\s]/g, "").slice(0, 24))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                areaRef.current?.focus({ preventScroll: true });
              }
            }}
            aria-label={phoneLabel}
            inputMode="tel"
            type="tel"
            autoComplete="tel"
            disabled={sending}
          />
        </span>
      </div>

      <div
        className={`lf-row lf-row--idea ${idea ? "is-filled" : ""} ${tried && !ideaOk ? "is-missing" : ""}`}
        style={{ ["--lf-i" as string]: 3 }}
        onClick={() => areaRef.current?.focus({ preventScroll: true })}
      >
        <span className="lf-icon" aria-hidden="true">
          <Icon kind="idea" />
        </span>
        <label className="lf-sr" htmlFor="lf-idea">
          {ideaLabel}
        </label>
        <span className="lf-field">
          {!idea && (
            <span className="lf-ghost" aria-hidden="true">
              {ideaGhost}
              <i className="lf-caret" />
            </span>
          )}
          {/* the description wraps and grows, so a few sentences stay readable */}
          <textarea
            id="lf-idea"
            ref={areaRef}
            className="lf-area"
            rows={1}
            value={idea}
            onChange={(e) => setIdea(e.target.value.slice(0, 600))}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter starts a new line
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            aria-label={ideaLabel}
            autoCapitalize="sentences"
            spellCheck
            disabled={sending}
          />
        </span>
      </div>

      <div className="lf-below" style={{ ["--lf-i" as string]: 4 }}>
        <button className={`lf-send ${valid ? "is-ready" : ""}`} type="submit" disabled={sending}>
          {t("contact.form.submit")}
          <svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true">
            <path d="M1 6h11M8 1.5 12.5 6 8 10.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="lf-turnstile">
        <TurnstileWidget />
      </div>

      {phase === "sending" && (
        <div className="lf-stage" aria-live="polite">
          <p className="lf-status">{t("lead.sending")}</p>
        </div>
      )}
      {phase === "sent" && (
        <div className="lf-stage" aria-live="polite">
          <div className="lf-done">
            <p className="lf-done__label">{t("thankyou.label")}</p>
            <h2>{t("thankyou.headline")}</h2>
            <p className="lf-done__sub">{t("thankyou.sub")}</p>
            <TransitionLink to="/work" className="lf-send is-ready">
              {t("thankyou.seeWork")}
            </TransitionLink>
          </div>
        </div>
      )}
      {phase === "error" && !verifyFailed && (
        <p role="alert" className="lf-error">
          {t("lead.sendError")}
        </p>
      )}
      {verifyFailed && (
        <p role="alert" className="lf-error">
          {t("contact.form.verifyError")}
        </p>
      )}
    </form>
  );
}

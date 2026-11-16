import { useEffect, useRef, useState, type FormEvent } from "react";
import { TurnstileWidget, TURNSTILE_ENABLED } from "../TurnstileWidget";
import { useLanguage } from "../../hooks/useLanguage";
import "./lead-form.css";

/* The contact form, all at once and immersive: three huge inline fields (name, email, what you
   have in mind) one under the other, written in space (see ContactSpace). The field in use
   lights up, the others dim, and a single send button waits at the bottom. It posts to the same
   /api/contact endpoint as before, with the same spam checks (honeypot, timestamp and
   Turnstile); the name travels at the top of the message. */

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

const MIN_IDEA = 20;
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idea, setIdea] = useState("");
  const [sending, setSending] = useState(false);
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

  const prompts = PROMPTS[lang === "nl" ? "nl" : "en"];
  const nameGhost = useGhost(prompts.name, name === "");
  const emailGhost = useGhost(prompts.email, email === "");
  const phoneGhost = useGhost(prompts.phone, phone === "");
  const ideaGhost = useGhost(prompts.idea, idea === "");

  const nameOk = name.trim().length > 1;
  const emailOk = EMAIL_RE.test(email);
  // optional: empty is fine, but if it is filled in it has to look like a number
  const phoneOk = phone.trim() === "" || phone.replace(/\D/g, "").length >= 8;
  const ideaLen = idea.trim().length;
  const ideaOk = ideaLen >= MIN_IDEA;
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

  /* Turnstile fills its hidden input a moment after the page loads. Hold the post until the
     token is there (at most about 5 s, then send anyway and let the server decide). */
  function send() {
    const form = formRef.current;
    if (!form || sending) return;
    setSending(true);
    if (emailRef.current) emailRef.current.value = email;
    if (messageRef.current) {
      messageRef.current.value = `Name: ${name.trim()}${phone.trim() ? `\nPhone: ${phone.trim()}` : ""}\n\n${idea.trim()}`;
    }
    const hasToken = () =>
      Boolean((form.elements.namedItem("cf-turnstile-response") as HTMLInputElement | null)?.value);
    if (!TURNSTILE_ENABLED || hasToken()) return form.submit();
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (hasToken() || Date.now() - started > 5000) {
        window.clearInterval(timer);
        form.submit();
      }
    }, 150);
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
      className={`lf ${sending ? "is-sending" : ""}`}
      name="contact"
      method="POST"
      action="/api/contact"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="lf-hidden">
        <label>
          Don't fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <input type="hidden" name="ts" ref={tsRef} />
      <input type="hidden" name="email" ref={emailRef} />
      <input type="hidden" name="message" ref={messageRef} />

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

      {ideaLen > 0 && !ideaOk && (
        <p className={`lf-hint ${tried ? "is-error" : ""}`} aria-live="polite">
          {lang === "nl"
            ? `Nog ${MIN_IDEA - ideaLen} tekens, zodat we je goed kunnen helpen`
            : `${MIN_IDEA - ideaLen} more characters, so we can help you properly`}
        </p>
      )}

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

      {verifyFailed && (
        <p role="alert" className="lf-error">
          {t("contact.form.verifyError")}
        </p>
      )}
    </form>
  );
}

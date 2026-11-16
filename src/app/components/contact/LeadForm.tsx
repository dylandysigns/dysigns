import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { TurnstileWidget, TURNSTILE_ENABLED } from "../TurnstileWidget";
import { useLanguage } from "../../hooks/useLanguage";
import "./lead-form.css";

/* The contact form as a short conversation, after the hero concept design: one huge inline
   field that asks one thing at a time: your name, your email, then a description of what you
   have in mind. It posts to the same /api/contact endpoint as before, with the same spam
   checks (honeypot, timestamp and Turnstile); the name travels at the top of the message. */

type Step = "name" | "email" | "idea";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function LeadForm() {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("name");
  const [value, setValue] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [field, setField] = useState({ width: 0, scale: 1 });

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  // Stamped on mount so the server can tell a person from a bot posting straight to the endpoint.
  const tsRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  const typing = value !== "";
  const placeholder = step === "name" ? t("lead.name") : step === "email" ? t("lead.email") : t("lead.idea");
  const valid = step === "email" ? EMAIL_RE.test(value) : value.trim().length > (step === "name" ? 1 : 2);

  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
    setVerifyFailed(new URLSearchParams(window.location.search).get("error") === "verify");
  }, []);

  /* The field is as wide as its content, and shrinks to fit the space it has. */
  useLayoutEffect(() => {
    const fit = () => {
      const span = measureRef.current;
      const row = rowRef.current;
      if (!span || !row) return;
      span.textContent = value || placeholder;
      const w = span.offsetWidth + 6;
      const max = Math.max(160, (row.parentElement?.clientWidth ?? window.innerWidth) - 72);
      // a long description shrinks the type only so far; after that the field scrolls
      const scale = Math.max(0.36, Math.min(1, max / w));
      setField({ width: Math.min(w * scale, max), scale });
    };
    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [value, placeholder]);

  function onChange(raw: string) {
    if (step === "email") setValue(raw.replace(/\s/g, ""));
    else if (step === "name") setValue(raw.slice(0, 80));
    else setValue(raw.slice(0, 600));
  }

  function swapTo(next: Step, fill = "") {
    setSwapping(true);
    window.setTimeout(() => {
      setStep(next);
      setValue(fill);
      setSwapping(false);
    }, 175);
  }
  /* One step back, with what was typed there still in the field. What is in the current field
     is kept too, so going back to fix a typo does not cost the rest. */
  const [idea, setIdea] = useState("");
  function goBack() {
    if (swapping || sending || step === "name") return;
    if (step === "email") {
      setEmail(value);
      swapTo("name", name);
    } else {
      setIdea(value);
      swapTo("email", email);
    }
  }
  // after a step change the new field takes the focus (not on first load: the page is not hijacked)
  const firstStep = useRef(true);
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    (step === "idea" ? areaRef.current : inputRef.current)?.focus({ preventScroll: true });
  }, [step]);
  // the description grows with what is typed
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = "auto";
    area.style.height = `${area.scrollHeight}px`;
  }, [value, step]);

  /* Turnstile fills its hidden input a moment after the page loads. Hold the post until the
     token is there (at most about 5 s, then send anyway and let the server decide). */
  function send(idea: string) {
    const form = formRef.current;
    if (!form || sending) return;
    setSending(true);
    if (emailRef.current) emailRef.current.value = email;
    if (messageRef.current) {
      messageRef.current.value = `Name: ${name.trim()}\n\n${idea.trim()}`;
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
    if (!valid || swapping || sending) return;
    if (step === "name") {
      setName(value);
      swapTo("email", email);
    } else if (step === "email") {
      setEmail(value);
      swapTo("idea", idea);
    } else {
      send(value);
    }
  }

  const stepNo = step === "name" ? 1 : step === "email" ? 2 : 3;
  const label = step === "name" ? t("lead.nameLabel") : step === "email" ? t("lead.emailLabel") : t("lead.ideaLabel");

  return (
    <form
      ref={formRef}
      className={`lf lf--${step} ${typing ? "is-typing" : ""} ${sending ? "is-sending" : ""}`}
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

      <div className="lf-top">
        <button
          type="button"
          className={`lf-back ${step !== "name" ? "is-visible" : ""}`}
          tabIndex={step !== "name" ? 0 : -1}
          aria-hidden={step === "name"}
          onClick={goBack}
        >
          <svg width="12" height="10" viewBox="0 0 12 10" aria-hidden="true">
            <path d="M5 1 1 5l4 4M1.5 5H11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("lead.back")}
        </button>
        <p className="lf-step" aria-live="polite">
          {stepNo} / 3
          <span className="lf-sr">: {label}</span>
        </p>
        {/* keeps the step count in the middle */}
        <span className="lf-back lf-back--ghost" aria-hidden="true">
          {t("lead.back")}
        </span>
      </div>

      <div
        ref={rowRef}
        className={`lf-row ${typing ? "is-filled" : ""} ${swapping ? "is-swapping" : ""}`}
        style={{ ["--lf-scale" as string]: field.scale }}
        onClick={() => (step === "idea" ? areaRef.current : inputRef.current)?.focus({ preventScroll: true })}
      >
        <span className="lf-icon" aria-hidden="true">
          {step === "name" && (
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="23" fill="currentColor" />
              <circle cx="24" cy="19" r="7" fill="#000" />
              <path d="M10.5 38a14 14 0 0 1 27 0" fill="none" stroke="#000" strokeWidth="3.6" strokeLinecap="round" />
            </svg>
          )}
          {step === "email" && (
            <svg viewBox="0 0 48 48">
              <rect x="2" y="8" width="44" height="32" rx="7" fill="currentColor" />
              <path d="M9 16.5 24 27.5l15-11" fill="none" stroke="#000" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {step === "idea" && (
            <svg viewBox="0 0 48 48">
              <path d="M6 9h36a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H22l-10 8v-8H6a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z" fill="currentColor" />
              <path d="M13 19h22M13 26h14" fill="none" stroke="#000" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <label className="lf-sr" htmlFor="lf-input">
          {label}
        </label>
        {step === "idea" ? (
          // the description is a field of its own: it wraps and grows, so a few sentences stay readable
          <textarea
            id="lf-input"
            ref={areaRef}
            className="lf-area"
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, like the steps before it; Shift+Enter starts a new line
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            placeholder={placeholder}
            autoCapitalize="sentences"
            disabled={sending}
          />
        ) : (
          <input
            id="lf-input"
            ref={inputRef}
            className="lf-input"
            style={{ width: field.width }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={step === "email" ? "email" : "text"}
            type={step === "email" ? "email" : "text"}
            autoComplete={step === "email" ? "email" : step === "name" ? "name" : "off"}
            autoCapitalize={step === "idea" ? "sentences" : step === "name" ? "words" : "off"}
            spellCheck={step === "idea"}
            disabled={sending}
          />
        )}
      </div>

      <div className="lf-below">
        <button className={`lf-next ${valid && typing && !swapping ? "is-visible" : ""}`} type="submit" tabIndex={valid && typing ? 0 : -1}>
          {step === "idea" ? t("contact.form.submit") : t("lead.next")}
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
      <span className="lf-measure" ref={measureRef} aria-hidden="true" />
    </form>
  );
}

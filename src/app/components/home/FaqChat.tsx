import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { useFaqChat, type ChatMessage } from "../../hooks/useFaqChat";
import { renderInlineMarkdown } from "../../utils/inlineMarkdown";
import { TransitionLink } from "../TransitionLink";
import { Send2 } from "../faqIcons";
import logoMark from "../../../assets/dysigns_white.png";

const AI_STARTERS = {
  nl: ["Hoe pakken jullie AI-implementatie aan?", "Kunnen jullie een dashboard voor ons bouwen?", "Kunnen jullie zo'n chat voor mijn site bouwen?"],
  en: ["How do you approach AI implementation?", "Can you build a dashboard for us?", "Can you build a chat like this for my site?"],
};

/** The model is told not to use dashes; this catches the odd one anyway
 * (house style: no em or en dashes in site copy). */
function cleanText(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ", ");
}

/** The assistant's "face": the DYSIGNS mark, used as a CSS mask so it
 * takes the page's own foreground colour (house style: monochrome). It
 * breathes at rest, glows when the field has focus (via the parent's
 * data-state) and gets a spinning white halo, like an eclipse, while an
 * answer is being written. */
function AiOrb({ thinking = false, size = 22 }: { thinking?: boolean; size?: number }) {
  return (
    <span
      className={`ai-orb ${thinking ? "is-thinking" : ""}`}
      style={{ width: size, height: size, ["--logo" as string]: `url("${logoMark}")` }}
      aria-hidden="true"
    >
      <span className="ai-orb-mark" />
    </span>
  );
}

/** Keeps a cut from landing inside a "[label](/href)" link, which would
 * otherwise flash as raw markdown while the answer is being typed. */
function safeCut(text: string, n: number): number {
  for (const m of text.matchAll(/\[[^\]]*\]\([^)]*\)?/g)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start < n && n < end) return end;
  }
  return n;
}

/** Reveals an answer at a calm typing pace (with a short pause after a
 * sentence), whether it arrives all at once (FAQ fallback) or in fast
 * bursts from the model, so it reads like it is being written. */
function useTypewriter(text: string, enabled: boolean): string {
  const [shown, setShown] = useState(enabled ? 0 : text.length);
  useEffect(() => {
    if (!enabled || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(text.length);
      return;
    }
    if (shown >= text.length) return;
    const prev = text[shown - 1];
    const delay = prev && /[.!?]/.test(prev) ? 220 : prev === "," ? 90 : 26;
    const id = window.setTimeout(() => setShown((n) => safeCut(text, Math.min(text.length, n + 2))), delay);
    return () => window.clearTimeout(id);
  }, [text, shown, enabled]);
  return text.slice(0, Math.min(shown, text.length));
}

function Bubble({ msg, onAsk }: { msg: ChatMessage; onAsk: (q: string) => void }) {
  const { t } = useLanguage();
  const isUser = msg.role === "user";
  const typed = useTypewriter(msg.content, !isUser);
  const typing = !isUser && (msg.status === "streaming" || typed.length < msg.content.length);
  const thinking = msg.status === "streaming" && !msg.content;
  // One link per page, even when several matched questions live there.
  const sources = (msg.sources ?? []).filter(
    (s, i, all) => all.findIndex((o) => o.href === s.href) === i,
  );

  return (
    <div className={`faq-chat-row ${isUser ? "is-user" : ""}`}>
      {!isUser && <AiOrb thinking={typing} size={18} />}
      <div className="faq-chat-msg">
        {thinking ? (
          <span className="ai-thinking-text">{t("faq.chat.thinking")}</span>
        ) : (
          <div className="faq-chat-bubble">
            {isUser ? msg.content : renderInlineMarkdown(cleanText(typed))}
            {typing && <span className="faq-chat-caret" aria-hidden="true" />}
          </div>
        )}
        {!isUser && !typing && msg.suggestions && msg.suggestions.length > 0 && (
          <div className="faq-chat-suggest">
            {msg.suggestions.map((q) => (
              <button key={q} type="button" onClick={() => onAsk(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        {!isUser && !typing && sources.length > 0 && (
          <div className="faq-chat-sources">
            <span>{t("faq.chat.readMore")}</span>
            {sources.map((s) => (
              <TransitionLink key={s.id} to={s.href}>
                {s.label} →
              </TransitionLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AI chat on top of a FAQ. Answers are written by a chat model on
 * Cloudflare Workers AI from the site's own content (see
 * functions/api/faq-chat.js); when that endpoint is not reachable the
 * closest FAQ answer is shown instead. Purely additive: the full FAQ list
 * stays in the prerendered HTML.
 *
 * "default" (homepage): a single row styled like a FAQ question, with a
 * moving gradient stroke; the conversation opens above the field after
 * the first question. "ai" (AI service page): the same, plus a title and
 * starter questions, since there it is the live example.
 */
export function FaqChat({ variant = "default" }: { variant?: "default" | "ai" }) {
  const { lang, t } = useLanguage();
  const { messages, send, busy, limitReached } = useFaqChat(lang);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  // Short-lived flag for the send micro-interaction (button launch and a
  // white flash along the stroke); cleared after the animation.
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const started = messages.length > 0;
  const isAi = variant === "ai";
  const state = busy ? "thinking" : focused ? "active" : "idle";
  // Phones: the full prompt does not fit the field, so a short one.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 420px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Keep the newest text in view while an answer is typed out (the
  // typewriter changes the DOM without changing `messages`, hence the
  // MutationObserver), scrolling only the message list, never the page.
  // Stops following when the visitor scrolls up to reread something.
  const pinnedRef = useRef(true);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    // Only scrolling the visitor does themself (wheel, touch, keys) can
    // unpin; our own scrollTop updates fire scroll events too and must
    // not count as "the visitor scrolled up".
    let userScrolling = false;
    const markUser = () => {
      userScrolling = true;
    };
    const onScroll = () => {
      if (!userScrolling) return;
      userScrolling = false;
      pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    };
    const observer = new MutationObserver(() => {
      if (pinnedRef.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", markUser, { passive: true });
    el.addEventListener("touchmove", markUser, { passive: true });
    el.addEventListener("keydown", markUser);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", markUser);
      el.removeEventListener("touchmove", markUser);
      el.removeEventListener("keydown", markUser);
    };
  }, [started]);

  // A new question always brings the conversation back to the bottom.
  useEffect(() => {
    pinnedRef.current = true;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const submit = (text: string) => {
    if (!text.trim() || busy || limitReached) return;
    send(text);
    setDraft("");
    setSending(true);
    window.setTimeout(() => setSending(false), 700);
  };

  return (
    <div className={`faq-ask ${isAi ? "is-ai mb-12" : ""} ${sending ? "is-sending" : ""}`} data-state={state}>
      <div className="faq-ask-inner">
        {isAi && (
          <div className="faq-chat-head">
            <p className="faq-chat-title">{t("faq.chat.aiTitle")}</p>
            <p className="faq-chat-sub">{t("faq.chat.aiSubtitle")}</p>
          </div>
        )}

        {started && (
          <div ref={listRef} className="faq-chat-list" aria-live="polite" aria-busy={busy}>
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} onAsk={submit} />
            ))}
            {limitReached && !busy && (
              <p className="faq-chat-note">
                {t("faq.chat.limit")}{" "}
                <TransitionLink to="/contact">{t("faq.chat.contact")}</TransitionLink>
              </p>
            )}
          </div>
        )}

        {isAi && !started && (
          <div className="faq-chat-starters">
            {AI_STARTERS[lang].map((q) => (
              <button key={q} type="button" onClick={() => submit(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        <form
          className={`faq-ask-form ${started ? "has-list" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
        >
          <AiOrb thinking={busy} size={isAi ? 22 : 26} />
          <label htmlFor={`faq-chat-input-${variant}`} className="sr-only">
            {t("faq.chat.label")}
          </label>
          <input
            id={`faq-chat-input-${variant}`}
            type="text"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={500}
            value={draft}
            disabled={limitReached}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t(isAi ? "faq.chat.placeholder" : narrow ? "faq.chat.placeholderShort" : "faq.chat.placeholderCompact")}
          />
          <button
            type="submit"
            className={`${draft.trim() ? "is-ready" : ""} ${sending ? "is-launching" : ""}`}
            disabled={busy || limitReached || !draft.trim()}
            aria-label={t("faq.chat.send")}
          >
            <Send2 size={14} color="var(--page-bg)" />
          </button>
        </form>
      </div>

      <style>{`
        /* ── Card with a moving gradient stroke ──
           The 1px padding is the stroke: an oversized conic gradient
           behind the card rotates, and only its edge shows. Faster and
           brighter on focus, fastest while thinking. */
        .faq-ask {
          position: relative; isolation: isolate; overflow: hidden;
          border-radius: 1rem; padding: 1px;
          background: rgba(var(--page-fg-rgb), .16);
          animation: faq-ask-glow 4s ease-in-out infinite;
        }
        .faq-ask::before {
          content: ""; position: absolute; inset: -250%; z-index: -1;
          /* Two light arcs on opposite sides, so the stroke is always
             visibly moving somewhere along the card. */
          background: conic-gradient(from 0deg,
            transparent 0deg 70deg, rgba(var(--page-fg-rgb), .2) 110deg, var(--page-fg) 160deg, transparent 180deg,
            transparent 180deg 250deg, rgba(var(--page-fg-rgb), .2) 290deg, var(--page-fg) 340deg, transparent 360deg);
          opacity: .8; animation: faq-ask-spin 7s linear infinite;
          transition: opacity .4s ease;
        }
        .faq-ask[data-state="active"]::before { opacity: .95; animation-duration: 3.2s; }
        .faq-ask[data-state="thinking"]::before { opacity: 1; animation-duration: 1.3s; }
        .faq-ask-inner {
          position: relative; border-radius: calc(1rem - 1px);
          background: linear-gradient(135deg, rgba(var(--page-fg-rgb), .09), rgba(var(--page-fg-rgb), .03)), var(--page-bg);
        }
        .faq-ask.is-ai .faq-ask-inner { padding: 1rem; }
        @keyframes faq-ask-spin { to { transform: rotate(360deg); } }
        @keyframes faq-ask-glow {
          0%, 100% { box-shadow: 0 0 14px 0 rgba(var(--page-fg-rgb), .05); }
          50% { box-shadow: 0 0 32px 2px rgba(var(--page-fg-rgb), .13); }
        }

        /* ── The field: one row, like a FAQ question ── */
        .faq-ask-form { display: flex; align-items: center; gap: .85rem; padding: .65rem .65rem .65rem 1.15rem; min-height: 68px; }
        .faq-ask-form.has-list { border-top: 1px solid rgba(var(--page-fg-rgb), .07); }
        .faq-ask.is-ai .faq-ask-form {
          border-radius: 999px; border: 1px solid rgba(var(--page-fg-rgb), .1);
          background: rgba(var(--page-fg-rgb), .03);
        }
        .faq-ask-form input {
          flex: 1; min-width: 0; background: transparent; border: 0; outline: none;
          font-family: var(--font-brand); font-size: 16px; font-weight: 500; color: var(--page-fg);
        }
        @media (hover: hover) and (pointer: fine) { .faq-ask-form input { font-size: 1rem; } }
        @media (max-width: 480px) {
          .faq-ask-form { gap: .55rem; padding-left: .8rem; }
          .faq-ask-form input::placeholder { font-size: .8rem !important; }
        }
        .faq-ask-form input::placeholder { color: rgba(var(--page-fg-rgb), .75); font-size: .95rem; font-weight: 600; transition: color .3s ease; }
        .faq-ask[data-state="active"] .faq-ask-form input::placeholder { color: rgba(var(--page-fg-rgb), .4); }
        .faq-ask-form button {
          width: 38px; height: 38px; flex-shrink: 0; border-radius: 999px; display: grid; place-items: center;
          background: var(--page-fg); opacity: .35; transform: scale(.9);
          transition: opacity .25s ease, transform .35s cubic-bezier(.34,1.56,.64,1);
        }
        .faq-ask-form button.is-ready { opacity: 1; transform: scale(1); }
        .faq-ask-form button.is-ready:hover { transform: scale(1.08); }
        .faq-ask-form button.is-ready:active { transform: scale(.94); }
        /* Send: the arrow flies off to the top right and drops back in
           from the bottom left, while the stroke flashes once. */
        .faq-ask-form button.is-launching { opacity: 1; transform: scale(1); overflow: hidden; }
        .faq-ask-form button.is-launching svg { animation: faq-send-launch .65s cubic-bezier(.5,0,.2,1); }
        @keyframes faq-send-launch {
          0% { transform: none; opacity: 1; }
          40% { transform: translate(16px, -16px) scale(.8); opacity: 0; }
          41% { transform: translate(-16px, 16px) scale(.8); opacity: 0; }
          100% { transform: none; opacity: 1; }
        }
        .faq-ask.is-sending { animation: faq-ask-flash .7s ease-out; }
        .faq-ask.is-sending::before { opacity: 1; }
        @keyframes faq-ask-flash {
          0% { box-shadow: 0 0 0 0 rgba(var(--page-fg-rgb), .35); }
          100% { box-shadow: 0 0 0 10px rgba(var(--page-fg-rgb), 0); }
        }

        /* ── AI mark (DYSIGNS logo) ── */
        .ai-orb { position: relative; flex-shrink: 0; display: grid; place-items: center; }
        /* Idle: a slow, small sway plus a light sweep across the mark
           every few seconds. Subtle enough to read as "alive", not busy. */
        .ai-orb-mark {
          width: 100%; height: 100%; opacity: .9;
          background: linear-gradient(110deg, rgba(var(--page-fg-rgb), .6) 35%, var(--page-fg) 50%, rgba(var(--page-fg-rgb), .6) 65%);
          background-size: 300% 100%; background-position: 120% 0;
          -webkit-mask: var(--logo) center / contain no-repeat; mask: var(--logo) center / contain no-repeat;
          animation: ai-mark-sway 7s ease-in-out infinite, ai-mark-shine 5s ease-in-out infinite;
          transition: opacity .3s ease, filter .4s ease;
        }
        @keyframes ai-mark-sway {
          0%, 100% { transform: rotate(0deg) scale(1); }
          30% { transform: rotate(-8deg) scale(1.05); }
          60% { transform: rotate(4deg) scale(.98); }
        }
        @keyframes ai-mark-shine { 0%, 55% { background-position: 120% 0; } 100% { background-position: -120% 0; } }
        .faq-ask[data-state="active"] .ai-orb-mark { opacity: 1; filter: drop-shadow(0 0 6px rgba(var(--page-fg-rgb), .55)); }
        /* Thinking: a thin white arc spins around the mark (eclipse halo)
           while the mark itself pulses. */
        .ai-orb::before {
          content: ""; position: absolute; inset: -6px; border-radius: 50%; opacity: 0;
          background: conic-gradient(from 0deg, transparent 0 55%, rgba(var(--page-fg-rgb), .25) 70%, var(--page-fg) 92%, transparent 100%);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1px));
          transition: opacity .3s ease;
        }
        .ai-orb.is-thinking::before { opacity: 1; animation: faq-ask-spin .9s linear infinite; }
        .ai-orb.is-thinking .ai-orb-mark { opacity: 1; animation: ai-orb-think 1.2s ease-in-out infinite, ai-mark-shine 1.2s linear infinite; }
        @keyframes ai-orb-think {
          0%, 100% { transform: scale(.9); filter: drop-shadow(0 0 0 rgba(var(--page-fg-rgb), 0)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 7px rgba(var(--page-fg-rgb), .7)); }
        }

        /* ── Conversation ── */
        .faq-chat-head { padding: .2rem .3rem .9rem; }
        .faq-chat-title { font-family: var(--font-brand); font-weight: 600; font-size: .95rem; color: var(--page-fg); }
        .faq-chat-sub { font-size: .8rem; color: rgba(var(--page-fg-rgb), .5); margin-top: .1rem; }
        .faq-chat-list {
          /* Fixed height: the conversation scrolls inside the card, so the
             page around it never grows or jumps while answers stream in. */
          display: flex; flex-direction: column; gap: .9rem; height: min(300px, 50vh); overflow-y: auto;
          scrollbar-width: thin; scrollbar-color: rgba(var(--page-fg-rgb), .2) transparent;
          padding: 1rem; overscroll-behavior: contain; scroll-behavior: auto;
        }
        .faq-chat-row { display: flex; align-items: flex-start; gap: .6rem; animation: faq-chat-in .35s ease both; }
        .faq-chat-row .ai-orb { margin-top: .6rem; }
        .faq-chat-row.is-user { justify-content: flex-end; }
        .faq-chat-msg { display: flex; flex-direction: column; gap: .4rem; max-width: 88%; min-width: 0; }
        .faq-chat-row.is-user .faq-chat-msg { align-items: flex-end; }
        .faq-chat-bubble {
          padding: .7rem .9rem; border-radius: 1rem; font-size: .88rem; line-height: 1.6;
          color: rgba(var(--page-fg-rgb), .85); background: rgba(var(--page-fg-rgb), .05);
          border: 1px solid rgba(var(--page-fg-rgb), .07); white-space: pre-wrap; overflow-wrap: anywhere;
        }
        .faq-chat-row.is-user .faq-chat-bubble { color: var(--page-bg); background: var(--page-fg); border-color: transparent; }
        @keyframes faq-chat-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

        /* White shimmer sweeping over "Thinking..." */
        .ai-thinking-text {
          display: inline-block; padding: .55rem 0; font-size: .88rem; font-weight: 500;
          background: linear-gradient(90deg, rgba(var(--page-fg-rgb), .3) 0%, rgba(var(--page-fg-rgb), .3) 35%, var(--page-fg) 50%, rgba(var(--page-fg-rgb), .3) 65%, rgba(var(--page-fg-rgb), .3) 100%);
          background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: ai-shimmer 1.6s linear infinite;
        }
        @keyframes ai-shimmer { from { background-position: 100% 0; } to { background-position: -150% 0; } }
        .faq-chat-caret {
          display: inline-block; width: .45em; height: 1em; margin-left: .15em; vertical-align: -.15em;
          background: rgba(var(--page-fg-rgb), .6); animation: faq-chat-blink 1s steps(2) infinite;
        }
        @keyframes faq-chat-blink { to { opacity: 0; } }
        .faq-chat-sources { display: flex; flex-wrap: wrap; gap: .35rem .8rem; padding-left: .2rem; font-size: .75rem; }
        .faq-chat-sources span { color: rgba(var(--page-fg-rgb), .4); }
        .faq-chat-sources a, .faq-chat-note a { color: rgba(var(--page-fg-rgb), .65); text-decoration: underline; text-underline-offset: 3px; }
        .faq-chat-sources a:hover, .faq-chat-note a:hover { color: var(--page-fg); }
        .faq-chat-suggest { display: flex; flex-wrap: wrap; gap: .4rem; animation: faq-chat-in .35s ease both; }
        .faq-chat-suggest button {
          font-size: .78rem; padding: .4rem .75rem; border-radius: 999px; text-align: left;
          color: rgba(var(--page-fg-rgb), .8); border: 1px solid rgba(var(--page-fg-rgb), .14);
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }
        .faq-chat-suggest button:hover { background: rgba(var(--page-fg-rgb), .08); color: var(--page-fg); transform: translateY(-1px); }
        .faq-chat-note { font-size: .8rem; color: rgba(var(--page-fg-rgb), .55); }
        .faq-chat-starters { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0 .2rem .9rem; }
        .faq-chat-starters button {
          font-size: .8rem; padding: .5rem .85rem; border-radius: 999px; color: rgba(var(--page-fg-rgb), .75);
          border: 1px solid rgba(var(--page-fg-rgb), .12); background: transparent;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }
        .faq-chat-starters button:hover { background: rgba(var(--page-fg-rgb), .07); color: var(--page-fg); transform: translateY(-1px); }

        @media (prefers-reduced-motion: reduce) {
          .faq-ask-form button svg,
          .faq-ask, .faq-ask::before, .ai-orb-mark, .ai-orb::before, .faq-chat-row, .ai-thinking-text, .faq-chat-caret { animation: none !important; }
          .ai-thinking-text { color: rgba(var(--page-fg-rgb), .6); background: none; }
        }
      `}</style>
    </div>
  );
}

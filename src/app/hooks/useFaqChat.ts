import { useCallback, useEffect, useRef, useState } from "react";
import contentEntries from "virtual:content";
import { buildFaqIndex, type FaqIndexItem, type FaqLang } from "../content/faqIndex";
import { searchFaqLocal } from "../utils/faqSearch";

export interface ChatSource {
  id: string;
  question: string;
  href: string;
  label: string;
  isHome: boolean;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  /** Follow-up questions offered as buttons (local answers only). */
  suggestions?: string[];
  /** streaming: tokens still arriving; fallback: answered from the local
   * FAQ match because the AI endpoint was not reachable. */
  status?: "streaming" | "done" | "fallback";
  /** Id of the logged answer, for the thumbs up or down; only on answers the AI wrote. */
  rid?: string;
  rating?: 1 | -1;
}

/** Visitor questions per page visit; after that the chat points to contact. */
export const MAX_QUESTIONS = 10;

/** The "thinking" animation always shows for at least this long, also
 * when the answer is ready instantly (local FAQ fallback), so sending a
 * question visibly does something; the answer is then typed out (see
 * useTypewriter in FaqChat.tsx). Skipped for reduced motion. */
const MIN_THINK_MS = 1800;
// A little variation, so it does not feel like a fixed timer.
const THINK_JITTER_MS = 700;

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, Math.max(0, ms)));

let indexCache: FaqIndexItem[] | null = null;
function getIndex(): FaqIndexItem[] {
  if (!indexCache) indexCache = buildFaqIndex(contentEntries);
  return indexCache;
}

// Set after the first 404/503 (local dev, or no Workers AI binding yet):
// answer locally for the rest of the visit instead of retrying.
let aiUnavailable = false;

const WHATSAPP = "https://wa.me/31626814488";

const FALLBACK_TEXT = {
  nl: {
    none: "Daar heb ik geen kant-en-klaar antwoord op, maar misschien helpt een van deze vragen. Of stel je vraag direct via [WhatsApp](" + WHATSAPP + ") of [de contactpagina](/nl/contact), dan reageren we snel.",
  },
  en: {
    none: "I do not have a ready answer to that, but one of these questions might help. Or ask us directly via [WhatsApp](" + WHATSAPP + ") or [the contact page](/contact) and we will get back to you quickly.",
  },
};

/** Small talk the chat answers itself, without a model call (also when
 * the AI is live: it is instant, consistent and costs nothing). */
const SMALL_TALK: { pattern: RegExp; answer: Record<FaqLang, string> }[] = [
  {
    pattern: /(met wie (praat|spreek|chat)|wie ben (je|jij)|ben (je|jij) (een )?(bot|robot|mens|ai|echt)|praat ik met een (mens|bot|robot)|who am i (talking|speaking|chatting)|who are you|are you (a )?(bot|robot|human|real|ai))/i,
    answer: {
      nl: "Je praat met de AI-assistent van DYSIGNS. Ik geef antwoord op basis van wat er op onze website staat, over onze diensten, prijzen en werkwijze. Wil je liever een mens spreken? Stuur ons een [appje](" + WHATSAPP + ") of ga naar [de contactpagina](/nl/contact).",
      en: "You are talking to the DYSIGNS AI assistant. I answer from what is on our website, about our services, pricing and way of working. Would you rather talk to a person? Send us a [WhatsApp](" + WHATSAPP + ") or go to [the contact page](/contact).",
    },
  },
  {
    // short "how do I reach you" questions, also badly typed ("contact how"): a direct answer
    // beats a lucky FAQ match, and it must work without the AI too
    pattern: /^(?!.*\b(kost|kosten|prijs|price|cost|duurt|long|lang)\b)(?:\W*\w+){0,6}?\W*(contact|contacteren|bereik|bereiken|bereikbaar|reach|get in touch|in touch|bellen|call|mailen|e-?mail|whatsapp|appen|spreken|talk to)\b(?:\W*\w+){0,5}\W*$/i,
    answer: {
      nl: "Je bereikt ons het snelst via [WhatsApp](" + WHATSAPP + "), of stuur een bericht via [de contactpagina](/nl/contact). Mailen kan ook: [info@dylandysigns.com](mailto:info@dylandysigns.com).",
      en: "The quickest way to reach us is [WhatsApp](" + WHATSAPP + "), or send a message via [the contact page](/contact). Email works too: [info@dylandysigns.com](mailto:info@dylandysigns.com).",
    },
  },
  {
    pattern: /^(hoi|hallo|hey|hee|hi|hello|yo|goedemorgen|goedemiddag|goedenavond|good (morning|afternoon|evening))\b[\s!.,?]*(daar|there)?[\s!.?]*$/i,
    answer: {
      nl: "Hoi! Waar kan ik je mee helpen? Vraag me gerust iets over onze diensten, prijzen of hoe we werken.",
      en: "Hi! What can I help you with? Feel free to ask about our services, pricing or how we work.",
    },
  },
  {
    pattern: /^(dank( je| u)?( wel)?|bedankt|thanks|thank you|thx|top|super|perfect|helder|duidelijk)\b[\s!.]*$/i,
    answer: {
      nl: "Graag gedaan! Is er nog iets anders waar ik je mee kan helpen?",
      en: "You are welcome! Is there anything else I can help you with?",
    },
  },
];

/** Asked when nothing matches: the most common questions. */
const POPULAR: Record<FaqLang, string[]> = {
  nl: ["Hoeveel kost een website of webshop?", "Welke platforms gebruiken jullie?", "Hoe vraag ik een offerte aan?"],
  en: ["How much does a website or online store cost?", "Which platforms do you build on?", "How do I request a quote?"],
};

function toSource(item: FaqIndexItem): ChatSource {
  return { id: item.id, question: item.question, href: item.href, label: item.pageLabel, isHome: item.isHome };
}

/** Pulls the text tokens out of a Workers AI server-sent-events chunk.
 * Handles both the classic {"response": "..."} shape and the
 * OpenAI-style {"choices":[{"delta":{"content":"..."}}]} shape. */
function parseSse(buffer: string): { tokens: string; rest: string; done: boolean } {
  const lines = buffer.split("\n");
  const rest = lines.pop() ?? "";
  let tokens = "";
  let done = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const payload = trimmed.slice(5).trim();
    if (payload === "[DONE]") {
      done = true;
      continue;
    }
    try {
      const obj = JSON.parse(payload);
      const t = obj?.response ?? obj?.choices?.[0]?.delta?.content ?? "";
      if (typeof t === "string") tokens += t;
    } catch {
      // Partial or non-JSON line: skip it.
    }
  }
  return { tokens, rest, done };
}

export function useFaqChat(lang: FaqLang) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(1);

  useEffect(() => () => abortRef.current?.abort(), []);

  // A language switch is a fresh page: start a fresh conversation.
  useEffect(() => {
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  }, [lang]);

  const update = (id: number, patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) =>
    setMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)),
    );

  const answerLocally = async (assistantId: number, question: string, minThink: () => Promise<void>) => {
    await minThink();
    const items = getIndex().filter((i) => i.lang === lang);
    const matches = searchFaqLocal(items, question, 3);
    const [best, ...others] = matches;
    const text = FALLBACK_TEXT[lang];
    if (!best || best.score < 0.35) {
      // No dead end: offer the closest (weak) matches, or the most asked
      // questions, as buttons.
      const suggestions = [...new Set([...matches.map((m) => m.item.question), ...POPULAR[lang]])].slice(0, 3);
      update(assistantId, { content: text.none, status: "fallback", sources: [], suggestions });
      return;
    }
    // Most FAQ answers already pick up the question ("You request a quote
    // by ..."), so they are shown as they are. Answers that open with a
    // bare "Yes." / "Both." only make sense next to their question, so
    // those get it in front.
    const bare = /^(ja|nee|beide|yes|no|both)\b[.,]/i.test(best.item.answer.trim());
    update(assistantId, {
      content: bare ? `${best.item.question}\n\n${best.item.answer}` : best.item.answer,
      status: "fallback",
      sources: [best, ...others].filter((r) => !r.item.isHome).slice(0, 2).map((r) => toSource(r.item)),
    });
  };

  const send = useCallback(
    async (raw: string) => {
      const question = raw.replace(/\s+/g, " ").trim().slice(0, 500);
      if (!question || busy) return;

      const userMsg: ChatMessage = { id: nextId.current++, role: "user", content: question };
      const assistantId = nextId.current++;
      const history = [...messages, userMsg];
      setMessages([...history, { id: assistantId, role: "assistant", content: "", status: "streaming" }]);
      setBusy(true);
      const smallTalk = SMALL_TALK.find((s) => s.pattern.test(question));
      const startedAt = performance.now();
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const thinkFor = MIN_THINK_MS + Math.random() * THINK_JITTER_MS;
      const minThink = () => (reduced ? Promise.resolve() : wait(thinkFor - (performance.now() - startedAt)));

      if (smallTalk) {
        await minThink();
        update(assistantId, { content: smallTalk.answer[lang], status: "done", sources: [] });
        setBusy(false);
        return;
      }

      if (aiUnavailable) {
        await answerLocally(assistantId, question, minThink);
        setBusy(false);
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/faq-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            page: window.location.pathname,
            messages: history
              .filter((m) => m.content && m.status !== "fallback")
              .map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          // 429: the daily or monthly AI budget is used up; answer from
          // the FAQ for the rest of this visit.
          if ([404, 405, 429, 503].includes(res.status)) aiUnavailable = true;
          await answerLocally(assistantId, question, minThink);
          return;
        }

        let sources: ChatSource[] = [];
        try {
          sources = JSON.parse(decodeURIComponent(res.headers.get("X-Faq-Sources") ?? "[]"));
        } catch {
          sources = [];
        }

        const rid = res.headers.get("X-Faq-Id") ?? undefined;
        await minThink();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let received = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSse(buffer);
          buffer = parsed.rest;
          if (parsed.tokens) {
            received += parsed.tokens;
            const snapshot = received;
            update(assistantId, { content: snapshot });
          }
          if (parsed.done) break;
        }

        if (!received.trim()) await answerLocally(assistantId, question, minThink);
        else update(assistantId, { status: "done", sources: sources.filter((s) => !s.isHome), rid });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        await answerLocally(assistantId, question, minThink);
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setBusy(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [busy, messages, lang],
  );

  /** Thumbs up (1) or down (-1) on an answer. Fire and forget: a failed rating never bothers the visitor. */
  const rate = useCallback((id: number, rid: string, rating: 1 | -1) => {
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, rating } : m)));
    fetch("/api/faq-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rid, rating }),
    }).catch(() => {});
  }, []);

  const questionsAsked = messages.filter((m) => m.role === "user").length;

  return { messages, send, rate, busy, limitReached: questionsAsked >= MAX_QUESTIONS };
}

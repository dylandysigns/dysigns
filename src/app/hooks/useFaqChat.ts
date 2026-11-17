import { useCallback, useEffect, useRef, useState } from "react";
import contentEntries from "virtual:content";
import { buildFaqIndex, type FaqIndexItem, type FaqLang } from "../content/faqIndex";
import { searchFaqLocal } from "../utils/faqSearch";
import { detectLang, requestedLang } from "../../shared/detectLang.js";

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
  /** Follow-up questions offered as buttons, under the latest answer only. */
  suggestions?: string[];
  /** streaming: tokens still arriving; fallback: answered from the local
   * FAQ match because the AI endpoint was not reachable. */
  status?: "streaming" | "done" | "fallback";
  /** Id of the logged answer, for the thumbs up or down; only on answers the AI wrote. */
  rid?: string;
  rating?: 1 | -1;
  /** Brought back from earlier in the visit (see loadChat): shown as it is, not typed out again. */
  restored?: boolean;
}

/** Visitor questions per page visit; after that the chat points to contact. */
export const MAX_QUESTIONS = 10;

/** The "thinking" animation always shows for at least this long, also
 * when the answer is ready instantly (local FAQ fallback), so sending a
 * question visibly does something; the answer is then typed out (see
 * useTypewriter in FaqChat.tsx). Skipped for reduced motion. */
const MIN_THINK_MS = 650;
// A little variation, so it does not feel like a fixed timer.
const THINK_JITTER_MS = 350;

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
const SMALL_TALK: { pattern: RegExp; answer: Record<FaqLang, string>; suggest?: Record<FaqLang, string[]> }[] = [
  {
    // "Spreek je Nederlands?", "Praat nu Nederlands met me", "Can you speak English?": answered in
    // the language asked for (see detectLang), and the rest of the chat stays in it
    pattern: /^(?=.*\b(nederlands|dutch|engels|english|vlaams)\b)(?!.*\b(kost|kosten|prijs|price|cost|website|webshop|shopify|logo|offerte|quote)\b).{0,80}$/i,
    answer: {
      nl: "Zeker, ik praat verder in het Nederlands. Waar kan ik je mee helpen? Vraag gerust iets over onze diensten, prijzen of hoe we werken.",
      en: "Sure, I will continue in English. What can I help you with? Feel free to ask about our services, pricing or how we work.",
    },
  },
  {
    // "Spreek je Nederlands?", "Praat nu Nederlands met me", "Can you speak English?": answered in
    // the language asked for (see detectLang), and the rest of the chat stays in it
    pattern: /^(?=.*\b(nederlands|dutch|engels|english|vlaams)\b)(?!.*\b(kost|kosten|prijs|price|cost|website|webshop|shopify|logo|offerte|quote)\b).{0,80}$/i,
    answer: {
      nl: "Zeker, ik praat verder in het Nederlands. Waar kan ik je mee helpen? Vraag gerust iets over onze diensten, prijzen of hoe we werken.",
      en: "Sure, I will continue in English. What can I help you with? Feel free to ask about our services, pricing or how we work.",
    },
  },
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
  // Two of the DYSIGNS agent's starting questions (FaqChat.tsx) are open questions no single FAQ answers.
  // They get a fixed answer, made only of what the site itself says, with links to the right pages, so
  // they are answered well also when the AI is not available.
  {
    pattern: /^\W*(hoe|how)\b.{0,30}\b(meer klanten|more customers|more clients)\b.{0,25}$/i,
    answer: {
      nl: "Meer klanten online begint bij een site die snel is, goed vindbaar en bezoekers duidelijk naar een aanvraag of aankoop leidt; technische SEO zit standaard in elke [website](/nl/web-design/) die we bouwen. Daarna brengen [social media en Meta Ads](/nl/social-media-meta-ads/) nieuwe mensen binnen, en sturen we bij op de cijfers. Omdat we zelf de site bouwen en de campagnes draaien, zien we waar het blijft hangen als de cijfers bewegen. [Vertel ons waar je nu staat](/nl/contact/), dan denken we mee.",
      en: "More customers online starts with a site that is fast, easy to find and leads visitors clearly to an enquiry or a purchase; technical SEO comes as standard in every [website](/web-design/) we build. Then [social media and Meta Ads](/social-media-meta-ads/) bring in new people, and we adjust on the numbers. Because we build the site and run the campaigns ourselves, we see where things get stuck when the numbers move. [Tell us where you are now](/contact/) and we will think along.",
    },
    suggest: {
      nl: ["Wat kost social media en Meta Ads-beheer?", "Hoe lang duurt het voordat een campagne echt resultaat laat zien?", "Hoeveel kost een website of webshop?"],
      en: ["How much does social media and Meta Ads management cost?", "How long before a campaign shows real results?", "How much does a website or online store cost?"],
    },
  },
  {
    pattern: /^\W*(wat kunnen jullie|wat doen jullie|what can you|what do you do)\b.{0,40}$/i,
    answer: {
      nl: "We zijn één vast team van ontwerp tot livegang en daarna. We ontwerpen en bouwen [websites](/nl/web-design/), [Shopify webshops](/nl/shopify-development/) en apps, maken [branding](/nl/branding/) en [UX/UI-design](/nl/ux-ui-design/), en na de lancering doen we [social media en Meta Ads](/nl/social-media-meta-ads/) en [AI-oplossingen](/nl/ai-implementation/) zoals automatisering en een AI-chat zoals deze. Waar wil je mee beginnen?",
      en: "We are one steady team from design to launch and beyond. We design and build [websites](/web-design/), [Shopify stores](/shopify-development/) and apps, create [branding](/branding/) and [UX/UI design](/ux-ui-design/), and after launch we run [social media and Meta Ads](/social-media-meta-ads/) and [AI solutions](/ai-implementation/) such as automation and an AI chat like this one. Where would you like to start?",
    },
    suggest: {
      nl: ["Doen jullie ook kleine projecten?", "Hoeveel kost een website of webshop?", "Wat moet ik voorbereiden voor het eerste gesprek?"],
      en: ["Do you also take on small projects?", "How much does a website or online store cost?", "What should I prepare for the first conversation?"],
    },
  },
];

/** Asked when nothing matches: the most common questions. */
const POPULAR: Record<FaqLang, string[]> = {
  nl: ["Hoeveel kost een website of webshop?", "Doen jullie ook kleine projecten?", "Hoe vraag ik een offerte aan?"],
  en: ["How much does a website or online store cost?", "Do you also take on small projects?", "How do I request a quote?"],
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

/** What a persisted conversation looks like in sessionStorage. */
type SavedChat = { lang: FaqLang; messages: ChatMessage[] };

function loadChat(key: string | undefined, lang: FaqLang): ChatMessage[] {
  if (!key) return [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) ?? "null") as SavedChat | null;
    if (!saved || saved.lang !== lang || !Array.isArray(saved.messages)) return [];
    // an answer that was still being written when the page changed is left out
    return saved.messages
      .filter((m) => m.role === "user" || (m.status !== "streaming" && m.content))
      .map((m) => ({ ...m, restored: true }));
  } catch {
    return [];
  }
}

/** `persistKey`: keep the conversation in sessionStorage under this key, so it is still there after
 * a link in an answer took the visitor to another page and they come back (the DYSIGNS agent). */
export function useFaqChat(lang: FaqLang, persistKey?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat(persistKey, lang));
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const nextId = useRef(messages.reduce((n, m) => Math.max(n, m.id + 1), 1));

  useEffect(() => () => abortRef.current?.abort(), []);

  // A language switch is a fresh page: start a fresh conversation (not on the first render, which
  // may just have brought a saved one back).
  const langRef = useRef(lang);
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    abortRef.current?.abort();
    setMessages([]);
    setBusy(false);
  }, [lang]);

  // keep it, once an answer is complete
  useEffect(() => {
    if (!persistKey || busy) return;
    try {
      const data: SavedChat = { lang, messages: messages.slice(-24) };
      sessionStorage.setItem(persistKey, JSON.stringify(data));
    } catch {
      /* private mode: the conversation simply is not kept */
    }
  }, [messages, busy, lang, persistKey]);

  const update = (id: number, patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) =>
    setMessages((list) =>
      list.map((m) => (m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m)),
    );

  const answerLocally = async (assistantId: number, question: string, minThink: () => Promise<void>, lang: FaqLang) => {
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
      // related questions only from the same page as the answer (not from an unrelated service page)
      suggestions: [...new Set([...others.filter((m) => m.item.href === best.item.href).map((m) => m.item.question), ...POPULAR[lang]])]
        .filter((q) => q !== best.item.question && q.toLowerCase() !== question.toLowerCase())
        .slice(0, 3),
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
      // The visitor's own words (or an explicit "praat Nederlands") decide the answer language;
      // the site language is only the default. Same rule as the AI endpoint.
      const userTurns = history.filter((m) => m.role === "user").map((m) => m.content);
      const replyLang: FaqLang = detectLang(userTurns, lang);
      const smallTalk = SMALL_TALK.find((s) => s.pattern.test(question) && (s !== SMALL_TALK[0] || requestedLang(question)));
      const startedAt = performance.now();
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const thinkFor = MIN_THINK_MS + Math.random() * THINK_JITTER_MS;
      const minThink = () => (reduced ? Promise.resolve() : wait(thinkFor - (performance.now() - startedAt)));

      if (smallTalk) {
        // (a fixed answer may come with follow-up questions, see the agent's starting questions below)
        await minThink();
        update(assistantId, { content: smallTalk.answer[replyLang], status: "done", sources: [], suggestions: smallTalk.suggest?.[replyLang] });
        setBusy(false);
        return;
      }

      if (aiUnavailable) {
        await answerLocally(assistantId, question, minThink, replyLang);
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
          await answerLocally(assistantId, question, minThink, replyLang);
          return;
        }

        let sources: ChatSource[] = [];
        try {
          sources = JSON.parse(decodeURIComponent(res.headers.get("X-Faq-Sources") ?? "[]"));
        } catch {
          sources = [];
        }

        let followUps: string[] = [];
        try {
          const parsed = JSON.parse(decodeURIComponent(res.headers.get("X-Faq-Followups") ?? "[]"));
          if (Array.isArray(parsed)) followUps = parsed.filter((q): q is string => typeof q === "string").slice(0, 3);
        } catch {
          followUps = [];
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

        if (!received.trim()) await answerLocally(assistantId, question, minThink, replyLang);
        else update(assistantId, { status: "done", sources: sources.filter((s) => !s.isHome), rid, suggestions: followUps });
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        await answerLocally(assistantId, question, minThink, replyLang);
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

import { useRef, useState } from "react";
import { getLocalizedContent, getContent } from "../../content/loadContent";
import { FaqAccordionItem } from "../FaqAccordionItem";
import { useLanguage } from "../../hooks/useLanguage";
import type { FaqItem } from "../../seo/schema";
import { FaqChat } from "./FaqChat";

// Always the English file — used only to resolve each group's *position*
// in the FAQ list (see GROUPS below), never rendered directly. Keeps
// grouping/order stable across languages without requiring the Dutch
// question text to be matched anywhere.
const enHomeContent = getContent("home.md");

// Grouping is presentational metadata, not content. Matched by ENGLISH
// question text (content/home.md is the source of truth for order/
// position), then resolved to the same INDEX in whichever language is
// actually rendering — content/home.nl.md must list its FAQ items in the
// same order as content/home.md for this to line up.
// Maps each group's English category label to its translation key —
// kept separate from `category` (used as the React key and as the
// English fallback) so the key itself stays a normal dotted identifier.
const GROUP_LABEL_KEY: Record<string, string> = {
  "Working together": "faq.group.workingTogether",
  "Services and platforms": "faq.group.servicesPlatforms",
  Practical: "faq.group.practical",
  Agreements: "faq.group.agreements",
  "About DYSIGNS": "faq.group.about",
};

// Practical first: it holds the most-asked question (pricing).
const GROUPS: { category: string; questions: string[]; defaultOpen?: string[] }[] = [
  {
    category: "Practical",
    questions: [
      "How much does a website or online store cost?",
      "How do I request a quote?",
      "Is the intro call online or in person?",
      "What should I prepare for the first conversation?",
      "Do you have something for starters or small businesses?",
      "Do you work with clients outside the Netherlands?",
      "Do you also work outside Almere?",
      "Which languages can I work with you in?",
      "How soon can you start?",
      "How quickly do you respond to a message?",
    ],
  },
  {
    category: "Agreements",
    questions: [
      "How does payment work?",
      "Do you work with a fixed price or by the hour?",
      "What if I have extra wishes during the project?",
      "Do you offer maintenance after launch?",
      "Can my website be extended later?",
      "Is there a guarantee after delivery?",
      "Can maintenance or social media management be cancelled monthly?",
      "Do you work with terms and conditions?",
      "Can I pay in instalments?",
      "Do you make backups of my site?",
    ],
  },
  {
    category: "About DYSIGNS",
    questions: [
      "Who is behind DYSIGNS?",
      "What makes a creative partner different from hiring specialists?",
      "What kind of businesses do you work for?",
      "Do you have reviews or references?",
      "Can I see more work than what is on the site?",
      "Do you also work for my competitors?",
    ],
  },
  {
    category: "Working together",
    questions: [
      "Do I work directly with the team, or does it change per phase?",
      "Do you only design, or do you build as well?",
      "What does the onboarding and project roadmap look like from start to launch?",
      "How many feedback rounds are there in a project?",
      "What if I am not happy with the design?",
      "Can I follow the progress during the project?",
      "Is everything tested before it goes live?",
      "Do you also take on small projects?",
      "Can you work with a deadline or a rush job?",
    ],
  },
  {
    category: "Services and platforms",
    questions: [
      "Can you take over an existing website or store?",
      "Which platforms do you build on?",
      "Do you also handle SEO?",
      "Do you also manage social media and ads on an ongoing basis?",
      "Cannot AI just do your job?",
      "Do you also arrange hosting, the domain and business email?",
      "Can you guarantee a first place in Google?",
      "Do you also write blogs and content for SEO?",
    ],
  },
];

/**
 * FAQ — title and category tabs on the left, the AI chat and the active
 * category's questions on the right, one compact column.
 *
 * SEO: every question and answer of every tab is rendered; inactive tabs
 * are only `hidden`, so the prerendered HTML (and the FAQPage schema on
 * the homepage) still holds all of them. All questions start closed, so
 * the AI chat on top is what the eye lands on first.
 */
export function FAQ() {
  const { lang, t } = useLanguage();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const homeContent = getLocalizedContent("home.md", lang);
  const items = homeContent.faqItems;
  const enItems = enHomeContent.faqItems;
  if (items.length === 0) return null;

  // English question -> its index in the English list -> the item at
  // that same index in the current-language list. Falls back to the
  // English item itself if the translated file is short a question
  // (safer than crashing on a partial .nl.md).
  const enIndexByQuestion = new Map(enItems.map((item, i) => [item.question, i]));
  const resolveItem = (enQuestion: string): FaqItem | undefined => {
    const i = enIndexByQuestion.get(enQuestion);
    if (i === undefined) return undefined;
    return items[i] ?? enItems[i];
  };
  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.questions.map(resolveItem).filter((i): i is FaqItem => Boolean(i)),
  })).filter((g) => g.items.length > 0);

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + groups.length) % groups.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      className="relative py-16 md:py-20 px-6 md:px-12 lg:px-16"
      style={{
        background: "var(--page-bg)",
        borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
      }}
    >
      <div className="faq-layout max-w-[1100px] mx-auto">
        <div className="faq-left">
          <div className="faq-title">
            <h2
              style={{
                fontFamily: "var(--font-brand)",
                fontSize: "clamp(1.5rem,3.5vw,2.2rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "var(--page-fg)",
                lineHeight: 1.1,
              }}
            >
              {t("services.faqHeading")}
            </h2>
            <p className="faq-intro">{t("faq.intro")}</p>
          </div>

          <div className="faq-tabs" role="tablist" aria-orientation="vertical" aria-label={t("services.faqHeading")}>
            {groups.map((group, i) => (
              <button
                key={group.category}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`faq-tab-${i}`}
                aria-selected={active === i}
                aria-controls={`faq-panel-${i}`}
                tabIndex={active === i ? 0 : -1}
                className={`faq-tab ${active === i ? "is-active" : ""}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
              >
                <span>{t(GROUP_LABEL_KEY[group.category] ?? group.category)}</span>
                <span className="faq-tab-count">{group.items.length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat first, styled as the top "question" of the list. */}
        <div className="faq-chat-slot">
          <FaqChat />
        </div>

        <div className="faq-list">
          {groups.map((group, gi) => (
            <div
              key={group.category}
              id={`faq-panel-${gi}`}
              role="tabpanel"
              aria-labelledby={`faq-tab-${gi}`}
              hidden={active !== gi}
              className="faq-panel"
            >
              {group.items.map((item, i) => (
                <FaqAccordionItem
                  key={group.questions[i]}
                  item={item}
                  dense
                  defaultOpen={group.defaultOpen?.includes(group.questions[i]) ?? false}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Mobile: title, chat, tabs, questions (the left column dissolves
           into the grid). Desktop: title + tabs on the left (sticky),
           chat and questions on the right. */
        .faq-layout {
          display: grid; gap: 1.25rem;
          grid-template-areas: "title" "chat" "tabs" "list";
        }
        .faq-left { display: contents; }
        .faq-title { grid-area: title; }
        .faq-tabs { grid-area: tabs; }
        .faq-chat-slot { grid-area: chat; margin-bottom: .5rem; }
        .faq-list { grid-area: list; }
        .faq-intro { margin-top: .75rem; font-size: .9rem; line-height: 1.6; color: rgba(var(--page-fg-rgb), .55); max-width: 30ch; }
        .faq-tabs {
          display: flex; gap: .4rem; overflow-x: auto; scrollbar-width: none;
          margin: .25rem -1.5rem 0; padding: 0 1.5rem;
        }
        .faq-tabs::-webkit-scrollbar { display: none; }
        .faq-tab {
          display: inline-flex; align-items: center; gap: .55rem; flex-shrink: 0;
          padding: .5rem .9rem; border-radius: 999px; font-family: var(--font-brand);
          font-size: .82rem; font-weight: 600; color: rgba(var(--page-fg-rgb), .55);
          border: 1px solid rgba(var(--page-fg-rgb), .1);
          transition: color .25s ease, background .25s ease, border-color .25s ease;
        }
        .faq-tab:hover { color: var(--page-fg); }
        .faq-tab.is-active { color: var(--page-bg); background: var(--page-fg); border-color: transparent; }
        .faq-tab:focus-visible { outline: 1px solid rgba(var(--page-fg-rgb), .5); outline-offset: 2px; }
        .faq-tab-count { font-size: .7rem; font-weight: 500; opacity: .6; }
        .faq-panel { display: flex; flex-direction: column; gap: .6rem; }
        .faq-panel:not([hidden]) { animation: faq-panel-in .3s ease both; }
        @keyframes faq-panel-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .faq-panel:not([hidden]) { animation: none; } }

        @media (min-width: 900px) {
          .faq-layout {
            grid-template-columns: minmax(0, .8fr) minmax(0, 1.6fr);
            grid-template-areas: "left chat" "left list";
            grid-template-rows: auto 1fr;
            column-gap: 4.5rem; row-gap: .6rem;
          }
          .faq-left { display: block; grid-area: left; position: sticky; top: 6rem; align-self: start; }
          .faq-tabs { flex-direction: column; overflow: visible; margin: 2rem 0 0; padding: 0; gap: .15rem; }
          .faq-tab {
            justify-content: space-between; width: 100%; border: 0; border-radius: .6rem;
            padding: .6rem .8rem; font-size: .9rem;
          }
          .faq-tab.is-active { color: var(--page-fg); background: rgba(var(--page-fg-rgb), .07); }
        }
      `}</style>
    </section>
  );
}

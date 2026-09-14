import { getLocalizedContent, getContent } from "../../content/loadContent";
import { FaqAccordionItem } from "../FaqAccordionItem";
import { useLanguage } from "../../hooks/useLanguage";
import type { FaqItem } from "../../seo/schema";

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
};

const GROUPS: { category: string; questions: string[]; defaultOpen?: string[] }[] = [
  {
    category: "Working together",
    questions: [
      "Do I work directly with the team, or does it change per phase?",
      "Do you only design, or do you build as well?",
      "What makes a full-service agency different from hiring specialists?",
      "What does the onboarding and project roadmap look like from start to launch?",
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
    ],
  },
  {
    category: "Practical",
    questions: [
      "How much does a website or online store cost?",
      "Do you work with clients outside the Netherlands?",
      "Which languages can I work with you in?",
    ],
    // Most-asked question, answer contains the CTA — open by default.
    defaultOpen: ["How much does a website or online store cost?"],
  },
];

/**
 * FAQ — eleven questions grouped into three categories, accordion closed
 * by default except the pricing question (most asked, answer holds the
 * CTA). Multiple items can be open at once — auto-closing the previous
 * one on open is presumptuous, not helpful.
 */
export function FAQ() {
  const { lang, t } = useLanguage();
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

  return (
    <section
      className="relative py-16 md:py-20 px-6 md:px-12 lg:px-16"
      style={{
        background: "var(--page-bg)",
        borderTop: "1px solid rgba(var(--page-fg-rgb), .04)",
      }}
    >
      <div className="max-w-[1100px] mx-auto">
        <h2
          className="mb-10"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(1.5rem,3.5vw,2.2rem)",
            fontWeight: 700,
            letterSpacing: "-.03em",
            color: "var(--page-fg)",
            lineHeight: 1.1,
          }}
        >
          {t("services.faqHeading")}
        </h2>

        <div className="flex flex-col gap-9">
          {GROUPS.map((group) => {
            const groupItems = group.questions
              .map(resolveItem)
              .filter((i): i is FaqItem => Boolean(i));
            if (groupItems.length === 0) return null;
            return (
              <div key={group.category}>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: ".72rem",
                    fontWeight: 600,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    color: "rgba(var(--page-fg-rgb), .4)",
                  }}
                >
                  {t(GROUP_LABEL_KEY[group.category] ?? group.category)}
                </h3>
                <div className="faq-grid">
                  {groupItems.map((item, i) => (
                    <FaqAccordionItem
                      key={group.questions[i]}
                      item={item}
                      defaultOpen={group.defaultOpen?.includes(group.questions[i]) ?? false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .faq-grid { display: grid; grid-template-columns: 1fr; align-items: start; gap: .9rem; }
        @media (min-width: 768px) {
          .faq-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .faq-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </section>
  );
}

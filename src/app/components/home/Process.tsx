import type { CSSProperties } from "react";
import { getProcessSteps, getLocalizedContent } from "../../content/loadContent";
import { useLanguage } from "../../hooks/useLanguage";

// Standard visually-hidden pattern — same one already used in Footer.tsx
// for its SEO entity-signal paragraph. Content stays in the DOM (real
// text, real semantic structure) for crawlers and screen readers; only
// sighted visitors never see it. display:none/visibility:hidden would
// hide it from both crawlers and assistive tech too, which is exactly
// what this must avoid.
const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

/**
 * Process — "How we work", six steps. Not shown visually (see brief:
 * keep it for SEO/accessibility, not as a page section anyone scrolls
 * through) — sr-only, no scroll animation, no visual styling, just real
 * semantic markup in both languages.
 */
export function Process() {
  const { lang, t } = useLanguage();
  const steps = getProcessSteps(getLocalizedContent("home.md", lang).rawBody);
  if (steps.length === 0) return null;

  return (
    <section style={srOnly}>
      <h2>{t("process.heading")}</h2>
      <ol>
        {steps.map((step) => (
          <li key={step.number}>
            <h3>
              {step.number}. {step.title}
            </h3>
            <p>{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

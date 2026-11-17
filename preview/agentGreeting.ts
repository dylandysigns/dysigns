import type { useLanguage } from "../src/app/hooks/useLanguage";

/** What the agent says when you point at it, by the visitor's own clock:
    "Goedemorgen, Vraag me alles" before noon, then afternoon, then evening (the night too).
    The two parts are split on ", " by the speech bubble (GreetingBubble.tsx). */
export function greeting(t: ReturnType<typeof useLanguage>["t"], now = new Date()): string {
  const h = now.getHours();
  const part = h >= 5 && h < 12 ? "agent.morning" : h >= 12 && h < 18 ? "agent.afternoon" : "agent.evening";
  return `${t(part)}, ${t("agent.askAnything")}`;
}

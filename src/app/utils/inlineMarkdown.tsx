import type { ReactNode } from "react";
import { TransitionLink } from "../components/TransitionLink";

/**
 * Renders `[label](/href)` markdown links inside otherwise-plain text as
 * real, clickable links — used wherever content is pulled out of
 * markdown as raw extracted text (FAQ answers, service "includes"
 * descriptions) rather than run through the full markdown-to-HTML
 * pipeline. Internal paths (starting with "/") use TransitionLink;
 * anything else falls back to a plain anchor.
 */
export function renderInlineMarkdown(text: string): ReactNode {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, label, href] = match;
    nodes.push(
      href.startsWith("/") ? (
        <TransitionLink
          key={key++}
          to={href}
          style={{
            color: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          {label}
        </TransitionLink>
      ) : (
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          {label}
        </a>
      ),
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

import { useState } from "react";
import {
  Add,
  Minus,
  MessageQuestion,
  DollarCircle,
  MagicStar,
  Layer,
  Profile2User,
  Global,
  Speaker,
  Refresh2,
  Send2,
  Setting2,
  Brush,
  Flash,
  Mobile,
  SearchNormal1,
  Wallet,
  Translate,
  Signpost,
  Convert,
  InfoCircle,
  TrendUp,
  type Icon as IconsaxIcon,
} from "iconsax-react";
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import {
  GlobalRefreshIcon,
  HandshakeIcon,
  RocketIcon,
} from "@hugeicons/core-free-icons";
import type { FaqItem } from "../seo/schema";
import { renderInlineMarkdown } from "../utils/inlineMarkdown";

/** Wraps a Hugeicons glyph (a plain SVG-path array, not a component) in a
 * component with the same {size, color, style} call shape as an Iconsax
 * icon, so pickFaqIcon can return either source through one type and the
 * render code below never needs to know which library it came from. */
function fromHugeicons(icon: HugeiconsIconProps["icon"]): IconsaxIcon {
  return function HugeiconsAdapter({ size, color, style }) {
    return <HugeiconsIcon icon={icon} size={size} color={color} style={style} />;
  } as IconsaxIcon;
}

const GlobalRefresh = fromHugeicons(GlobalRefreshIcon);
const Handshake = fromHugeicons(HandshakeIcon);
const Rocket = fromHugeicons(RocketIcon);

// Exact icon per question, for every FAQ across the homepage and all
// service pages — checked against the literal English question text, so
// a wording edit silently falls back to the generic question mark rather
// than showing the wrong icon. Assigned so no single page repeats an
// icon across its own questions (duplicates across *different* pages are
// fine — they're never shown together). Mostly Iconsax, with three picks
// from Hugeicons where it has a glyph Iconsax simply doesn't (an actual
// handshake, a rocket, a "refresh the globe" for international questions).
// "Cannot AI just do your job?" uses Convert (closest either library has
// to a literal cycle). Dutch (.nl.md) question text isn't matched here
// yet — it falls through to the generic keyword heuristic below, same
// pre-existing gap as before this change.
const FAQ_ICON_OVERRIDES: Record<string, IconsaxIcon> = {
  // Homepage
  "Do I work directly with the team, or does it change per phase?": Profile2User,
  "Do you only design, or do you build as well?": Brush,
  "What makes a full-service agency different from hiring specialists?": Flash,
  "What does the onboarding and project roadmap look like from start to launch?": Signpost,
  "Can you take over an existing website or store?": Handshake,
  "Which platforms do you build on?": Layer,
  "Do you also manage social media and ads on an ongoing basis?": Mobile,
  "Cannot AI just do your job?": Convert,
  "How much does a website or online store cost?": Wallet,
  "Do you work with clients outside the Netherlands?": GlobalRefresh,
  "Which languages can I work with you in?": Translate,

  // AI implementation
  "How much does an AI implementation cost?": DollarCircle,
  "Can AI just replace what your agency does?": MagicStar,
  "Will you tell me if AI is not the right fit?": InfoCircle,
  "Do I need existing AI infrastructure before we start?": Setting2,
  "Do you maintain the implementation after launch?": Rocket,

  // Branding
  "How much does branding cost?": DollarCircle,
  "Does branding always start with a new logo?": Brush,
  "Do you work on an existing identity, or only from scratch?": Refresh2,
  "Do I get guidelines for social media too?": Speaker,
  "Do you also build the site or store the identity goes on?": Layer,

  // Shopify development
  "Can an existing Shopify store be improved, or does it need a rebuild?": Refresh2,
  "Do you work with existing Shopify apps and integrations?": Layer,
  "Do you support multiple languages or countries through Shopify Markets?": GlobalRefresh,
  "Do you stay involved after launch?": Rocket,

  // Social media & Meta Ads
  "How much does social media and Meta Ads management cost?": DollarCircle,
  "How is ad spend handled?": Wallet,
  "How long before a campaign shows real results?": TrendUp,
  "Do you take over an existing social media presence?": Speaker,
  "Can you run ads without also building the landing page?": Layer,

  // UX/UI design
  "How much does UX/UI design cost?": DollarCircle,
  "Do you always start with research?": SearchNormal1,
  "Do you hand off UI components to developers?": Send2,
  "Do you work with an existing development team?": Profile2User,
  "Is this also suitable for an existing product, not just new builds?": Refresh2,

  // Web design
  "Do you build on an existing platform, or fully custom?": Layer,
  "Is the site also fast and mobile friendly?": Mobile,
};

/** Best-effort icon per question — exact overrides above take priority,
 * falling back to a keyword match for any question not on that list. */
function pickFaqIcon(question: string): IconsaxIcon {
  if (FAQ_ICON_OVERRIDES[question]) return FAQ_ICON_OVERRIDES[question];

  const q = question.toLowerCase();
  if (q.includes("cost") || q.includes("much does")) return DollarCircle;
  if (q.includes(" ai ") || q.startsWith("ai") || q.includes("cannot ai")) return MagicStar;
  if (q.includes("platform") || q.includes("shopify") || q.includes("build as well")) return Layer;
  if (q.includes("directly") || q.includes("team")) return Profile2User;
  if (q.includes("language")) return Global;
  if (q.includes("outside") || q.includes("netherlands")) return Global;
  if (q.includes("social media") || q.includes("ads") || q.includes("manage")) return Speaker;
  if (q.includes("existing") || q.includes("take over")) return Refresh2;
  if (q.includes("launch") || q.includes("after")) return Send2;
  if (q.includes("problem") || q.includes("solve") || q.includes("different")) return Setting2;
  return MessageQuestion;
}

/**
 * Shared accordion card for FAQ grids — used by the homepage FAQ and the
 * service-page FAQ. Closed cards all share the exact same footprint
 * (question clamped to 2 lines, fixed minHeight), so a 3-column grid
 * reads as even rows at rest. Opening a card expands it in place (normal
 * document flow, grid-template-rows 0fr/1fr) — the previous
 * position:absolute popover version overlapped sibling cards below it,
 * so this reverts to in-flow expansion. The parent grids use
 * align-items:start so an expanded card doesn't stretch the other cards
 * in its row.
 */
export function FaqAccordionItem({ item, defaultOpen }: { item: FaqItem; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  const id = item.question.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const Icon = pickFaqIcon(item.question);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: open
          ? "1px solid rgba(var(--page-fg-rgb), .18)"
          : "1px solid rgba(var(--page-fg-rgb), .07)",
        background: open
          ? "linear-gradient(135deg, rgba(var(--page-fg-rgb), .1), rgba(var(--page-fg-rgb), .02))"
          : "rgba(var(--page-fg-rgb), .03)",
        transition: "border-color .3s ease, background .3s ease",
      }}
    >
      <h4>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`faq-answer-${id}`}
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-2xl"
          style={{
            padding: "1rem 1.1rem",
            minHeight: 76,
          }}
        >
          <Icon
            size={18}
            variant="Linear"
            color={open || hovered ? "var(--page-fg)" : "rgba(var(--page-fg-rgb), .5)"}
            style={{ flexShrink: 0, transition: "color .3s ease" }}
          />
          <span
            className="flex-1"
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: ".92rem",
              fontWeight: 600,
              color: "var(--page-fg)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.question}
          </span>
          <span
            className="grid flex-shrink-0 place-items-center rounded-full"
            style={{
              width: 22,
              height: 22,
              background: hovered ? "rgba(var(--page-fg-rgb), .12)" : "rgba(var(--page-fg-rgb), .06)",
              transition: "background .3s ease",
            }}
          >
            {open ? (
              <Minus size={13} variant="Linear" color="var(--page-fg)" />
            ) : (
              <Add size={13} variant="Linear" color="rgba(var(--page-fg-rgb), .6)" />
            )}
          </span>
        </button>
      </h4>
      <div
        id={`faq-answer-${id}`}
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows .35s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p
            style={{
              padding: "0 1.1rem 1.1rem calc(1.1rem + 18px + .75rem)",
              fontSize: ".85rem",
              lineHeight: 1.65,
              color: "rgba(var(--page-fg-rgb), .65)",
            }}
          >
            {renderInlineMarkdown(item.answer)}
          </p>
        </div>
      </div>
    </div>
  );
}

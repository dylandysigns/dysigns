/**
 * DocsPage — Comprehensive content-editing guide for the DYSIGNS site.
 *
 * Accessible at /docs (unlisted). Covers every editable surface:
 * data files, i18n dictionary, images, projects, testimonials, and voice rules.
 */

import { useState, useCallback } from "react";

/* ─── Types ─── */
interface DocItem {
  label: string;
  path: string;
  note: string;
  example?: string;
}
interface DocSection {
  id: string;
  title: string;
  intro?: string;
  items: DocItem[];
}

/* ─── All sections ─── */
const sections: DocSection[] = [
  /* ──────────────── Architecture overview ──────────────── */
  {
    id: "architecture",
    title: "Content Architecture",
    intro:
      "All user-facing content lives in three layers. You never need to touch React components for routine text, image, or project edits.",
    items: [
      {
        label: "Static data",
        path: "/src/app/data/content.ts",
        note: "Hero options, trusted-by list, projects summary, vision, design process steps, services, testimonials, contact info, and social links. English only; serves as the structural source of truth.",
      },
      {
        label: "Project case studies",
        path: "/src/app/data/projects.ts",
        note: "9 projects with slug, thumbnail, gallery images, overview paragraph, outcomes, and tags. The router resolves /work/<slug> automatically.",
      },
      {
        label: "Translation dictionary (i18n)",
        path: "/src/app/hooks/useLanguage.tsx",
        note: 'Contains every translatable string keyed as { en: "...", nl: "..." }. Both the English and Dutch versions of all UI copy live here. If you update text in content.ts, also update the matching key in useLanguage.tsx to keep both languages in sync.',
      },
      {
        label: "Translated content hook",
        path: "/src/app/hooks/useSiteContent.ts",
        note: "Merges static data from content.ts with translated strings from useLanguage.tsx. Components that call useSiteContent() get the active-language version automatically. You rarely need to edit this file.",
      },
    ],
  },

  /* ──────────────── Hero ──────────────── */
  {
    id: "hero",
    title: "Hero Section",
    intro:
      "The hero dominates the viewport. It has a headline, subtitle, two CTA buttons, a portrait image, availability chip, scroll indicator, and four skill chips.",
    items: [
      {
        label: "Swap headline (quick)",
        path: 'content.ts  activeHeadline',
        note: 'Six pre-written options exist (A\u2013F). Change the activeHeadline constant to any letter. The site picks it up instantly.',
        example: 'export const activeHeadline: HeadlineKey = "C";',
      },
      {
        label: "Write a custom headline",
        path: "content.ts  heroOptions",
        note: 'Add a new key (e.g. G) to heroOptions, then set activeHeadline to "G". Also add the matching i18n key in useLanguage.tsx.',
        example:
          '// content.ts\nheroOptions.G = "DYSIGNS. Designed to convert.";\nexport const activeHeadline: HeadlineKey = "G";\n\n// useLanguage.tsx\n"hero.headline.G": {\n  en: "DYSIGNS. Designed to convert.",\n  nl: "DYSIGNS. Ontworpen om te converteren.",\n},',
      },
      {
        label: "Subtitle",
        path: "content.ts  siteContent.hero.sub",
        note: "Short italic line below the headline. Keep it under ~20 words. Update the i18n key hero.sub in useLanguage.tsx for both languages.",
      },
      {
        label: "CTA buttons",
        path: "content.ts  hero.cta1 / hero.cta2",
        note: '"View our work" and "Start a project". Change the labels (keep them 2\u20134 words). Update i18n keys hero.cta1 and hero.cta2.',
      },
      {
        label: "Portrait image",
        path: "content.ts  hero.portrait",
        note: "URL to the large hero portrait. Replace with your own CDN or Unsplash URL. Recommended: at least 1080 px wide, portrait orientation.",
      },
      {
        label: "Availability chip",
        path: "useLanguage.tsx  hero.available",
        note: 'The green-dot chip that says "Available for projects". Translation only \u2014 edit the i18n key.',
      },
      {
        label: "Skill chips",
        path: "useLanguage.tsx  hero.chip.*",
        note: "Four floating chips (UX/UI, Brand Identity, Web Design, Product). Edit the i18n keys hero.chip.ux, hero.chip.brand, hero.chip.web, hero.chip.product.",
      },
    ],
  },

  /* ──────────────── Projects ──────────────── */
  {
    id: "projects",
    title: "Projects & Case Studies",
    intro:
      "Projects appear in the ZoomToGrid section on the homepage, the /work index page, and as individual case-study pages at /work/<slug>.",
    items: [
      {
        label: "Add a new project",
        path: "/src/app/data/projects.ts  projects[]",
        note: "Add an object to the array. Required fields: slug (URL-safe, lowercase, hyphens), title, category, tags[] (string array), year, thumbnail (image URL), overview (1\u20132 paragraphs), outcomes[] (3\u20135 short result strings), gallery[] (3\u20134 image URLs). The router auto-resolves /work/<slug> \u2014 no routing changes needed.",
        example:
          '{\n  slug: "acme-rebrand",\n  title: "Acme Rebrand",\n  category: "Branding",\n  tags: ["Brand Identity", "Web Design"],\n  year: "2026",\n  thumbnail: "https://images.unsplash.com/photo-...",\n  overview: "We partnered with Acme to...",\n  outcomes: [\n    "Brand recall up 35%",\n    "Website traffic doubled",\n  ],\n  gallery: [\n    "https://images.unsplash.com/photo-...",\n    "https://images.unsplash.com/photo-...",\n    "https://images.unsplash.com/photo-...",\n  ],\n}',
      },
      {
        label: "Remove a project",
        path: "projects.ts  projects[]",
        note: "Delete the object from the array. No other files need changing.",
      },
      {
        label: "Reorder projects",
        path: "projects.ts  projects[]",
        note: "The array order is the display order on both the homepage grid and the /work index. Move entries up or down in the array.",
      },
      {
        label: "Change a thumbnail",
        path: "projects.ts  project.thumbnail",
        note: "Replace the URL. Use landscape-oriented images, minimum 1080 px wide, for best results in the grid and hero zoom.",
      },
      {
        label: "Edit a case study",
        path: "projects.ts  project.overview / outcomes / gallery",
        note: "Overview is a plain paragraph. Outcomes are short bullet strings. Gallery is 3\u20134 image URLs shown on the case detail page.",
      },
      {
        label: "Category filters on /work",
        path: "projects.ts  project.category",
        note: 'Categories (Branding, Product, Web) are derived automatically from the data. Adding a new unique category string creates a new filter tab.',
      },
      {
        label: "Zoom-to-grid section",
        path: "projects.ts  zoomToGridData",
        note: "heroImage (large background that zooms out), headlineStart/headlineEnd (the section title split into two lines), and gridImages[] (thumbnails that reveal during scroll). Note: an open item exists to switch gridImages to use each project's own thumbnail instead.",
      },
      {
        label: "Zoom-to-grid heading (i18n)",
        path: 'useLanguage.tsx  zoom.start / zoom.end',
        note: 'The section heading is split into two i18n keys: zoom.start ("Selected projects") and zoom.end ("we\'re proud of"). Edit both languages here.',
      },
      {
        label: "About page image",
        path: "projects.ts  aboutImage",
        note: "Single image URL used as the hero image on the About page.",
      },
    ],
  },

  /* ──────────────── Testimonials ──────────────── */
  {
    id: "testimonials",
    title: "Testimonials (Kind Words)",
    intro:
      "8 testimonials power the Kind Words slider on the homepage. Each has a portrait image, name, role, company, and a quote.",
    items: [
      {
        label: "Edit a testimonial",
        path: "content.ts  siteContent.testimonials[]",
        note: "Each entry has: id (e.g. t1\u2013t8), quote (English fallback), name, role, company, avatar (headshot URL). The quote text displayed to users comes from the i18n dictionary, not from this field.",
      },
      {
        label: "Edit the quote text (EN + NL)",
        path: "useLanguage.tsx  testimonial.<id>.quote",
        note: 'The actual displayed quote is pulled from the i18n key testimonial.t1.quote, testimonial.t2.quote, etc. Edit both en and nl values. The quote field in content.ts is only a fallback.',
        example:
          '"testimonial.t1.quote": {\n  en: "Your new English quote here.",\n  nl: "Uw nieuwe Nederlandse quote hier.",\n},',
      },
      {
        label: "Add a new testimonial",
        path: "content.ts + useLanguage.tsx",
        note: '1) Add an object to siteContent.testimonials[] with a new id (e.g. "t9"). 2) Add the i18n key testimonial.t9.quote with en and nl translations. The slider picks it up automatically.',
        example:
          '// content.ts\n{\n  id: "t9",\n  quote: "English fallback quote.",\n  name: "New Person",\n  role: "CTO",\n  company: "New Co",\n  avatar: "https://images.unsplash.com/photo-...",\n}\n\n// useLanguage.tsx\n"testimonial.t9.quote": {\n  en: "Working with DYSIGNS was transformative.",\n  nl: "Samenwerken met DYSIGNS was transformerend.",\n},',
      },
      {
        label: "Remove a testimonial",
        path: "content.ts + useLanguage.tsx",
        note: "Delete the object from siteContent.testimonials[] and remove the matching testimonial.<id>.quote key from useLanguage.tsx.",
      },
      {
        label: "Change a headshot",
        path: "content.ts  testimonial.avatar",
        note: "Replace the URL. Use square or portrait-oriented headshots, minimum 400 px. The slider displays them at 3:4 aspect ratio.",
      },
      {
        label: "Section heading & subline",
        path: "useLanguage.tsx  testimonials.*",
        note: 'Edit the i18n keys: testimonials.label ("Testimonials"), testimonials.heading1 ("Words of"), testimonials.heading2 ("praise"), and testimonials.sub.',
      },
    ],
  },

  /* ──────────────── Services ──────────────── */
  {
    id: "services",
    title: "Services",
    intro:
      "Four service cards on the homepage. Each has a title and description.",
    items: [
      {
        label: "Edit a service",
        path: "content.ts  siteContent.services[i]",
        note: "Change the title and/or description. Also update the matching i18n keys services.<i>.title and services.<i>.desc in useLanguage.tsx (0-indexed).",
        example:
          '// useLanguage.tsx\n"services.2.title": { en: "Product Design", nl: "Productontwerp" },\n"services.2.desc": {\n  en: "Digital products users love.",\n  nl: "Digitale producten waar gebruikers van houden.",\n},',
      },
      {
        label: "Add or remove a service",
        path: "content.ts + useLanguage.tsx",
        note: "Add/remove an object in siteContent.services[]. Then add/remove the corresponding i18n keys services.<i>.title and services.<i>.desc. Icons are mapped by array index in Services.tsx \u2014 you may need to add a new icon for a 5th service.",
      },
      {
        label: "Section label & heading",
        path: "useLanguage.tsx  services.label / services.title",
        note: 'Edit the i18n keys: services.label ("What we do") and services.title ("Services").',
      },
    ],
  },

  /* ──────────────── Design Process ──────────────── */
  {
    id: "timeline",
    title: "Design Timeline (Process Steps)",
    intro:
      "Six process steps shown as a horizontal timeline on the homepage: Discover, Define, Design, Prototype, Build, Launch.",
    items: [
      {
        label: "Edit a step",
        path: "content.ts  siteContent.designProcess[i]",
        note: "Each step has id, title, description. Also update the i18n keys timeline.<i>.title and timeline.<i>.desc (0-indexed).",
      },
      {
        label: "Add or remove a step",
        path: "content.ts + useLanguage.tsx",
        note: "Add/remove an object in designProcess[]. Add/remove matching timeline.<i>.title and timeline.<i>.desc keys. Keep the count reasonable (4\u20137 works best visually).",
      },
      {
        label: "Section label",
        path: "useLanguage.tsx  timeline.label",
        note: 'Edit the i18n key: timeline.label ("How we design").',
      },
    ],
  },

  /* ──────────────── Contact ──────────────── */
  {
    id: "contact",
    title: "Contact Info",
    intro:
      "Contact details appear in the ContactBand (homepage bottom), Contact page, Header, and Footer.",
    items: [
      {
        label: "Email address",
        path: "content.ts  siteContent.contact.email",
        note: 'Currently "hello@dysigns.co". Change it once here and it updates everywhere.',
      },
      {
        label: "WhatsApp number",
        path: "content.ts  siteContent.contact.whatsapp",
        note: 'International format with country code, e.g. "+31612345678". Currently a placeholder \u2014 replace with the real number before going live.',
      },
      {
        label: "Contact headline & subtitle",
        path: "useLanguage.tsx  contact.headline / contact.sub",
        note: "Edit the i18n keys for both languages. These appear on both the ContactBand and the Contact page.",
      },
      {
        label: "Social links",
        path: "content.ts  siteContent.socials[]",
        note: 'Array of { name, url }. Replace "#" placeholder URLs with real profile links. Used in the Footer and Contact page.',
      },
    ],
  },

  /* ──────────────── Navigation & Pages ──────────────── */
  {
    id: "navigation",
    title: "Navigation & Page Labels",
    intro:
      "The floating pill nav and all page headings pull from the i18n dictionary.",
    items: [
      {
        label: "Nav links",
        path: "useLanguage.tsx  nav.*",
        note: "Edit the i18n keys nav.work, nav.about, nav.contact for both languages.",
      },
      {
        label: "About page",
        path: "useLanguage.tsx  about.*",
        note: "All About page copy is in i18n keys: about.label, about.storyTitle, about.storyText, about.valuesLabel, about.value0\u2013value3 (.title and .text), about.ctaTitle, about.ctaButton.",
      },
      {
        label: "Work page heading",
        path: "useLanguage.tsx  work.*",
        note: 'Edit work.label ("Our work"), work.title ("Selected projects"), work.filterAll ("All").',
      },
      {
        label: "Case detail labels",
        path: "useLanguage.tsx  case.*",
        note: "Labels on the case study page: case.back, case.overview, case.outcomes, case.previous, case.next, case.notFound.",
      },
      {
        label: "Footer",
        path: "useLanguage.tsx  footer.rights",
        note: '"All rights reserved." \u2014 edit both languages.',
      },
    ],
  },

  /* ──────────────── i18n System ──────────────── */
  {
    id: "i18n",
    title: "Translation System (i18n)",
    intro:
      "The site supports English and Dutch. A pill toggle in the header lets visitors switch. All translatable strings live in one dictionary.",
    items: [
      {
        label: "How it works",
        path: "/src/app/hooks/useLanguage.tsx",
        note: 'The dict object maps string keys to { en: "...", nl: "..." } pairs. Components call t("key") to get the active-language string. If a key is missing, it falls back to the key name itself.',
      },
      {
        label: "Add a new translatable string",
        path: "useLanguage.tsx  dict",
        note: 'Add a new key-value pair to the dict object: "my.new.key": { en: "English text", nl: "Dutch text" }. Then use t("my.new.key") in your component.',
        example:
          '"mySection.title": {\n  en: "Our Philosophy",\n  nl: "Onze Filosofie",\n},',
      },
      {
        label: "Language toggle label",
        path: "useLanguage.tsx  lang.switchTo",
        note: 'The toggle tooltip. Currently "Switch to Dutch" / "Switch to English".',
      },
      {
        label: "Language persistence",
        path: "LanguageProvider",
        note: 'The chosen language is saved to localStorage under the key "dysigns-lang". It persists across page reloads.',
      },
      {
        label: "Cursor hints",
        path: "useLanguage.tsx  cursor.*",
        note: "Labels shown in the premium cursor system: cursor.drag, cursor.view, cursor.email, cursor.whatsapp, etc. Edit both languages.",
      },
    ],
  },

  /* ──────────────── Images ──────────────── */
  {
    id: "images",
    title: "Images & Assets",
    intro:
      "All images are referenced by URL in the data files. No images are stored in the repository.",
    items: [
      {
        label: "Replace any image",
        path: "Any URL field in content.ts or projects.ts",
        note: "Swap the Unsplash URL for your own CDN link or a different Unsplash URL. Append ?w=1080 for consistent quality. Use portrait orientation for testimonial avatars and hero portrait; landscape for project thumbnails.",
      },
      {
        label: "DYSIGNS logo",
        path: "/src/imports/ (figma:asset)",
        note: "The logo is imported as a Figma asset PNG. Replace the file in /src/imports/ to change it site-wide. It is used in the Header and Footer.",
      },
      {
        label: "Partner logos",
        path: "/src/app/components/home/Partners.tsx",
        note: "Each partner is rendered as an inline SVG. To use real client logos, replace the SVG markup inside Partners.tsx with your own.",
      },
      {
        label: "Image sizing recommendations",
        path: "",
        note: "Hero portrait: 1080+ px, portrait ratio. Project thumbnails: 1080+ px, landscape. Testimonial headshots: 400+ px, square or portrait. Gallery images: 1080+ px, any ratio. About image: 1080+ px, landscape.",
      },
    ],
  },

  /* ──────────────── Voice & Style ──────────────── */
  {
    id: "voice",
    title: "Voice & Style Rules",
    intro:
      "Every piece of copy must follow these rules to keep the brand voice consistent.",
    items: [
      {
        label: 'Pronoun: "we / our"',
        path: "All copy",
        note: 'Always first-person plural: "we", "our", "us". Never "I", "my", or third-person.',
      },
      {
        label: 'Identity: "design practice"',
        path: "All copy",
        note: 'Call it "DYSIGNS" or "a design practice". Never use "agency", "studio", "firm", or "company".',
      },
      {
        label: "Tone",
        path: "All copy",
        note: "Confident, concise, no fluff. Every sentence should earn its place. Avoid superlatives unless backed by a number.",
      },
      {
        label: "Formatting",
        path: "All copy",
        note: "Use em dashes (\u2014) not hyphens for asides. Use curly quotes where possible. Keep paragraphs short (2\u20133 sentences max).",
      },
    ],
  },
];

/* ─── Sidebar nav item ─── */
function NavItem({
  id,
  title,
  active,
  onClick,
}: {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: ".82rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,.5)",
        background: active ? "rgba(255,255,255,.06)" : "transparent",
        border: "none",
        cursor: "pointer",
        transition: "all .2s",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {title}
    </button>
  );
}

/* ─── Code block ─── */
function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        marginTop: 8,
        padding: "12px 14px",
        borderRadius: 8,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.06)",
        fontSize: ".75rem",
        lineHeight: 1.6,
        color: "rgba(255,255,255,.7)",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {code}
    </pre>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DocsPage
   ════════════════════════════════════════════════════════════════════════ */

export default function DocsPage() {
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);

  const scrollToSection = useCallback((id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(`docs-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: "#000", color: "#fff" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16 py-24 md:py-36">
        {/* ── Page header ── */}
        <div style={{ marginBottom: "3rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.4)",
              marginBottom: 12,
            }}
          >
            Internal Reference
          </span>
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            Content Editing Guide
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "rgba(255,255,255,.55)",
              maxWidth: "42rem",
            }}
          >
            Everything you need to update text, images, projects, testimonials,
            and translations on the DYSIGNS site. Most edits require changes to
            just two files. No React or component knowledge needed.
          </p>
        </div>

        {/* ── Quick-reference box ── */}
        <div
          className="rounded-xl"
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
            marginBottom: "3rem",
          }}
        >
          <h2
            style={{
              fontSize: ".85rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Quick Reference: Key Files
          </h2>
          <div
            className="grid sm:grid-cols-2 gap-3"
            style={{ fontSize: ".82rem", lineHeight: 1.6 }}
          >
            {[
              {
                file: "/src/app/data/content.ts",
                desc: "Hero, vision, services, testimonials, contact, socials (English defaults + static data)",
              },
              {
                file: "/src/app/data/projects.ts",
                desc: "All 9 projects with slugs, images, overviews, outcomes, galleries",
              },
              {
                file: "/src/app/hooks/useLanguage.tsx",
                desc: "Full EN + NL translation dictionary (every UI string)",
              },
              {
                file: "/src/app/hooks/useSiteContent.ts",
                desc: "Merges data + translations (rarely edited)",
              },
            ].map((f) => (
              <div
                key={f.file}
                className="rounded-lg"
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <code
                  style={{
                    fontSize: ".72rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,.7)",
                    fontFamily: "'JetBrains Mono', monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {f.file}
                </code>
                <p style={{ color: "rgba(255,255,255,.45)", marginTop: 4 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Layout: sidebar nav + content ── */}
        <div className="flex gap-12">
          {/* Sidebar — desktop only */}
          <nav
            className="hidden lg:block shrink-0"
            style={{
              width: 200,
              position: "sticky",
              top: 120,
              alignSelf: "flex-start",
            }}
          >
            <div className="flex flex-col gap-1">
              {sections.map((s) => (
                <NavItem
                  key={s.id}
                  id={s.id}
                  title={s.title}
                  active={activeSectionId === s.id}
                  onClick={() => scrollToSection(s.id)}
                />
              ))}
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {sections.map((section, si) => (
              <div
                key={section.id}
                id={`docs-${section.id}`}
                style={{
                  marginBottom: si < sections.length - 1 ? "3.5rem" : 0,
                  scrollMarginTop: 100,
                }}
              >
                {/* Section heading */}
                <h2
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    letterSpacing: "-.02em",
                    color: "#fff",
                    marginBottom: section.intro ? 8 : 16,
                    paddingBottom: ".5rem",
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  {si + 1}. {section.title}
                </h2>

                {/* Section intro */}
                {section.intro && (
                  <p
                    style={{
                      fontSize: ".88rem",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,.5)",
                      marginBottom: 20,
                      maxWidth: "38rem",
                    }}
                  >
                    {section.intro}
                  </p>
                )}

                {/* Items */}
                <div className="flex flex-col gap-3">
                  {section.items.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg"
                      style={{
                        padding: "1rem 1.25rem",
                        background: "rgba(255,255,255,.025)",
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                        <span
                          style={{
                            fontSize: ".88rem",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {item.label}
                        </span>
                        {item.path && (
                          <code
                            style={{
                              fontSize: ".7rem",
                              fontWeight: 500,
                              color: "rgba(255,255,255,.4)",
                              background: "rgba(255,255,255,.06)",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {item.path}
                          </code>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: ".84rem",
                          lineHeight: 1.65,
                          color: "rgba(255,255,255,.55)",
                        }}
                      >
                        {item.note}
                      </p>
                      {item.example && <CodeBlock code={item.example} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Checklist ── */}
            <div
              className="mt-14 rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Post-Edit Checklist
              </h3>
              <ol
                className="flex flex-col gap-2"
                style={{
                  fontSize: ".85rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,.55)",
                  listStyle: "decimal inside",
                }}
              >
                <li>Save the data file(s).</li>
                <li>
                  Check the dev server \u2014 changes appear instantly via Vite
                  HMR.
                </li>
                <li>
                  If you edited text, update the matching i18n key in
                  useLanguage.tsx for both EN and NL.
                </li>
                <li>Toggle the language pill to verify Dutch translations.</li>
                <li>Verify new images load and are not broken links.</li>
                <li>
                  Test on mobile \u2014 especially long testimonial quotes and
                  project titles.
                </li>
                <li>
                  Check the /work page to confirm any new projects appear with
                  correct filters.
                </li>
                <li>Deploy when satisfied.</li>
              </ol>
            </div>

            {/* ── Common patterns ── */}
            <div
              className="mt-6 rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Common Edit Patterns
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <p
                    style={{
                      fontSize: ".85rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,.8)",
                      marginBottom: 4,
                    }}
                  >
                    Change a text string (both languages)
                  </p>
                  <CodeBlock
                    code={`// 1. Update content.ts (English default)\nsiteContent.hero.sub = "New subtitle here.";\n\n// 2. Update useLanguage.tsx (both languages)\n"hero.sub": {\n  en: "New subtitle here.",\n  nl: "Nieuwe ondertitel hier.",\n},`}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: ".85rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,.8)",
                      marginBottom: 4,
                    }}
                  >
                    Add a new project
                  </p>
                  <CodeBlock
                    code={`// projects.ts — add to the projects[] array\n{\n  slug: "my-new-project",\n  title: "My New Project",\n  category: "Web",\n  tags: ["Web Design", "Development"],\n  year: "2026",\n  thumbnail: "https://...",\n  overview: "A short paragraph...",\n  outcomes: ["Result 1", "Result 2", "Result 3"],\n  gallery: ["https://...", "https://...", "https://..."],\n}\n\n// That's it! /work/my-new-project is live.`}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: ".85rem",
                      fontWeight: 600,
                      color: "rgba(255,255,255,.8)",
                      marginBottom: 4,
                    }}
                  >
                    Add a new testimonial
                  </p>
                  <CodeBlock
                    code={`// 1. content.ts — add to siteContent.testimonials[]\n{\n  id: "t9",\n  quote: "English fallback.",\n  name: "Jane Doe",\n  role: "CEO",\n  company: "Acme Inc",\n  avatar: "https://...",\n}\n\n// 2. useLanguage.tsx — add the i18n quote\n"testimonial.t9.quote": {\n  en: "Working with DYSIGNS changed everything.",\n  nl: "Samenwerken met DYSIGNS veranderde alles.",\n},`}
                  />
                </div>
              </div>
            </div>

            {/* ── Known open items ── */}
            <div
              className="mt-6 rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Known Open Items
              </h3>
              <ul
                className="flex flex-col gap-2"
                style={{
                  fontSize: ".85rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,.55)",
                  listStyle: "disc inside",
                }}
              >
                <li>
                  WhatsApp number in content.ts is a placeholder (+31612345678)
                  \u2014 replace before launch.
                </li>
                <li>
                  ZoomToGrid gridImages[] should ideally pull from each
                  project's own thumbnail instead of separate URLs.
                </li>
                <li>
                  The WhatsApp SVG icon is duplicated across Header, Footer,
                  ContactBand, and ContactPage \u2014 planned extraction to
                  /src/app/components/ui/.
                </li>
                <li>
                  Circular isLowPower dependency between Layout and
                  PremiumCursor \u2014 planned extraction to
                  /src/app/hooks/usePerf.ts.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DocsPage — Complete field-by-field content editing guide for DYSIGNS.
 *
 * /docs (unlisted). Shows every editable value, its current content,
 * which file to open, which line to change, and step-by-step instructions.
 */

import { useState, useCallback } from "react";

/* ─── Types ─── */
interface Field {
  field: string;
  current: string;
  howToChange: string;
  file: string;
  important?: string;
}
interface GuideSection {
  id: string;
  title: string;
  description: string;
  fields: Field[];
}

/* ════════════════════════════════════════════════════════════════════════════
   ALL GUIDE SECTIONS — FIELD BY FIELD
   ════════════════════════════════════════════════════════════════════════ */

const guide: GuideSection[] = [
  /* ──────────────────────────────────────────────────────────────────────
     1.  HERO SECTION
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "hero",
    title: "Hero Section",
    description:
      "The full-screen opening section. Contains the headline, subtitle, two CTA buttons, a portrait photo, availability chip, and four floating skill chips.",
    fields: [
      {
        field: "Headline (quick swap)",
        current:
          'A: "DYSIGNS. Where ideas turn into pull."\nB: "DYSIGNS. Start with intent. End with impact."\nC: "DYSIGNS. The beginning of your next standard."\nD: "DYSIGNS. From first scroll to final detail."\nE: "DYSIGNS. Where brands find their shape."\nF: "DYSIGNS. Built to be remembered."',
        howToChange:
          'Open content.ts. Find the line:\n\nexport const activeHeadline: HeadlineKey = "A";\n\nChange "A" to any letter B\u2013F. Save. Done.',
        file: "/src/app/data/content.ts  \u2192  line 16",
      },
      {
        field: "Headline (write your own)",
        current: "(see above)",
        howToChange:
          'Step 1 \u2014 content.ts:\nAdd a new option to heroOptions:\n\nheroOptions.G = "DYSIGNS. Your custom headline.";\n\nThen set:\nexport const activeHeadline: HeadlineKey = "G";\n\nStep 2 \u2014 useLanguage.tsx:\nAdd the i18n key inside the dict object:\n\n"hero.headline.G": {\n  en: "DYSIGNS. Your custom headline.",\n  nl: "DYSIGNS. Jouw aangepaste kop.",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
        important:
          "Always update BOTH files. content.ts is the English default; useLanguage.tsx holds both EN and NL.",
      },
      {
        field: "Subtitle",
        current:
          '"We craft brands, products, and digital experiences that move people forward."',
        howToChange:
          'Step 1 \u2014 content.ts line 21:\nChange the sub value:\n\nsub: "Your new subtitle here.",\n\nStep 2 \u2014 useLanguage.tsx, key "hero.sub":\n\n"hero.sub": {\n  en: "Your new subtitle here.",\n  nl: "Jouw nieuwe ondertitel hier.",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "CTA Button 1 (left button)",
        current: '"View our work"',
        howToChange:
          'content.ts line 22:\ncta1: "See all projects",\n\nuseLanguage.tsx key "hero.cta1":\n"hero.cta1": { en: "See all projects", nl: "Bekijk alle projecten" },',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "CTA Button 2 (right button)",
        current: '"Start a project"',
        howToChange:
          'content.ts line 23:\ncta2: "Get in touch",\n\nuseLanguage.tsx key "hero.cta2":\n"hero.cta2": { en: "Get in touch", nl: "Neem contact op" },',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Portrait photo",
        current: "Unsplash photo (dramatic B&W portrait)",
        howToChange:
          "content.ts line 24\u201325:\nReplace the URL string in hero.portrait with your own image URL.\n\nportrait: \"https://your-cdn.com/your-portrait.jpg\",\n\nRecommended: portrait orientation, minimum 1080px wide, dark/moody aesthetic.",
        file: "/src/app/data/content.ts",
      },
      {
        field: "Availability chip",
        current: '"Available for projects"',
        howToChange:
          'useLanguage.tsx key "hero.available":\n\n"hero.available": {\n  en: "Booked until March",\n  nl: "Volgeboekt tot maart",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Skill chips (4 floating labels)",
        current: "UX / UI \u2022 Brand Identity \u2022 Web Design \u2022 Product",
        howToChange:
          'useLanguage.tsx keys:\n\n"hero.chip.ux": { en: "UX / UI", nl: "UX / UI" },\n"hero.chip.brand": { en: "Brand Identity", nl: "Merkidentiteit" },\n"hero.chip.web": { en: "Web Design", nl: "Webdesign" },\n"hero.chip.product": { en: "Product", nl: "Product" },\n\nChange the text values. Keep them short (1\u20133 words).',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     2.  SENTENCE REVEAL
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "sentence",
    title: "Sentence Reveal Section",
    description:
      'The scroll-driven text reveal that pins and reveals one sentence character by character. Currently shows "We are DYSIGNS."',
    fields: [
      {
        field: "Sentence text",
        current: '"We are DYSIGNS."',
        howToChange:
          'useLanguage.tsx key "sentence":\n\n"sentence": {\n  en: "Design with intention.",\n  nl: "Ontwerpen met intentie.",\n},\n\nKeep it short (3\u20137 words). Long sentences break the reveal effect.',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     3.  PROJECTS / CASE STUDIES
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "projects",
    title: "Projects & Case Studies (9 projects)",
    description:
      "Projects appear in the ZoomToGrid section, the /work page, and as individual case pages at /work/<slug>. All data lives in projects.ts.",
    fields: [
      {
        field: "Project structure (each project has these fields)",
        current:
          "slug \u2022 title \u2022 category \u2022 tags[] \u2022 year \u2022 thumbnail \u2022 overview \u2022 outcomes[] \u2022 gallery[]",
        howToChange:
          'Each project is an object in the projects[] array.\n\nExample of a complete project:\n\n{\n  slug: "nova-brand-platform",\n  title: "Nova Brand Platform",\n  category: "Branding",\n  tags: ["Brand Identity", "Web Design", "Design System"],\n  year: "2025",\n  thumbnail: "https://images.unsplash.com/photo-...",\n  overview: "We partnered with Nova Finance to reimagine...",\n  outcomes: [\n    "42% increase in brand recall",\n    "Design system adopted across 3 teams",\n    "Reduced handoff time by 60%",\n  ],\n  gallery: [\n    "https://images.unsplash.com/photo-...",\n    "https://images.unsplash.com/photo-...",\n    "https://images.unsplash.com/photo-...",\n  ],\n}',
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Change a project\u2019s thumbnail image",
        current: "Each project has a thumbnail: URL",
        howToChange:
          "Find the project in projects.ts by its slug name.\nReplace the thumbnail URL:\n\nthumbnail: \"https://your-cdn.com/new-thumbnail.jpg\",\n\nRecommended: landscape orientation, minimum 1080px wide.\nThis image appears on the /work grid, ZoomToGrid tiles, and case detail hero.",
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Change a project\u2019s gallery images",
        current: "Each project has 3 gallery images",
        howToChange:
          'Find the project in projects.ts.\nReplace URLs inside the gallery[] array:\n\ngallery: [\n  "https://your-cdn.com/gallery-1.jpg",\n  "https://your-cdn.com/gallery-2.jpg",\n  "https://your-cdn.com/gallery-3.jpg",\n],\n\nYou can use 3 or 4 images. These appear on the case detail page (/work/<slug>).',
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Change a project\u2019s text (title / overview / outcomes)",
        current: "(varies per project)",
        howToChange:
          'Find the project by slug in projects.ts.\nEdit these fields:\n\ntitle: "New Project Title",\noverview: "New paragraph describing the project...",\noutcomes: [\n  "New result 1",\n  "New result 2",\n  "New result 3",\n],',
        file: "/src/app/data/projects.ts",
        important:
          "Project text is NOT translated through the i18n system (only English). If you need Dutch project text, you would need to extend the i18n dictionary.",
      },
      {
        field: "Change a project\u2019s category / tags",
        current:
          'Categories: "Branding", "Product", "Web"\nTags: "Brand Identity", "Web Design", "Mobile App", etc.',
        howToChange:
          'Edit the category and tags[] fields:\n\ncategory: "Product",\ntags: ["SaaS", "Product Design", "Design System"],\n\nCategories auto-generate filter tabs on /work. Adding a new unique category string creates a new filter tab automatically.',
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Add a brand new project",
        current: "9 projects exist",
        howToChange:
          'Add a new object at any position in the projects[] array:\n\n{\n  slug: "acme-rebrand",          // URL-safe, lowercase, hyphens only\n  title: "Acme Rebrand",\n  category: "Branding",\n  tags: ["Brand Identity"],\n  year: "2026",\n  thumbnail: "https://...",\n  overview: "A description paragraph...",\n  outcomes: ["Result 1", "Result 2", "Result 3"],\n  gallery: ["https://...", "https://...", "https://..."],\n}\n\nThe page /work/acme-rebrand is live immediately. No routing changes needed.',
        file: "/src/app/data/projects.ts",
        important:
          "The slug must be unique and URL-safe (lowercase letters, numbers, hyphens only). Array order = display order on the site.",
      },
      {
        field: "Remove a project",
        current: "(delete the object from the array)",
        howToChange:
          "Find the project object in the projects[] array.\nDelete the entire { ... } block including the trailing comma.\nSave. No other files need changing.",
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Reorder projects",
        current: "Array order = display order",
        howToChange:
          "Cut and paste project objects within the projects[] array.\nThe first project appears top-left in the grid; the last appears bottom-right.",
        file: "/src/app/data/projects.ts",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     4.  ZOOM-TO-GRID SECTION
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "zoomtogrid",
    title: "Zoom-to-Grid Section (Homepage)",
    description:
      "The scroll-driven zoom-out animation that reveals a 3\u00d73 project grid. Has a large hero background image and 8 surrounding tile images, plus a two-line heading.",
    fields: [
      {
        field: "Hero background image (large center image)",
        current: "Abstract architecture B&W Unsplash photo",
        howToChange:
          'In projects.ts, find zoomToGridData.heroImage:\n\nheroImage: "https://your-cdn.com/new-hero.jpg",\n\nRecommended: dramatic, landscape, minimum 1920px wide.',
        file: "/src/app/data/projects.ts  \u2192  line ~228",
      },
      {
        field: "Grid tile images (8 surrounding thumbnails)",
        current: "8 Unsplash images in gridImages[]",
        howToChange:
          "In projects.ts, find zoomToGridData.gridImages[].\nReplace individual URLs or all 8:\n\ngridImages: [\n  \"https://...\",  // top-left\n  \"https://...\",  // top-center\n  \"https://...\",  // top-right\n  \"https://...\",  // middle-left\n  \"https://...\",  // middle-right\n  \"https://...\",  // bottom-left\n  \"https://...\",  // bottom-center\n  \"https://...\",  // bottom-right\n],",
        file: "/src/app/data/projects.ts  \u2192  line ~232",
        important:
          "Planned improvement: these should eventually use each project\u2019s own thumbnail automatically. For now, they are separate URLs.",
      },
      {
        field: 'Heading line 1 ("Selected projects")',
        current: '"Selected projects" / "Geselecteerde projecten"',
        howToChange:
          'useLanguage.tsx key "zoom.start":\n\n"zoom.start": {\n  en: "Featured work",\n  nl: "Uitgelicht werk",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: 'Heading line 2 ("we\'re proud of")',
        current: '"we\'re proud of" / "waar we trots op zijn"',
        howToChange:
          'useLanguage.tsx key "zoom.end":\n\n"zoom.end": {\n  en: "we love",\n  nl: "waar we van houden",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     5.  PARTNER LOGOS
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "partners",
    title: "Partner Logos (Trusted By)",
    description:
      'The infinite horizontal scrolling logo ticker. Shows company names with placeholder SVG marks. Section label says "Trusted by".',
    fields: [
      {
        field: "Company names list",
        current:
          "Stripe, Notion, Linear, Vercel, Figma, Webflow, Framer, Arc",
        howToChange:
          'content.ts, siteContent.trustedBy[]:\n\ntrustedBy: [\n  "ClientA",\n  "ClientB",\n  "ClientC",\n  "ClientD",\n],\n\nThese names are only used as aria-labels for accessibility. The actual logos are SVG components.',
        file: "/src/app/data/content.ts  \u2192  line 28\u201337",
      },
      {
        field: "Replace logos with real client SVGs",
        current: "Placeholder geometric SVGs",
        howToChange:
          "Open Partners.tsx.\nEach logo is a function component (StripeLogo, NotionLogo, etc.).\n\nOption A: Replace the SVG markup inside each component with your real client SVG code.\n\nOption B: Import SVG files:\nimport ClientLogo from \"/path/to/logo.svg\";\nThen render: <img src={ClientLogo} alt=\"Client\" />",
        file: "/src/app/components/home/Partners.tsx",
      },
      {
        field: 'Section label ("Trusted by")',
        current: '"Trusted by" / "Vertrouwd door"',
        howToChange:
          'useLanguage.tsx key "partners.label":\n\n"partners.label": {\n  en: "Our clients",\n  nl: "Onze klanten",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     6.  VISION SECTION
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "vision",
    title: 'Vision Section ("We are DYSIGNS")',
    description:
      "The full-width image + text block below the partners. Shows a statement about the practice.",
    fields: [
      {
        field: "Title",
        current: '"We are DYSIGNS."',
        howToChange:
          'content.ts, siteContent.vision.title:\ntitle: "Your new title.",\n\nuseLanguage.tsx key "vision.title":\n"vision.title": { en: "Your new title.", nl: "Jouw nieuwe titel." },',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Body text",
        current:
          '"We believe great design sits at the intersection of strategy and craft..."',
        howToChange:
          'content.ts, siteContent.vision.text:\ntext: "Your new body text...",\n\nuseLanguage.tsx key "vision.text":\n"vision.text": {\n  en: "Your new body text...",\n  nl: "Jouw nieuwe tekst...",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Background image",
        current: "Abstract architecture dark moody (Unsplash)",
        howToChange:
          'content.ts, siteContent.vision.image:\n\nimage: "https://your-cdn.com/vision-bg.jpg",',
        file: "/src/app/data/content.ts  \u2192  line ~106",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     7.  DESIGN TIMELINE (Process Steps)
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "timeline",
    title: "Design Timeline (6 Process Steps)",
    description:
      "Horizontal scroll-pinned section showing the design process: Discover \u2192 Define \u2192 Design \u2192 Prototype \u2192 Build \u2192 Launch.",
    fields: [
      {
        field: "Step titles and descriptions",
        current:
          "Discover \u2022 Define \u2022 Design \u2022 Prototype \u2022 Build \u2022 Launch (each with a description)",
        howToChange:
          'Step 1 \u2014 content.ts, siteContent.designProcess[]:\nEdit the title and description of each step:\n\n{\n  id: "discover",\n  title: "Research",\n  description: "Your new description...",\n},\n\nStep 2 \u2014 useLanguage.tsx, keys timeline.0.title through timeline.5.desc:\n\n"timeline.0.title": { en: "Research", nl: "Onderzoek" },\n"timeline.0.desc": {\n  en: "Your new description...",\n  nl: "Jouw nieuwe beschrijving...",\n},\n\nThe index numbers (0\u20135) correspond to the array position.',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
        important:
          "If you add or remove steps, update both files and adjust the index numbers in useLanguage.tsx.",
      },
      {
        field: 'Section label ("How we design")',
        current: '"How we design" / "Hoe we ontwerpen"',
        howToChange:
          'useLanguage.tsx key "timeline.label":\n\n"timeline.label": { en: "Our process", nl: "Ons proces" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     8.  SERVICES (4 cards)
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "services",
    title: "Services (4 Service Cards)",
    description:
      "Four cards on the homepage: Brand Identity, Web Design, Product Design, Creative Direction. Each has an icon, title, and description.",
    fields: [
      {
        field: "Service titles and descriptions",
        current:
          "Brand Identity \u2022 Web Design \u2022 Product Design \u2022 Creative Direction",
        howToChange:
          'Step 1 \u2014 content.ts, siteContent.services[]:\n\n{\n  title: "Motion Design",\n  description: "Your new description...",\n},\n\nStep 2 \u2014 useLanguage.tsx, keys services.0.title through services.3.desc:\n\n"services.0.title": { en: "Motion Design", nl: "Motion Design" },\n"services.0.desc": {\n  en: "Your new description...",\n  nl: "Jouw nieuwe beschrijving...",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Service icons",
        current: "Palette, Layout, Box, Compass (from lucide-react)",
        howToChange:
          'Open Services.tsx.\nThe icons are mapped by array index:\n\nconst icons = [Palette, Layout, Box, Compass];\n\nTo change an icon:\n1. Import a new icon at the top: import { Brush } from "lucide-react";\n2. Replace it in the array: const icons = [Brush, Layout, Box, Compass];\n\nBrowse all icons at: https://lucide.dev/icons',
        file: "/src/app/components/home/Services.tsx  \u2192  line 11",
      },
      {
        field: "Section heading",
        current: '"What we do" / "Services"',
        howToChange:
          'useLanguage.tsx:\n\n"services.label": { en: "What we offer", nl: "Wat we bieden" },\n"services.title": { en: "Our Services", nl: "Onze Diensten" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     9.  TESTIMONIALS (Kind Words Slider)
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "testimonials",
    title: "Testimonials / Kind Words (8 entries)",
    description:
      "Swiper slider on the homepage. Each slide shows a quote, person name, role, company, and headshot photo. Auto-plays and supports drag/arrows.",
    fields: [
      {
        field: "Each testimonial has these fields",
        current: "id \u2022 quote \u2022 name \u2022 role \u2022 company \u2022 avatar",
        howToChange:
          'content.ts, siteContent.testimonials[]:\n\n{\n  id: "t1",                                    // unique ID\n  quote: "English fallback quote text.",        // shown if i18n key is missing\n  name: "Sarah Chen",                          // person\u2019s name\n  role: "CEO",                                  // their title\n  company: "Nova Finance",                     // their company\n  avatar: "https://images.unsplash.com/...",   // headshot URL\n}',
        file: "/src/app/data/content.ts  \u2192  line 171\u2013252",
        important:
          'The DISPLAYED quote text comes from useLanguage.tsx, NOT from this quote field. This quote is only a fallback.',
      },
      {
        field: "Change the quote text (English + Dutch)",
        current: "(8 quotes with EN and NL translations)",
        howToChange:
          'useLanguage.tsx, key "testimonial.<id>.quote":\n\n"testimonial.t1.quote": {\n  en: "Your new English quote here.",\n  nl: "Uw nieuwe Nederlandse quote hier.",\n},\n\nThe id (t1, t2, etc.) must match the id in content.ts.',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Change a headshot photo",
        current: "Unsplash professional portraits",
        howToChange:
          'content.ts, find the testimonial by name:\n\navatar: "https://your-cdn.com/new-headshot.jpg",\n\nRecommended: square or portrait orientation, minimum 400px, professional headshot style.',
        file: "/src/app/data/content.ts",
      },
      {
        field: "Change name, role, or company",
        current: "e.g. Sarah Chen, CEO, Nova Finance",
        howToChange:
          'content.ts, find the testimonial by id:\n\nname: "Jane Doe",\nrole: "CTO",\ncompany: "Acme Inc",',
        file: "/src/app/data/content.ts",
      },
      {
        field: "Add a new testimonial",
        current: "8 testimonials (t1\u2013t8)",
        howToChange:
          'Step 1 \u2014 content.ts:\nAdd to siteContent.testimonials[]:\n\n{\n  id: "t9",\n  quote: "English fallback.",\n  name: "New Person",\n  role: "Director",\n  company: "New Company",\n  avatar: "https://...",\n},\n\nStep 2 \u2014 useLanguage.tsx:\nAdd the quote key:\n\n"testimonial.t9.quote": {\n  en: "The real English quote.",\n  nl: "De echte Nederlandse quote.",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Remove a testimonial",
        current: "(delete from both files)",
        howToChange:
          'Step 1: Delete the { ... } block from siteContent.testimonials[] in content.ts.\nStep 2: Delete the matching "testimonial.<id>.quote" key from useLanguage.tsx.',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Section heading",
        current:
          '"Words of praise" / "Woorden van lof"',
        howToChange:
          'useLanguage.tsx:\n\n"testimonials.label": { en: "Testimonials", nl: "Ervaringen" },\n"testimonials.heading1": { en: "Words of", nl: "Woorden van" },\n"testimonials.heading2": { en: "praise", nl: "lof" },\n"testimonials.sub": {\n  en: "What our collaborators say...",\n  nl: "Wat onze partners zeggen...",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     10.  CONTACT INFO
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "contact",
    title: "Contact Information",
    description:
      "Contact details used across the ContactBand (homepage), Contact page, Header, and Footer.",
    fields: [
      {
        field: "Email address",
        current: '"hello@dysigns.co"',
        howToChange:
          'content.ts, siteContent.contact.email:\n\nemail: "info@dysigns.co",\n\nThis updates everywhere automatically (Header, Footer, ContactBand, Contact page).',
        file: "/src/app/data/content.ts  \u2192  line 257",
      },
      {
        field: "WhatsApp number",
        current: '"+31612345678"  (PLACEHOLDER \u2014 replace before launch!)',
        howToChange:
          'content.ts, siteContent.contact.whatsapp:\n\nwhatsapp: "+31687654321",\n\nMust include country code. Used for wa.me links across the site.',
        file: "/src/app/data/content.ts  \u2192  line 258",
        important:
          "This is currently a placeholder number. Replace with the real WhatsApp number before going live.",
      },
      {
        field: "Contact headline",
        current: '"Let\u2019s build something together"',
        howToChange:
          'content.ts line 255:\nheadline: "Ready to collaborate?",\n\nuseLanguage.tsx key "contact.headline":\n"contact.headline": {\n  en: "Ready to collaborate?",\n  nl: "Klaar om samen te werken?",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Contact subtitle",
        current:
          '"Got a project in mind? We\u2019d love to make something extraordinary with you."',
        howToChange:
          'content.ts line 256:\nsub: "Your new subtitle.",\n\nuseLanguage.tsx key "contact.sub":\n"contact.sub": {\n  en: "Your new subtitle.",\n  nl: "Jouw nieuwe ondertitel.",\n},',
        file: "/src/app/data/content.ts + /src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     11.  SOCIAL LINKS
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "socials",
    title: "Social Media Links",
    description:
      "Social platform links used in the Footer and Contact page.",
    fields: [
      {
        field: "Social links list",
        current:
          'Dribbble (#) \u2022 Behance (#) \u2022 LinkedIn (#) \u2022 Twitter / X (#) \u2022 Instagram (#)\n\nAll URLs are currently "#" (placeholder)',
        howToChange:
          'content.ts, siteContent.socials[]:\n\nsocials: [\n  { name: "Dribbble", url: "https://dribbble.com/dysigns" },\n  { name: "Behance", url: "https://behance.net/dysigns" },\n  { name: "LinkedIn", url: "https://linkedin.com/company/dysigns" },\n  { name: "Twitter / X", url: "https://x.com/dysigns" },\n  { name: "Instagram", url: "https://instagram.com/dysigns" },\n],\n\nTo remove a platform, delete its { ... } from the array.\nTo add one, add a new { name, url } object.',
        file: "/src/app/data/content.ts  \u2192  line 261\u2013267",
        important:
          "Replace ALL # placeholders with real URLs before launch.",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     12.  ABOUT PAGE
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "about",
    title: "About Page",
    description:
      "The /about page with story section, 4 value cards, and a CTA. All text is in the i18n dictionary.",
    fields: [
      {
        field: "Hero image",
        current: "Creative team office overhead view (Unsplash)",
        howToChange:
          'projects.ts, aboutImage:\n\nexport const aboutImage = "https://your-cdn.com/about-hero.jpg";\n\nRecommended: landscape, minimum 1080px wide.',
        file: "/src/app/data/projects.ts  \u2192  line 244",
      },
      {
        field: "Story title",
        current: '"Design with intention, build with care"',
        howToChange:
          'useLanguage.tsx key "about.storyTitle":\n\n"about.storyTitle": {\n  en: "Your new story title",\n  nl: "Jouw nieuwe titel",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Story body text",
        current: '"We bring together strategic thinking..."',
        howToChange:
          'useLanguage.tsx key "about.storyText":\n\n"about.storyText": {\n  en: "Your new body text...",\n  nl: "Jouw nieuwe tekst...",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Value cards (4 cards)",
        current:
          "Craft over shortcuts \u2022 Strategy first \u2022 Honest collaboration \u2022 Lasting impact",
        howToChange:
          'useLanguage.tsx, keys about.value0 through about.value3:\n\n"about.value0.title": { en: "New value title", nl: "Nieuwe waarde titel" },\n"about.value0.text": {\n  en: "New value description...",\n  nl: "Nieuwe waarde beschrijving...",\n},\n\nRepeat for value1, value2, value3.',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "CTA section at bottom",
        current:
          '"Interested in working together?" / "Get in touch"',
        howToChange:
          'useLanguage.tsx:\n\n"about.ctaTitle": {\n  en: "Want to start a project?",\n  nl: "Wil je een project starten?",\n},\n"about.ctaButton": { en: "Contact us", nl: "Neem contact op" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Page label & values section label",
        current: '"About us" / "What we believe"',
        howToChange:
          'useLanguage.tsx:\n\n"about.label": { en: "About us", nl: "Over ons" },\n"about.valuesLabel": { en: "What we believe", nl: "Waar we in geloven" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     13.  WORK PAGE
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "work",
    title: "Work Page (/work)",
    description:
      "Project grid with category filter tabs. Projects come from projects.ts. Labels are from i18n.",
    fields: [
      {
        field: "Page heading & labels",
        current: '"Our work" / "Selected projects" / "All"',
        howToChange:
          'useLanguage.tsx:\n\n"work.label": { en: "Our work", nl: "Ons werk" },\n"work.title": { en: "Selected projects", nl: "Geselecteerde projecten" },\n"work.filterAll": { en: "All", nl: "Alle" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Filter tabs",
        current: "All \u2022 Branding \u2022 Product \u2022 Web",
        howToChange:
          'Filter tabs are auto-generated from unique category values in projects.ts.\n\nIf you add a project with category: "Motion", a "Motion" tab appears automatically.\nIf you remove all projects in a category, that tab disappears.',
        file: "/src/app/data/projects.ts  (project.category)",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     14.  CASE DETAIL PAGE
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "case",
    title: "Case Detail Page (/work/<slug>)",
    description:
      "Individual project pages. Shows hero image, title, category, tags, year, overview text, outcomes list, gallery images, and prev/next navigation.",
    fields: [
      {
        field: "All project content on this page",
        current: "(pulled from projects.ts)",
        howToChange:
          "Everything on this page comes from the project\u2019s object in projects.ts:\n\n\u2022 Hero image = thumbnail\n\u2022 Title, category, tags, year = shown in the header\n\u2022 Overview = body paragraph\n\u2022 Outcomes = bulleted results list\n\u2022 Gallery = image grid below the text\n\nEdit the project object in projects.ts (see Projects section above).",
        file: "/src/app/data/projects.ts",
      },
      {
        field: "Page labels",
        current:
          '"Back to work" \u2022 "Overview" \u2022 "Outcomes" \u2022 "Previous" \u2022 "Next"',
        howToChange:
          'useLanguage.tsx:\n\n"case.back": { en: "Back to work", nl: "Terug naar werk" },\n"case.overview": { en: "Overview", nl: "Overzicht" },\n"case.outcomes": { en: "Outcomes", nl: "Resultaten" },\n"case.previous": { en: "Previous", nl: "Vorige" },\n"case.next": { en: "Next", nl: "Volgende" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     15.  NAVIGATION
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "navigation",
    title: "Navigation (Header & Footer)",
    description:
      "The floating pill nav in the header, the DYSIGNS logo, and the footer.",
    fields: [
      {
        field: "Nav link labels",
        current: "Work \u2022 About \u2022 Contact",
        howToChange:
          'useLanguage.tsx:\n\n"nav.work": { en: "Work", nl: "Werk" },\n"nav.about": { en: "About", nl: "Over ons" },\n"nav.contact": { en: "Contact", nl: "Contact" },',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "DYSIGNS logo",
        current: "PNG imported via ../../",
        howToChange:
          "The logo is imported in Header.tsx and Footer.tsx as:\nimport logoImg from \"../..//10e8a99b...png\";\n\nTo change the logo, replace the PNG file in /src/imports/ with a new one, keeping the same filename.\n\nAlternatively, import a different file and update the import path in both Header.tsx and Footer.tsx.",
        file: "/src/app/components/Header.tsx + Footer.tsx",
      },
      {
        field: "Footer copyright text",
        current: '"All rights reserved."',
        howToChange:
          'useLanguage.tsx key "footer.rights":\n\n"footer.rights": {\n  en: "All rights reserved.",\n  nl: "Alle rechten voorbehouden.",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
      {
        field: "Language toggle tooltip",
        current: '"Switch to Dutch" / "Switch to English"',
        howToChange:
          'useLanguage.tsx key "lang.switchTo":\n\n"lang.switchTo": {\n  en: "Switch to Dutch",\n  nl: "Switch to English",\n},',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     16.  CURSOR LABELS
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "cursor",
    title: "Cursor Labels (Premium Cursor System)",
    description:
      "The custom cursor shows contextual labels when hovering over interactive elements. All labels are translatable.",
    fields: [
      {
        field: "All cursor labels",
        current:
          "HOME \u2022 VIEW \u2022 VIEW PROJECT \u2022 VIEW WORK \u2022 OPEN \u2022 BACK \u2022 EMAIL \u2022 WHATSAPP \u2022 DRAG \u2022 PLAY \u2022 CONTACT \u2022 PREVIOUS \u2022 NEXT",
        howToChange:
          'useLanguage.tsx, all keys starting with "cursor.":\n\n"cursor.view": { en: "VIEW", nl: "BEKIJK" },\n"cursor.drag": { en: "DRAG", nl: "SLEEP" },\n"cursor.email": { en: "EMAIL", nl: "E-MAIL" },\netc.\n\nKeep all labels UPPERCASE and short (1\u20132 words max).',
        file: "/src/app/hooks/useLanguage.tsx",
      },
    ],
  },

  /* ──────────────────────────────────────────────────────────────────────
     17.  IMAGES (General)
     ────────────────────────────────────────────────────────────────────── */
  {
    id: "images",
    title: "Images \u2014 General Rules",
    description:
      "How to handle all images across the site. Every image is a URL string in the data files.",
    fields: [
      {
        field: "Replacing any Unsplash image",
        current: "All images are Unsplash URLs with ?w=1080",
        howToChange:
          "Find the URL string in content.ts or projects.ts.\nReplace it with your own URL.\n\nIf using Unsplash, keep the ?w=1080 parameter for consistent quality.\nIf using your own CDN, use URLs that serve images at 1080px+ width.",
        file: "/src/app/data/content.ts or projects.ts",
      },
      {
        field: "Recommended image sizes",
        current: "",
        howToChange:
          "\u2022 Hero portrait: 1080px+ wide, portrait orientation\n\u2022 Project thumbnails: 1080px+ wide, landscape orientation\n\u2022 Project gallery: 1080px+ wide, any orientation\n\u2022 Testimonial headshots: 400px+ wide, square or portrait\n\u2022 Vision background: 1080px+ wide, landscape, dark/moody\n\u2022 About hero: 1080px+ wide, landscape\n\u2022 ZoomToGrid hero: 1920px+ wide, dramatic landscape",
        file: "(applies to all image URLs)",
      },
      {
        field: "Image format",
        current: "JPG via Unsplash",
        howToChange:
          "Supported formats: JPG, PNG, WebP, AVIF.\nJPG is fine for photos. Use WebP for smaller file sizes.\nAvoid GIF (too large) and SVG (for logos only, not photos).",
        file: "(applies to all image URLs)",
      },
    ],
  },
];

/* ════════════════════════════════════════════════════════════════════════════
   UI COMPONENTS
   ════════════════════════════════════════════════════════════════════════ */

function SideNavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left transition-all"
      style={{
        padding: "5px 12px",
        borderRadius: 6,
        fontSize: ".78rem",
        fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,.45)",
        background: active ? "rgba(255,255,255,.07)" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      style={{
        marginTop: 8,
        padding: "12px 14px",
        borderRadius: 8,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.06)",
        fontSize: ".72rem",
        lineHeight: 1.65,
        color: "rgba(255,255,255,.65)",
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

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: ".62rem",
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: "#000",
        background: "#facc15",
        padding: "2px 8px",
        borderRadius: 4,
        marginLeft: 8,
        verticalAlign: "middle",
      }}
    >
      {text}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   DocsPage COMPONENT
   ════════════════════════════════════════════════════════════════════════ */

export default function DocsPage() {
  const [activeId, setActiveId] = useState(guide[0].id);

  const scrollTo = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#000", color: "#fff" }}>
      <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-16 py-24 md:py-36">
        {/* ── Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: ".65rem",
              fontWeight: 600,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.35)",
              marginBottom: 12,
            }}
          >
            DYSIGNS \u2014 Internal Reference
          </span>
          <h1
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
              fontWeight: 700,
              letterSpacing: "-.04em",
              lineHeight: 1.1,
              marginBottom: ".75rem",
            }}
          >
            Content Editing Guide
          </h1>
          <p
            style={{
              fontSize: ".95rem",
              lineHeight: 1.7,
              color: "rgba(255,255,255,.5)",
              maxWidth: "44rem",
            }}
          >
            How to change every piece of text, every image, every project, and
            every translation on the DYSIGNS site. Field by field, with exact
            file paths and code examples.
          </p>
        </div>

        {/* ── Key files overview ── */}
        <div
          className="rounded-xl"
          style={{
            padding: "1.25rem 1.5rem",
            background: "rgba(255,255,255,.025)",
            border: "1px solid rgba(255,255,255,.06)",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: ".82rem",
              fontWeight: 700,
              marginBottom: 10,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            The 3 Files You Need
          </h2>
          <div className="grid sm:grid-cols-3 gap-3" style={{ fontSize: ".8rem" }}>
            {[
              {
                n: "1",
                file: "content.ts",
                path: "/src/app/data/content.ts",
                what: "Hero, vision, services, testimonials (name/role/avatar), contact email & WhatsApp, social links",
              },
              {
                n: "2",
                file: "projects.ts",
                path: "/src/app/data/projects.ts",
                what: "All 9 projects (title, images, text, outcomes), ZoomToGrid images, About page image",
              },
              {
                n: "3",
                file: "useLanguage.tsx",
                path: "/src/app/hooks/useLanguage.tsx",
                what: "Every string in English + Dutch (all labels, headings, quotes, buttons, cursor hints)",
              },
            ].map((f) => (
              <div
                key={f.n}
                className="rounded-lg"
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.1)",
                      fontSize: ".65rem",
                      fontWeight: 700,
                    }}
                  >
                    {f.n}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: ".82rem" }}>{f.file}</span>
                </div>
                <code
                  style={{
                    display: "block",
                    fontSize: ".65rem",
                    color: "rgba(255,255,255,.4)",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: 4,
                    wordBreak: "break-all",
                  }}
                >
                  {f.path}
                </code>
                <p style={{ color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{f.what}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Golden rule ── */}
        <div
          className="rounded-xl"
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(250,204,21,.06)",
            border: "1px solid rgba(250,204,21,.15)",
            marginBottom: "2.5rem",
            fontSize: ".82rem",
            lineHeight: 1.6,
            color: "rgba(255,255,255,.7)",
          }}
        >
          <strong style={{ color: "#facc15" }}>Golden rule:</strong> If you
          change text in <code style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>content.ts</code>, also
          update the matching key in{" "}
          <code style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>useLanguage.tsx</code> so both English and
          Dutch stay in sync. If you only change an image URL or a name/role/company,{" "}
          <code style={{ fontSize: ".72rem", color: "rgba(255,255,255,.5)" }}>content.ts</code> alone is enough.
        </div>

        {/* ── Layout: sidebar + main ── */}
        <div className="flex gap-10">
          {/* Sidebar */}
          <nav
            className="hidden lg:block shrink-0"
            style={{ width: 200, position: "sticky", top: 110, alignSelf: "flex-start" }}
          >
            <div className="flex flex-col gap-0.5">
              {guide.map((s, i) => (
                <SideNavItem
                  key={s.id}
                  label={`${i + 1}. ${s.title}`}
                  active={activeId === s.id}
                  onClick={() => scrollTo(s.id)}
                />
              ))}
            </div>
          </nav>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {guide.map((section, si) => (
              <div
                key={section.id}
                id={`guide-${section.id}`}
                style={{ marginBottom: "3.5rem", scrollMarginTop: 100 }}
              >
                {/* Section header */}
                <div
                  style={{
                    paddingBottom: 10,
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                    marginBottom: 12,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      letterSpacing: "-.02em",
                    }}
                  >
                    {si + 1}. {section.title}
                  </h2>
                  <p
                    style={{
                      fontSize: ".84rem",
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,.45)",
                      marginTop: 4,
                      maxWidth: "40rem",
                    }}
                  >
                    {section.description}
                  </p>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-3">
                  {section.fields.map((f, fi) => (
                    <div
                      key={`${section.id}-${fi}`}
                      className="rounded-lg"
                      style={{
                        padding: "1rem 1.25rem",
                        background: "rgba(255,255,255,.02)",
                        border: "1px solid rgba(255,255,255,.06)",
                      }}
                    >
                      {/* Field name + file path */}
                      <div className="flex flex-wrap items-baseline gap-2 mb-2">
                        <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#fff" }}>
                          {f.field}
                        </span>
                        {f.important && <Badge text="Important" />}
                      </div>

                      {/* File location */}
                      <div
                        className="rounded"
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          background: "rgba(255,255,255,.05)",
                          marginBottom: 10,
                        }}
                      >
                        <code
                          style={{
                            fontSize: ".68rem",
                            fontWeight: 500,
                            color: "rgba(255,255,255,.5)",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}
                        >
                          {f.file}
                        </code>
                      </div>

                      {/* Current value */}
                      {f.current && (
                        <div style={{ marginBottom: 10 }}>
                          <span
                            style={{
                              display: "block",
                              fontSize: ".7rem",
                              fontWeight: 600,
                              letterSpacing: ".08em",
                              textTransform: "uppercase",
                              color: "rgba(255,255,255,.3)",
                              marginBottom: 4,
                            }}
                          >
                            Current value
                          </span>
                          <div
                            style={{
                              padding: "8px 12px",
                              borderRadius: 6,
                              background: "rgba(255,255,255,.03)",
                              border: "1px solid rgba(255,255,255,.05)",
                              fontSize: ".78rem",
                              lineHeight: 1.6,
                              color: "rgba(255,255,255,.6)",
                              whiteSpace: "pre-wrap",
                              fontFamily: f.current.includes('"') ? "'JetBrains Mono', monospace" : "inherit",
                            }}
                          >
                            {f.current}
                          </div>
                        </div>
                      )}

                      {/* How to change */}
                      <div>
                        <span
                          style={{
                            display: "block",
                            fontSize: ".7rem",
                            fontWeight: 600,
                            letterSpacing: ".08em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,.3)",
                            marginBottom: 4,
                          }}
                        >
                          How to change
                        </span>
                        <CodeBlock code={f.howToChange} />
                      </div>

                      {/* Important note */}
                      {f.important && (
                        <div
                          className="mt-3 rounded"
                          style={{
                            padding: "8px 12px",
                            background: "rgba(250,204,21,.05)",
                            border: "1px solid rgba(250,204,21,.12)",
                            fontSize: ".78rem",
                            lineHeight: 1.55,
                            color: "rgba(255,255,255,.65)",
                          }}
                        >
                          <strong style={{ color: "#facc15" }}>Note:</strong> {f.important}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Voice & Style Rules ── */}
            <div
              id="guide-voice"
              className="rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
                marginBottom: "2rem",
                scrollMarginTop: 100,
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: 14,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Voice & Style Rules
              </h2>
              <div className="grid sm:grid-cols-2 gap-3" style={{ fontSize: ".82rem" }}>
                {[
                  {
                    rule: "Pronouns",
                    detail: 'Always "we / our / us". Never "I / my" or third person.',
                  },
                  {
                    rule: "Identity",
                    detail:
                      'Call it "DYSIGNS" or "a design practice". Never "agency", "studio", "firm", or "company".',
                  },
                  {
                    rule: "Tone",
                    detail:
                      "Confident, concise, no fluff. Every sentence must earn its place.",
                  },
                  {
                    rule: "Formatting",
                    detail:
                      "Use em dashes (\u2014) not hyphens. Curly quotes where possible. Short paragraphs (2\u20133 sentences).",
                  },
                ].map((r) => (
                  <div
                    key={r.rule}
                    className="rounded-lg"
                    style={{
                      padding: "10px 14px",
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.05)",
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: ".84rem" }}>{r.rule}</span>
                    <p style={{ color: "rgba(255,255,255,.5)", marginTop: 3, lineHeight: 1.55 }}>
                      {r.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Post-edit checklist ── */}
            <div
              className="rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.06)",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                After Every Edit \u2014 Checklist
              </h2>
              <ol
                className="flex flex-col gap-2"
                style={{
                  fontSize: ".84rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,.55)",
                  listStyle: "decimal inside",
                }}
              >
                <li>Save the file(s).</li>
                <li>
                  Check the dev server \u2014 Vite HMR shows changes instantly.
                </li>
                <li>
                  If you changed text: update the matching key in useLanguage.tsx for EN + NL.
                </li>
                <li>
                  Toggle the EN/NL pill in the header to verify both languages.
                </li>
                <li>Verify any new image URLs load (no broken images).</li>
                <li>
                  Test on mobile \u2014 especially long quotes and project
                  titles.
                </li>
                <li>
                  Check /work to confirm new projects appear with correct category filters.
                </li>
                <li>Deploy when satisfied.</li>
              </ol>
            </div>

            {/* ── Pre-launch checklist ── */}
            <div
              className="rounded-xl"
              style={{
                padding: "1.5rem 1.75rem",
                background: "rgba(255,255,255,.025)",
                border: "1px solid rgba(255,255,255,.08)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  marginBottom: 12,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Before Going Live \u2014 Replace These Placeholders
              </h2>
              <ul
                className="flex flex-col gap-2"
                style={{
                  fontSize: ".84rem",
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,.55)",
                  listStyle: "disc inside",
                }}
              >
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>WhatsApp number</strong>{" "}
                  \u2014 content.ts line 258 \u2014 currently "+31612345678" (placeholder).
                </li>
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>Social links</strong>{" "}
                  \u2014 content.ts line 261\u2013267 \u2014 all URLs are "#" (placeholder).
                </li>
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>All Unsplash images</strong>{" "}
                  \u2014 replace with real project photos, real team headshots, and real client testimonial portraits.
                </li>
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>Partner logos</strong>{" "}
                  \u2014 Partners.tsx \u2014 replace placeholder SVGs with real client logos.
                </li>
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>Testimonial people</strong>{" "}
                  \u2014 content.ts \u2014 replace placeholder names/roles/companies with real clients (with permission).
                </li>
                <li>
                  <strong style={{ color: "rgba(255,255,255,.8)" }}>Project case studies</strong>{" "}
                  \u2014 projects.ts \u2014 replace placeholder projects with real work.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

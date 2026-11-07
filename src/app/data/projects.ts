/* ─── DYSIGNS — Project Data ─────────────────────────────────────────────
 *  Projects with slug, thumbnail, gallery, overview,
 *  outcomes, and tags.
 *
 *  HOW TO ADD A NEW CASE:
 *  1. Add an entry to the `projects` array below with a unique `slug`.
 *  2. Supply a `thumbnail` URL (Unsplash or your own CDN).
 *  3. Add 3-4 `gallery` image URLs.
 *  4. Write an `overview` paragraph and 3-5 `outcomes`.
 *  5. The router will automatically resolve `/work/<slug>`.
 * ──────────────────────────────────────────────────────────────────────── */

export interface Project {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  year: string;
  url?: string;
  thumbnail: string;
  /** Optional cover video (mp4) — plays muted/looped in place of the
   * thumbnail on the home grid card and the case detail hero. */
  video?: string;
  overview: string;
  outcomes: string[];
  gallery: string[];
  /** When true, the cover and each gallery image get hand-written alt text
   * from the `project.<slug>.alt.cover` / `.alt.<index>` translation keys. */
  customAlt?: boolean;
  /** Hand-written SEO title/description from the `project.<slug>.seoTitle` /
   * `.seoDescription` translation keys, plus a 1200x630 JPG for social
   * sharing (AVIF is not read by social crawlers). */
  customSeo?: boolean;
  ogImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** Gallery images show in full colour (no grayscale/dim treatment) — for
   * photography-led cases where the muted look would flatten the work. */
  cleanGallery?: boolean;
  /** Gallery indexes that span the full width (2:1) instead of one 16:10
   * column — for wide compositions such as a row of app screens. */
  galleryWide?: number[];
  /** Cover has a centred logo that must never be cropped: the hero image is
   * sized so the logo always fits the viewport, with matching edge colours
   * filling any leftover space. */
  logoSafeCover?: boolean;
  /** Portrait cover used on small screens (<768px) instead of `thumbnail`. */
  thumbnailMobile?: string;
  /** Cover video (mp4) for the home grid card and the case hero — muted and
   * looped. The work page keeps the image. */
  coverVideo?: string;
  /** Portrait cover video used on small screens instead of `coverVideo`. */
  coverVideoMobile?: string;
  /** Still from the cover video: its poster, and the image the zoom-in
   * transition grows into so the case hero picks up where it left off. */
  coverVideoPoster?: string;
  coverVideoPosterMobile?: string;
  /** Second of the cover video the poster was taken from; the case hero
   * starts playing there so it continues seamlessly from the transition. */
  coverVideoPosterTime?: number;
  /** Resolved alt texts (filled in by useTranslatedProjects). */
  thumbnailAlt?: string;
  galleryAlt?: string[];
  /** Optional before/after image pairs — rendered as their own labeled
   * side-by-side row in the case detail gallery, always 2-up even on
   * mobile, kept separate from the general `gallery` grid. */
  beforeAfter?: { before: string; after: string; label?: string }[];
  /** App store listings, shown as download buttons next to the visit link. */
  storeLinks?: { appStore?: string; googlePlay?: string };
}

export const projects: Project[] = [
  {
    slug: "sfumato-agency",
    title: "Sfumato Agency",
    category: "Web",
    tags: ["Web Design", "Creative Direction", "Photography", "Brand Identity"],
    year: "2026",
    thumbnail: "/images/sfumato-cover.avif",
    thumbnailMobile: "/images/sfumato-cover-mobile.avif",
    coverVideo: "/videos/sfumato-cover-v3.mp4",
    coverVideoMobile: "/videos/sfumato-cover-mobile-v3.mp4",
    coverVideoPoster: "/images/sfumato-cover-poster-v2.avif",
    coverVideoPosterMobile: "/images/sfumato-cover-poster-mobile-v2.avif",
    coverVideoPosterTime: 2.6,
    overview:
      "Together with Sfumato Agency we defined their content vision for video and photography, and turned their own Italian style, inspired by Leonardo da Vinci, into a web design. Sfumato comes from the Italian fumo, smoke: Leonardo's way of letting tones melt into one another without a hard line. That idea became the rulebook for everything they make, from light graded towards amber to slow reveals, long takes and frames with room to breathe. We captured it in a moodboard with its own palette, from pergamena to inchiostro, a type system of Bodoni and handwriting, and three principles: no hard lines, golden light and con calma. The website follows the same rules. Their work lies on parchment like sepia prints with a cream edge, every case opens on the film or photo first, and small details from Leonardo's notebooks, such as mirror writing and hand-drawn rulers, give it a signature without getting in the way. The result is a portfolio that feels like Sfumato's own work: calm, warm and a little mysterious.",
    outcomes: [],
    customAlt: true,
    customSeo: true,
    ogImage: "/images/og-sfumato.jpg",
    cleanGallery: true,
    galleryWide: [0, 3, 6],
    gallery: [
      "/images/sfumato-moodboard.avif",
      "/images/sfumato-prints.avif",
      "/images/sfumato-principles.avif",
      "/images/sfumato-website.avif",
      "/images/sfumato-work.avif",
      "/images/sfumato-case.avif",
      "/images/sfumato-mobile.avif",
    ],
  },
  {
    slug: "stelz-app",
    title: "STËLZ App",
    category: "Digital",
    tags: ["Mobile App", "UX Design", "Development", "Motion Design"],
    year: "2026",
    thumbnail: "/images/stelz-app-cover-empty.png",
    storeLinks: {
      appStore: "https://apps.apple.com/nl/app/st%C3%ABlz/id6773376256",
      googlePlay: "https://play.google.com/store/apps/details?id=com.stelz.app",
    },
    overview:
      "STËLZ asked us to build their own app, and we designed and developed it from the first sketch to the App Store and Google Play. The first campaign in the app is Strijd voor je smaak 2026: fans pick their favourite from six flavours, and the maker of the winning flavour takes home \u20ac50,000. Every vote has to count exactly once, so each one is confirmed with an email code and checked on the server before it is stored, while the result stays hidden until the campaign closes. Voting should feel like a moment, so motion sits at the heart of the design: cans you swipe through, springy feedback on every tap and a thank-you screen that celebrates your choice. Push notifications keep fans in the loop on new flavours, events and campaigns. One codebase runs on both iOS and Android, built to grow with STËLZ from a campaign app into a full brand app. Design, development and motion under one roof, from the first screen to the store listing.",
    outcomes: [],
    customAlt: true,
    customSeo: true,
    ogImage: "/images/og-stelz-app.jpg",
    cleanGallery: true,
    galleryWide: [0, 3, 6],
    gallery: [
      "/images/stelz-app-flavours.avif",
      "/images/stelz-app-onboarding.avif",
      "/images/stelz-app-vote.avif",
      "/images/stelz-app-team.avif",
      "/images/stelz-app-result.avif",
      "/images/stelz-app-community.avif",
      "/images/stelz-app-flow.avif",
    ],
  },
  {
    slug: "stelz-web-design",
    title: "STELZ web design",
    category: "Web",
    tags: ["Web Design", "UX Design", "Development"],
    year: "2026 January",
    url: "https://drinkstelz.com/",
    thumbnail:"/images/mobilestelz.avif",
    overview:
      "STËLZ asked us to redesign their website to lift conversion and keep updates easy. We delivered a modular Shopify experience with faster collection discovery, a smoother add to cart flow, and clear content structure for quick day to day edits.",
    outcomes: [
      "Lead generation up 65%",
      "Average time on site doubled",
      "Mobile conversion rate improved 3\u00d7",
      "Won CSS Design Awards site of the month",
    ],
    gallery: [
      "/images/old-new.avif",
      "/images/stelz-laptop.avif"

    ],
  },
  {
    slug: "verkeersschool-beckers-branding",
    title: "Verkeersschool Beckers Branding",
    category: "Social Media Management",
    tags: ["Branding", "Print", "Web"],
    year: "2026",
    url: "https://verkeersschoolbeckers.nl/",
    thumbnail: "/images/beckers-cover-laptop-v3.avif",
    overview:
      "For Verkeersschool Beckers, we developed a complete new brand identity to modernize and professionalize their presence in the Dutch market. The project included a full logo redesign, visual identity system, and consistent brand application across all touchpoints.\n\nWe translated the new identity into social media assets, vehicle branding, and a fully redesigned website. The result is a cohesive and recognizable brand that builds trust and stands out both online and on the road.",
    outcomes: [
      "Complete logo redesign and new visual identity delivered",
      "Brand system translated across social media, web, and vehicle branding",
      "More professional and recognizable market presence",
      "A consistent identity ready for long-term growth",
    ],
    gallery: [
      "/images/beckers-cover-laptop-v3.avif",
      "/images/beckers-car-branding.avif",
      "/images/beckers-phone-mockup.avif",
      "/images/beckers-brand-board.png",
      "/images/beckers-logo-lockup.png",
    ],
  },
  {
    slug: "powermobile",
    title: "PowerMobile",
    category: "Digital",
    tags: ["UX Design", "Development", "Mobile App", "Dashboard", "SaaS"],
    year: "2026",
    thumbnail: "/images/powermobile-hero.avif",
    overview:
      "The Challenge\n\nFor enforcement officers and other field workers in the VTH sector (Vergunning, Toezicht en Handhaving), the real work happens on the street. Yet these government professionals were using an outdated app that made case management in the field unnecessarily slow and cumbersome. There was an urgent need for a fast, reliable system that supported their work rather than slowing it down.\n\nThe Solution\n\nTo tackle this, I designed and developed PowerMobile entirely from scratch. As lead for both design and technical development, I built a modern, case-oriented system that makes permit and case management directly accessible in the field. The app features an intuitive interface for managing cases, consulting interactive maps, and tracking workflows\u2014fully responsive across all devices.\n\nThe Result\n\nEvery part of PowerMobile was shaped around the day-to-day realities of government professionals. The impact was immediate: user satisfaction rose from 15% with the old system to over 40% with the new app.",
    outcomes: [
      "User satisfaction increased from 15% to 40% post-launch",
      "Full app built from scratch \u2014 design through development",
      "Interactive map integration for real-time field case management",
      "Adopted across multiple government institutions in the VTH sector",
    ],
    gallery: [
      "/images/powermobile-overview.avif",
      "/images/powermobile-devices.avif",
      "/images/powermobile-maps.avif",
    ],
  },
  {
    slug: "a-cafe-app-design",
    title: "A/Café POS & Kiosk Design",
    category: "Product Design",
    tags: ["POS Design", "Kiosk Design", "UX Design", "Email Marketing"],
    year: "2026",
    thumbnail: "/images/a-cafe/kiosk-after.avif",
    video: "/videos/a-cafe-cover-v2.mp4",
    overview:
      "What began as an MVP for a single self-ordering kiosk grew into a full ordering system: DYSIGNS designed the kiosk, the POS and the kitchen display as one connected product, all speaking the same visual language. Email marketing was set up end to end alongside it. The system is now running in test phase across A/Café's physical stores worldwide, from Amsterdam and Paris to Dubai and Miami, with guests ordering, staff fulfilling and the brand showing through at every step.",
    outcomes: [
      "One visual system spans kiosk, POS and kitchen display end to end",
      "Now running in test phase across A/Café stores in Amsterdam, Paris, Dubai and Miami",
      "Built from an MVP concept through to a real in-store pilot",
      "Guest, staff and brand all speak the same visual language",
    ],
    gallery: [
      "/images/a-cafe/pos-order.avif",
      "/images/a-cafe/pos-payment-successful.avif",
    ],
    beforeAfter: [
      { before: "/images/a-cafe/kiosk-before.avif", after: "/images/a-cafe/kiosk-after.avif" },
    ],
  },
  {
    slug: "studio75-branding",
    title: "Studio75 Branding",
    category: "Branding",
    tags: ["Brand Identity", "Logo Design", "Print"],
    year: "2026",
    thumbnail: "/images/studio75-cover.avif",
    overview:
      "We created the brand identity for Studio75, from the first moodboard to the logo, colours, typography and business cards. Every identity we make starts the same way: by listening. Together with the founder we collected references, from nightlife and movement to typographic posters and texture, until a taste emerged that was unmistakably Studio75. From there our team worked fast and with focus, exploring three logo directions around a bold asterisk symbol, from expressive and handmade to clean and textured, and turning the chosen one into a complete system: palette, type and print assets, all documented in a brandbook. The result is a premium foundation that feels as sharp on a business card as it does on a screen. At DYSIGNS we bring your idea and your passion to life, and because the base is right from day one, everything built on top of it holds together.",
    outcomes: [],
    customAlt: true,
    customSeo: true,
    ogImage: "/images/og-studio75.jpg",
    cleanGallery: true,
    logoSafeCover: true,
    thumbnailMobile: "/images/studio75-cover-mobile.avif",
    gallery: [
      "/images/studio75-moodboard.avif",
      "/images/studio75-logo-variants.avif",
      "/images/studio75-business-cards.avif",
      "/images/studio75-typography.avif",
    ],
  },
  {
    slug: "merely-made-webshop",
    title: "Merely Made Webshop",
    category: "Web",
    tags: ["Web Design", "Development", "E-Commerce"],
    year: "2026",
    url: "https://merelymade.com/",
    thumbnail: "/images/merelymade-cover.avif",
    thumbnailMobile: "/images/merelymade-cover-mobile.avif",
    coverVideo: "/videos/merelymade-cover-v3.mp4",
    coverVideoMobile: "/videos/merelymade-cover-mobile-v3.mp4",
    coverVideoPoster: "/images/merelymade-cover-poster.avif",
    coverVideoPosterMobile: "/images/merelymade-cover-poster-mobile.avif",
    coverVideoPosterTime: 1.25,
    overview:
      "We designed, developed and built the webshop for Merely Made, the Korean fashion brand from Seoul, sold in 32 stores from Paris to Tokyo. The brand already had a strong identity, so we started by understanding it: the calm tone, the quiet confidence and the room around every garment. We then translated that identity into web design, with negative space as the main design tool, so the clothes and photography can breathe and the interface stays out of the way. With a fast, focused team we built the store from scratch, from home page and lookbook to shop, product pages and stockists, designed and built for desktop and mobile together. Design and development under one roof means no handoff delays, just a webshop that goes live fast and fits a brand that sells worldwide.",
    outcomes: [],
    customAlt: true,
    customSeo: true,
    ogImage: "/images/og-merely-made.jpg",
    cleanGallery: true,
    gallery: [
      "/images/merelymade-web-hero.avif",
      "/images/merelymade-shop.avif",
      "/images/merelymade-lookbook.avif",
      "/images/merelymade-product.avif",
      "/images/merelymade-new-arrivals.avif",
      "/images/merelymade-mobile.avif",
    ],
  },
];

/** Zoom-to-grid section hero image — grid tiles now use each project's own
 * `thumbnail` directly instead of a separately curated image list, so a
 * tile can never show a different project's photo than the one it links to. */
export const zoomToGridData = {
  heroImage: "/images/mobilestelz.avif",
};

export const aboutImage =
  "https://images.unsplash.com/photo-1707598973296-255b29445512?crop=entropy&cs=tinysrgb&fit=max&auto=format&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRlYW0lMjBvZmZpY2UlMjBvdmVyaGVhZCUyMHZpZXd8ZW58MXx8fHwxNzcxNTA4NTE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

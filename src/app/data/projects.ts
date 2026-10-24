/* ─── DYSIGNS — Project Data ─────────────────────────────────────────────
 *  9 placeholder projects with slug, thumbnail, gallery, overview,
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
}

export const projects: Project[] = [
  {
    slug: "nova-brand-platform",
    title: "Nova Brand Platform",
    category: "Branding",
    tags: ["Brand Identity", "Web Design", "Design System"],
    year: "2025",
    thumbnail:
      "https://images.unsplash.com/photo-1604074131228-9d48b811bd80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwZGVzaWduJTIwZGVza3RvcHxlbnwxfHx8fDE3NzE0NTU0NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "We partnered with Nova Finance to reimagine their entire brand ecosystem\u2014from visual identity through to a comprehensive design system spanning web, mobile, and print. The result is a cohesive platform that communicates trust, innovation, and accessibility across every touchpoint.",
    outcomes: [
      "42% increase in brand recall within 6 months",
      "Design system adopted across 3 internal teams",
      "Reduced design-to-dev handoff time by 60%",
      "Featured in Awwwards SOTD collection",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1706700392626-5279fb90ae73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwc2hvd2Nhc2UlMjBsYXB0b3AlMjBtb2NrdXB8ZW58MXx8fHwxNzcxNTA4NTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1685463894505-d33387aa8430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlZnJhbWUlMjBkZXNpZ24lMjBwcm9jZXNzJTIwc2tldGNoaW5nfGVufDF8fHx8MTc3MTUwODUxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1614036634955-ae5e90f9b9eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGlkZW50aXR5JTIwZGVzaWduJTIwYm9vayUyMGVsZWdhbnR8ZW58MXx8fHwxNzcxNTA4NTIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    slug: "meridian-app-redesign",
    title: "Meridian App Redesign",
    category: "Digital",
    tags: ["Mobile App", "UX Design"],
    year: "2025",
    thumbnail:
      "https://images.unsplash.com/photo-1663153203126-08bbadc178ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ24lMjBpbnRlcmZhY2UlMjBkYXJrfGVufDF8fHx8MTc3MTM5MDcxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "Meridian Health needed a mobile experience that made complex health data feel simple and empowering. We redesigned every screen with a focus on clarity, emotional reassurance, and accessibility\u2014resulting in an app people actually want to open every day.",
    outcomes: [
      "4.8-star App Store rating post-launch",
      "Daily active users up 128%",
      "Onboarding completion rate improved by 45%",
      "Accessibility AA compliance achieved",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1632156752251-e3759ed58466?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBpbnRlcmZhY2UlMjBkYXJrJTIwdGhlbWV8ZW58MXx8fHwxNzcxNDg1ODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1685463894505-d33387aa8430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlZnJhbWUlMjBkZXNpZ24lMjBwcm9jZXNzJTIwc2tldGNoaW5nfGVufDF8fHx8MTc3MTUwODUxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1764437180200-f0fd57fa15d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwbW90aW9uJTIwZ3JhcGhpY3MlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzE1MDg1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    slug: "arco-ecommerce",
    title: "Arco E-Commerce",
    category: "Web",
    tags: ["E-Commerce", "Development"],
    year: "2024",
    thumbnail:
      "https://images.unsplash.com/photo-1760804876166-aae5861ec7c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlJTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NzE0NTU0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "Arco Living is a premium furniture brand that needed an online presence matching the quality of their craft. We designed and built a bespoke e-commerce experience emphasizing materiality, detail photography, and a frictionless purchase journey.",
    outcomes: [
      "Conversion rate up 38% vs. previous platform",
      "Average session duration increased by 2.4\u00d7",
      "Bounce rate dropped 22%",
      "Shortlisted for FWA of the Day",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1706700392626-5279fb90ae73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwc2hvd2Nhc2UlMjBsYXB0b3AlMjBtb2NrdXB8ZW58MXx8fHwxNzcxNTA4NTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWduJTIwcHJvdG90eXBlJTIwbWluaW1hbHxlbnwxfHx8fDE3NzE1MDg1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMHN0YXRpb25lcnklMjBtb2NrdXAlMjBlbGVnYW50fGVufDF8fHx8MTc3MTUwODUxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    ],
  },
  {
    slug: "pulse-analytics",
    title: "Pulse Analytics",
    category: "Digital",
    tags: ["Dashboard", "SaaS", "Data Viz"],
    year: "2024",
    thumbnail:
      "https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYWFTJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzJTIwZGVzaWdufGVufDF8fHx8MTc3MTQ1NTQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "Pulse needed to transform dense analytical data into actionable insights for non-technical stakeholders. We created a dashboard experience that balances power with simplicity\u2014making complex data accessible at a glance.",
    outcomes: [
      "User task completion time reduced by 55%",
      "NPS score jumped from 32 to 71",
      "Enterprise plan adoption up 40%",
      "Zero-training onboarding achieved",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1764437180200-f0fd57fa15d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwbW90aW9uJTIwZ3JhcGhpY3MlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzE1MDg1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1685463894505-d33387aa8430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlZnJhbWUlMjBkZXNpZ24lMjBwcm9jZXNzJTIwc2tldGNoaW5nfGVufDF8fHx8MTc3MTUwODUxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1706700392626-5279fb90ae73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwc2hvd2Nhc2UlMjBsYXB0b3AlMjBtb2NrdXB8ZW58MXx8fHwxNzcxNTA4NTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    thumbnail: "/images/beckers-cover-laptop-v2.avif",
    overview:
      "For Verkeersschool Beckers, we developed a complete new brand identity to modernize and professionalize their presence in the Dutch market. The project included a full logo redesign, visual identity system, and consistent brand application across all touchpoints.\n\nWe translated the new identity into social media assets, vehicle branding, and a fully redesigned website. The result is a cohesive and recognizable brand that builds trust and stands out both online and on the road.",
    outcomes: [
      "Complete logo redesign and new visual identity delivered",
      "Brand system translated across social media, web, and vehicle branding",
      "More professional and recognizable market presence",
      "A consistent identity ready for long-term growth",
    ],
    gallery: [
      "/images/beckers-cover-laptop-v2.avif",
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
    thumbnail: "/images/a-cafe/kiosk-after.jpg",
    video: "/videos/a-cafe-cover.mp4",
    overview:
      "What began as an MVP for a single self-ordering kiosk grew into a full ordering system: DYSIGNS designed the kiosk, the POS and the kitchen display as one connected product, all speaking the same visual language. Email marketing was set up end to end alongside it. The system is now running in test phase across A/Café's physical stores worldwide, from Amsterdam and Paris to Dubai and Miami, with guests ordering, staff fulfilling and the brand showing through at every step.",
    outcomes: [
      "One visual system spans kiosk, POS and kitchen display end to end",
      "Now running in test phase across A/Café stores in Amsterdam, Paris, Dubai and Miami",
      "Built from an MVP concept through to a real in-store pilot",
      "Guest, staff and brand all speak the same visual language",
    ],
    gallery: [
      "/images/a-cafe/pos-order.jpg",
      "/images/a-cafe/pos-payment-successful.jpg",
    ],
    beforeAfter: [
      { before: "/images/a-cafe/kiosk-before.jpg", after: "/images/a-cafe/kiosk-after.jpg" },
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
    thumbnail: "/images/merelymade-cover.avif",
    thumbnailMobile: "/images/merelymade-cover-mobile.avif",
    coverVideo: "/videos/merelymade-cover.mp4",
    coverVideoMobile: "/videos/merelymade-cover-mobile.mp4",
    coverVideoPoster: "/images/merelymade-cover-poster.jpg",
    coverVideoPosterMobile: "/images/merelymade-cover-poster-mobile.jpg",
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
  {
    slug: "flux-motion-identity",
    title: "Flux Motion Identity",
    category: "Branding",
    tags: ["Motion Design", "Brand Identity", "Creative Direction"],
    year: "2023",
    thumbnail:
      "https://images.unsplash.com/photo-1615458509633-f15b61bdacb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3Rpb24lMjBncmFwaGljcyUyMHZpc3VhbCUyMGlkZW50aXR5JTIwc3R1ZGlvfGVufDF8fHx8MTc3MTU4ODQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "Flux is a motion design collective that needed an identity system as dynamic as their work. We created a living brand that shifts and evolves\u2014from generative logo animations to a custom type system and a portfolio site that feels like a reel in itself.",
    outcomes: [
      "Brand launch generated 50K+ social impressions in 48 hours",
      "Inbound project inquiries tripled within the first quarter",
      "Identity system adaptable across 12 different media formats",
      "Featured on It\u2019s Nice That and Brand New",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1647522648980-f69c487fabda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGFnZW5jeSUyMHBvcnRmb2xpbyUyMGRhcmslMjBtaW5pbWFsfGVufDF8fHx8MTc3MTU4ODQ5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1688141585146-1fb4a1358c87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGRlc2lnbiUyMGRhcmslMjBtb29keXxlbnwxfHx8fDE3NzE1ODg0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1615458509633-f15b61bdacb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3Rpb24lMjBncmFwaGljcyUyMHZpc3VhbCUyMGlkZW50aXR5JTIwc3R1ZGlvfGVufDF8fHx8MTc3MTU4ODQ5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
  "https://images.unsplash.com/photo-1707598973296-255b29445512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRlYW0lMjBvZmZpY2UlMjBvdmVyaGVhZCUyMHZpZXd8ZW58MXx8fHwxNzcxNTA4NTE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

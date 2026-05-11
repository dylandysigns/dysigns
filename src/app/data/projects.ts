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
  overview: string;
  outcomes: string[];
  gallery: string[];
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
    thumbnail:"/images/mobilestelz.png",
    overview:
      "STËLZ asked us to redesign their website to lift conversion and keep updates easy. We delivered a modular Shopify experience with faster collection discovery, a smoother add to cart flow, and clear content structure for quick day to day edits.",
    outcomes: [
      "Lead generation up 65%",
      "Average time on site doubled",
      "Mobile conversion rate improved 3\u00d7",
      "Won CSS Design Awards site of the month",
    ],
    gallery: [
      "/images/old-new.png",
      "/images/stelz-laptop.png"

    ],
  },
  {
    slug: "verkeersschool-beckers-branding",
    title: "Verkeersschool Beckers Branding",
    category: "Social Media Management",
    tags: ["Branding", "Print", "Web", "Social Media Management"],
    year: "2026",
    url: "https://verkeersschoolbeckers.nl/",
    thumbnail: "/images/beckers-cover-laptop-v2.png",
    overview:
      "For Verkeersschool Beckers, we developed a complete new brand identity to modernize and professionalize their presence in the Dutch market. The project included a full logo redesign, visual identity system, and consistent brand application across all touchpoints.\n\nWe translated the new identity into social media assets, vehicle branding, and a fully redesigned website. The result is a cohesive and recognizable brand that builds trust and stands out both online and on the road.",
    outcomes: [
      "Complete logo redesign and new visual identity delivered",
      "Brand system translated across social media, web, and vehicle branding",
      "More professional and recognizable market presence",
      "A consistent identity ready for long-term growth",
    ],
    gallery: [
      "/images/beckers-cover-laptop-v2.png",
      "/images/beckers-car-branding.png",
      "/images/beckers-phone-mockup.png",
      "/images/beckers-brand-board.png",
      "/images/beckers-logo-lockup.png",
    ],
  },
  {
    slug: "powermobile",
    title: "PowerMobile",
    category: "Product",
    tags: ["UX Design", "Development", "Mobile App", "Dashboard", "SaaS"],
    year: "2026",
    thumbnail: "/images/powermobile-hero.png",
    overview:
      "The Challenge\n\nFor enforcement officers and other field workers in the VTH sector (Vergunning, Toezicht en Handhaving), the real work happens on the street. Yet these government professionals were using an outdated app that made case management in the field unnecessarily slow and cumbersome. There was an urgent need for a fast, reliable system that supported their work rather than slowing it down.\n\nThe Solution\n\nTo tackle this, I designed and developed PowerMobile entirely from scratch. As lead for both design and technical development, I built a modern, case-oriented system that makes permit and case management directly accessible in the field. The app features an intuitive interface for managing cases, consulting interactive maps, and tracking workflows\u2014fully responsive across all devices.\n\nThe Result\n\nEvery part of PowerMobile was shaped around the day-to-day realities of government professionals. The impact was immediate: user satisfaction rose from 15% with the old system to over 40% with the new app.",
    outcomes: [
      "User satisfaction increased from 15% to 40% post-launch",
      "Full app built from scratch \u2014 design through development",
      "Interactive map integration for real-time field case management",
      "Adopted across multiple government institutions in the VTH sector",
    ],
    gallery: [
      "/images/powermobile-overview.png",
      "/images/powermobile-devices.png",
      "/images/powermobile-maps.png",
    ],
  },
  {
    slug: "orbit-saas-platform",
    title: "Orbit SaaS Platform",
    category: "Digital",
    tags: ["SaaS", "Dashboard", "Design System"],
    year: "2023",
    thumbnail:
      "https://images.unsplash.com/photo-1764437180200-f0fd57fa15d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwbW90aW9uJTIwZ3JhcGhpY3MlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzE1MDg1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    overview:
      "Orbit needed to evolve from a developer tool into a platform teams actually enjoy using. We redesigned the entire platform experience\u2014dashboard, settings, workflows\u2014and built a design system that scales with their engineering velocity.",
    outcomes: [
      "User activation rate improved 67%",
      "Support tickets reduced by 40%",
      "Design system covers 95% of UI patterns",
      "Raised Series B shortly after redesign launch",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1685463894505-d33387aa8430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlZnJhbWUlMjBkZXNpZ24lMjBwcm9jZXNzJTIwc2tldGNoaW5nfGVufDF8fHx8MTc3MTUwODUxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1706700392626-5279fb90ae73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWJzaXRlJTIwZGVzaWduJTIwc2hvd2Nhc2UlMjBsYXB0b3AlMjBtb2NrdXB8ZW58MXx8fHwxNzcxNTA4NTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1764437180200-f0fd57fa15d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0JTIwbW90aW9uJTIwZ3JhcGhpY3MlMjBhYnN0cmFjdHxlbnwxfHx8fDE3NzE1MDg1MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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

/** Zoom-to-grid section images and headlines */
export const zoomToGridData = {
  heroImage:"../images/mobilestelz.png",
  headlineStart: "Projects",
  headlineEnd: "we're proud of",
  gridImages: [
    "https://images.unsplash.com/photo-1761404382584-9e3ff1da40d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMG1vZGVybiUyMGRhcmslMjBtb29keXxlbnwxfHx8fDE3NzE1MDg1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1558707538-c56435bdcdf3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0eXBvZ3JhcGh5JTIwcG9zdGVyJTIwZGVzaWduJTIwbW9ub2Nocm9tZXxlbnwxfHx8fDE3NzE1MDg1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWduJTIwcHJvdG90eXBlJTIwbWluaW1hbHxlbnwxfHx8fDE3NzE1MDg1MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZGluZyUyMHN0YXRpb25lcnklMjBtb2NrdXAlMjBlbGVnYW50fGVufDF8fHx8MTc3MTUwODUxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "/images/beckers-cover-laptop-v2.png",
    "https://images.unsplash.com/photo-1769458711046-23eab6a083b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZGl0b3JpYWwlMjBwaG90b2dyYXBoeSUyMG1hZ2F6aW5lJTIwc3ByZWFkfGVufDF8fHx8MTc3MTUwODUxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1575176647987-4c1a2e598950?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBwYWNrYWdpbmclMjBkZXNpZ24lMjBlbGVnYW50JTIwZGFya3xlbnwxfHx8fDE3NzE1ODg0OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    "https://images.unsplash.com/photo-1688141585146-1fb4a1358c87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGdlb21ldHJpYyUyMGRlc2lnbiUyMGRhcmslMjBtb29keXxlbnwxfHx8fDE3NzE1ODg0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  ],
};

export const aboutImage =
  "https://images.unsplash.com/photo-1707598973296-255b29445512?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHRlYW0lMjBvZmZpY2UlMjBvdmVyaGVhZCUyMHZpZXd8ZW58MXx8fHwxNzcxNTA4NTE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

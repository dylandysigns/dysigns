/* ─── DYSIGNS — Content Data ────────────────────────────────────────────────
 *  Voice: "we / our". Never use "agency", "studio", or "my".
 *  Hero headline options — swap headlineA‑F and set activeHeadline below.
 * ───────────────────────────────────────────────────────────────────────── */

export const heroOptions = {
  A: "DYSIGNS. Where ideas turn into pull.",
  B: "DYSIGNS. Start with intent. End with impact.",
  C: "DYSIGNS. The beginning of your next standard.",
  D: "DYSIGNS. From first scroll to final detail.",
  E: "DYSIGNS. Where brands find their shape.",
  F: "DYSIGNS. Built to be remembered.",
};

export type HeadlineKey = keyof typeof heroOptions;
export const activeHeadline: HeadlineKey = "A"; // ← change to swap

export const siteContent = {
  hero: {
    headline: heroOptions[activeHeadline],
    sub: "We craft brands, products, and digital experiences that move people forward.",
    cta1: "See work",
    cta2: "Start a project",
    portrait:
      "https://images.unsplash.com/photo-1679505519259-8911b9f296e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMGRpcmVjdG9yJTIwcG9ydHJhaXQlMjBibGFjayUyMHdoaXRlJTIwZHJhbWF0aWMlMjBsaWdodGluZ3xlbnwxfHx8fDE3NzE1MDMzNzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  trustedBy: [
    "Stripe",
    "Notion",
    "Linear",
    "Vercel",
    "Figma",
    "Webflow",
    "Framer",
    "Arc",
  ],

  projects: [
    {
      id: "1",
      title: "Nova Brand Platform",
      category: "Branding",
      tags: ["Brand Identity", "Web Design", "Design System"],
      year: "2025",
      thumbnail:
        "https://images.unsplash.com/photo-1604074131228-9d48b811bd80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3ZWJzaXRlJTIwZGVzaWduJTIwbW9ja3VwJTIwZGVza3RvcHxlbnwxfHx8fDE3NzE0NTU0NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "A" as const,
    },
    {
      id: "2",
      title: "Meridian App Redesign",
      category: "Product",
      tags: ["Mobile App", "UX Design"],
      year: "2025",
      thumbnail:
        "https://images.unsplash.com/photo-1663153203126-08bbadc178ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBkZXNpZ24lMjBpbnRlcmZhY2UlMjBkYXJrfGVufDF8fHx8MTc3MTM5MDcxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "B" as const,
    },
    {
      id: "3",
      title: "Arco E-Commerce",
      category: "Web",
      tags: ["E-Commerce", "Development"],
      year: "2024",
      thumbnail:
        "https://images.unsplash.com/photo-1760804876166-aae5861ec7c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlY29tbWVyY2UlMjB3ZWJzaXRlJTIwbHV4dXJ5JTIwcHJvZHVjdHxlbnwxfHx8fDE3NzE0NTU0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "C" as const,
    },
    {
      id: "4",
      title: "Pulse Analytics",
      category: "Product",
      tags: ["Dashboard", "SaaS", "Data Viz"],
      year: "2024",
      thumbnail:
        "https://images.unsplash.com/photo-1575388902449-6bca946ad549?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTYWFTJTIwZGFzaGJvYXJkJTIwYW5hbHl0aWNzJTIwZGVzaWdufGVufDF8fHx8MTc3MTQ1NTQ2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "D" as const,
    },
    {
      id: "5",
      title: "Haven Real Estate",
      category: "Web",
      tags: ["Web Design", "UX Design"],
      year: "2024",
      thumbnail:
        "https://images.unsplash.com/photo-1617597835919-3fdbf6efe48d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwaW50ZXJpb3IlMjB3aGl0ZXxlbnwxfHx8fDE3NzE0NTU0Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "E" as const,
    },
    {
      id: "6",
      title: "Verso Brand Identity",
      category: "Branding",
      tags: ["Brand Identity", "Print"],
      year: "2024",
      thumbnail:
        "https://images.unsplash.com/photo-1633533447057-56ccf997f4fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFuZCUyMGlkZW50aXR5JTIwZGVzaWduJTIwcGFja2FnaW5nfGVufDF8fHx8MTc3MTM5MDcxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      variant: "F" as const,
    },
  ],

  vision: {
    title: "Create better DYSIGNS",
    text: "We believe great design sits at the intersection of strategy and craft. 8+ years of building brands and products that actually work \u2014 no fluff, no filler, just work that moves the needle.",
    image:
      "https://images.unsplash.com/photo-1485025798926-cde0f0d24cca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGFyY2hpdGVjdHVyZSUyMGRhcmslMjBtb29keSUyMG1pbmltYWx8ZW58MXx8fHwxNzcxNTAzMzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },

  designProcess: [
    {
      id: "discover",
      title: "Discover",
      description:
        "We immerse ourselves in your world \u2014 stakeholder interviews, competitive analysis, user insights.",
    },
    {
      id: "define",
      title: "Define",
      description:
        "Strategy crystallized. We map the problem space and align on a creative brief.",
    },
    {
      id: "design",
      title: "Design",
      description:
        "Concepts take shape. High-fidelity explorations and visual systems.",
    },
    {
      id: "prototype",
      title: "Prototype",
      description:
        "Ideas become tangible. Interactive prototypes to test and refine.",
    },
    {
      id: "build",
      title: "Build",
      description:
        "Pixel-perfect execution alongside engineering. Every detail ships.",
    },
    {
      id: "launch",
      title: "Launch",
      description:
        "The world meets your product. We monitor, optimize, and iterate.",
    },
  ],

  services: [
    {
      title: "Brand Identity",
      description:
        "From strategy to visual identity \u2014 we help brands find their voice and make it impossible to ignore.",
    },
    {
      title: "Web Design",
      description:
        "Websites that combine stunning visuals with strategic thinking. Every page built to perform.",
    },
    {
      title: "Product Design",
      description:
        "Digital products users love. From concept to design system, we bring clarity to complexity.",
    },
    {
      title: "Creative Direction",
      description:
        "We steer the creative vision across campaigns, product launches, and brand initiatives.",
    },
  ],

  testimonials: [
    {
      id: "t1",
      quote:
        "Tevreden partners, strakke deadlines en hoge kwaliteit, samenwerken met DYSIGNS heeft ons merk versterkt en versneld laten groeien",
      name: "Boy Schouten",
      role: "Performance Manager",
      company: "STËLZ",
      avatar:
"/images/boystelz.jpeg" },
    {
      id: "t2",
      quote:
        "In 20 years of running my business, I’ve never had a designer who could visualize my idea that well in just one go.",
      name: "Marleen van Griensven",
      role: "CEO",
      company: "Pure and Cure PR",
      avatar:
"/images/marleenvanpuurpng.png"},
    {
      id: "t3",
      quote:
        "DYSIGNS en Studio75 werken al langere tijd sterk samen met korte lijnen, snelle opleveringen en consistente kwaliteit.",
      name: "Luuk Beudeker",
      role: "Founder",
      company: "Studio75",
      avatar:
"/images/luuk-studio.png"},
    // {
    //   id: "t4",
    //   quote:
    //     "The website they designed didn\u2019t just look incredible \u2014 it transformed how our customers experience our brand.",
    //   name: "Emma Liu",
    //   role: "PM",
    //   company: "Meridian Health",
    //   avatar:
    //     "https://images.unsplash.com/photo-1735565350771-75dbd952a166?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHdvbWFuJTIwY3JlYXRpdmUlMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzE1MTMwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // },
    // {
    //   id: "t5",
    //   quote:
    //     "A refreshing and imaginative team that consistently delivers exceptional results \u2014 highly recommended for any project.",
    //   name: "David Kim",
    //   role: "Director",
    //   company: "Haven Properties",
    //   avatar:
    //     "https://images.unsplash.com/photo-1619193597120-1d1edb42e34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjBtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MTUxMzAwNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // },
    // {
    //   id: "t6",
    //   quote:
    //     "Their artistic flair and strategic approach resulted in remarkable outcomes \u2014 a reliable creative partner we trust completely.",
    //   name: "Rachel Torres",
    //   role: "CMO",
    //   company: "Verso Brands",
    //   avatar:
    //     "https://images.unsplash.com/photo-1655249481446-25d575f1c054?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90JTIwcG9ydHJhaXQlMjBidXNpbmVzc3xlbnwxfHx8fDE3NzE1MTk1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // },
    // {
    //   id: "t7",
    //   quote:
    //     "From concept to execution, their creativity knows no bounds \u2014 a game-changer for our brand\u2019s digital presence.",
    //   name: "Alex Rivera",
    //   role: "Creative Lead",
    //   company: "Outline Co",
    //   avatar:
    //     "https://images.unsplash.com/photo-1642741790806-370d685ffec5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjcmVhdGl2ZSUyMGRpcmVjdG9yJTIwaGVhZHNob3QlMjBwb3J0cmFpdCUyMGRhcmt8ZW58MXx8fHwxNzcxNTE5NTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // },
    // {
    //   id: "t8",
    //   quote:
    //     "Best collaboration experience. Clear communication, exceptional craft, and always delivered ahead of schedule.",
    //   name: "Priya Sharma",
    //   role: "Head of Design",
    //   company: "Aura Digital",
    //   avatar:
    //     "https://images.unsplash.com/photo-1762522926984-e721bff0d6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGV4ZWN1dGl2ZSUyMGhlYWRzaG90JTIwcG9ydHJhaXQlMjBzdHVkaW98ZW58MXx8fHwxNzcxNTE5NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    // },
  ],

  contact: {
    headline: "Let\u2019s build something together",
    sub: "Got a idea in mind? We\u2019d love to make something unique with you.",
    email: "hello@dylandysigns.com",
    whatsapp: "+31626814488",
  },

  socials: [
    // { name: "Dribbble", url: "#" },
    // { name: "Behance", url: "#" },
    // { name: "LinkedIn", url: "#" },
    // { name: "Twitter / X", url: "#" },
    { name: "Instagram", url: "https://www.instagram.com/dylan.kho" },
  ],
};
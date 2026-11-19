import type { Lang } from "../hooks/useLanguage";

/* The line under a project's name on the work tiles (home grid and /work): plain text naming the
   service we delivered, for the projects whose category alone ("Digital") says too little. Anything
   not listed keeps its category. No pills. */
const SERVICES: Record<string, Record<Lang, string>> = {
  "stelz-app": {
    en: "UX/UI design, app development and motion",
    nl: "UX/UI-design, appontwikkeling en motion",
  },
  powermobile: {
    en: "UX/UI design and app development",
    nl: "UX/UI-design en appontwikkeling",
  },
  biyu: {
    en: "UX/UI design and web design",
    nl: "UX/UI-design en webdesign",
  },
};

export function tileSubtitle(slug: string, category: string, lang: Lang): string {
  return SERVICES[slug]?.[lang] ?? category;
}

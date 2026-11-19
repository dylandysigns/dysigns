import type { Lang } from "../hooks/useLanguage";

/* The line under a project's name on the work tiles (home grid and /work): a short piece of the
   case itself, for the projects whose category alone ("Digital") says too little. Anything not
   listed keeps its category. Plain text, no pills. */
const SNIPPETS: Record<string, Record<Lang, string>> = {
  "stelz-app": {
    en: "Fans pick their favourite flavour in the app, built from first sketch to the App Store",
    nl: "Fans kiezen in de app hun favoriete smaak, gebouwd van eerste schets tot App Store",
  },
  powermobile: {
    en: "A fast field app for enforcement officers, built from scratch",
    nl: "Een snelle veldwerk-app voor handhavers, volledig nieuw gebouwd",
  },
  biyu: {
    en: "Rent instead of buy: the app, website and dashboard behind the rentals",
    nl: "Huren in plaats van kopen: de app, website en het dashboard erachter",
  },
};

export function tileSubtitle(slug: string, category: string, lang: Lang): string {
  return SNIPPETS[slug]?.[lang] ?? category;
}

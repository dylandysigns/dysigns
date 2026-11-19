import type { Lang } from "../hooks/useLanguage";

/* The line under a project's name on the work tiles (home grid and /work): what the client needed
   and what we made, in one or two short sentences taken from the case. Plain text, no pills. A project
   that is not listed keeps its category. */
const SNIPPETS: Record<string, Record<Lang, string>> = {
  "stelz-app": {
    en: "A voting campaign needed an app. We built it, from first sketch to the App Store.",
    nl: "Een stemcampagne had een app nodig. Wij bouwden hem, van eerste schets tot App Store.",
  },
  "a-cafe-app-design": {
    en: "Amsterdam and Paris branches needed one ecosystem. We made the design and the handover.",
    nl: "Vestigingen in Amsterdam en Parijs hadden één ecosysteem nodig. Wij maakten het ontwerp en de overdracht.",
  },
  "merely-made-webshop": {
    en: "A Seoul-based fashion brand asked us to build its site from scratch.",
    nl: "Een modemerk uit Seoul vroeg ons om de site helemaal opnieuw te bouwen.",
  },
  "studio75-branding": {
    en: "A new brand needed a look of its own. We made the identity, from moodboard to brandbook.",
    nl: "Een nieuw merk had een eigen gezicht nodig. Wij maakten de identiteit, van moodboard tot brandbook.",
  },
  "stelz-web-design": {
    en: "A website that had to convert better. We rebuilt it as a modular Shopify store.",
    nl: "Een website die beter moest converteren. Wij bouwden hem opnieuw als modulaire Shopify-webshop.",
  },
  biyu: {
    en: "Rent a drill instead of buying one. We designed the app, site and dashboard.",
    nl: "Een boormachine huren in plaats van kopen. Wij ontwierpen de app, site en het dashboard.",
  },
  powermobile: {
    en: "Officers in the field were stuck on a slow app. We built a new one.",
    nl: "Handhavers in het veld liepen vast op een trage app. Wij bouwden een nieuwe.",
  },
  "sfumato-agency": {
    en: "An Italian style inspired by Leonardo. We turned it into a web design.",
    nl: "Een Italiaanse stijl geïnspireerd door Leonardo. Wij maakten er een webdesign van.",
  },
};

export function tileSubtitle(slug: string, category: string, lang: Lang): string {
  return SNIPPETS[slug]?.[lang] ?? category;
}

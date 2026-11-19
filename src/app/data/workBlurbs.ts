import type { Lang } from "../hooks/useLanguage";

/* The line under a project's name on the work tiles (home grid and /work): one personal, informal line
   about the case, in the voice of a studio that likes what it makes. Starts with what we did, never
   a formula. Plain text, no pills. A project that is not listed keeps its category. */
const SNIPPETS: Record<string, Record<Lang, string>> = {
  "stelz-app": {
    en: "Making a vote for your favourite flavour feel like a moment.",
    nl: "Een stem op je favoriete smaak laten voelen als een moment.",
  },
  "a-cafe-app-design": {
    en: "Amsterdam and Paris, one ecosystem. We made the design and the handover.",
    nl: "Amsterdam en Parijs, één ecosysteem. Wij maakten het ontwerp en de overdracht.",
  },
  "merely-made-webshop": {
    en: "Giving a Seoul fashion brand a webshop with room to breathe.",
    nl: "Een webshop met ruimte om te ademen, voor een modemerk uit Seoul.",
  },
  "studio75-branding": {
    en: "From a first moodboard to one bold asterisk that sticks.",
    nl: "Van een eerste moodboard naar één gedurfde asterisk die blijft hangen.",
  },
  "stelz-web-design": {
    en: "Making the STËLZ shop faster to browse and easier to buy from.",
    nl: "De STËLZ-shop sneller om te bladeren en makkelijker om uit te bestellen.",
  },
  biyu: {
    en: "Why buy a drill you use twice a year? We made renting one easy.",
    nl: "Waarom een boormachine kopen die je twee keer per jaar gebruikt? Wij maakten huren makkelijk.",
  },
  powermobile: {
    en: "Getting enforcement officers out of a slow app and back on the street.",
    nl: "Handhavers uit een trage app en terug de straat op.",
  },
  "sfumato-agency": {
    en: "Leonardo's smoke, turned into a calm, warm website.",
    nl: "Leonardo's rook, omgezet in een rustige, warme website.",
  },
};

export function tileSubtitle(slug: string, category: string, lang: Lang): string {
  return SNIPPETS[slug]?.[lang] ?? category;
}

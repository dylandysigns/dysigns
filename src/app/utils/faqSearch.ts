// Instant keyword search over the FAQ index, entirely in the browser.
//
// No model, no download: a few word lists and string compares over ~50
// questions, fast enough to run on every keystroke. Synonym groups map
// everyday NL/EN wording ("wat kost", "prijs", "budget") onto one concept,
// so the obvious questions are found before the semantic search
// (functions/api/faq-search.js) has even answered.

import { plainAnswer, type FaqIndexItem } from "../content/faqIndex";

const STOPWORDS = new Set(
  (
    "de het een en of in op aan van voor met mijn mij je jij jullie jou jouw u uw ik we wij " +
    "is zijn ben bent wordt worden kan kun kunnen kunt wil wilt doe doen doet heb hebt heeft hebben " +
    "dat die dit deze er wat hoe wie welke waar wanneer waarom ook nog al niet geen wel dan als om " +
    "the a an and or in on at of for with my me you your i we our is are am be can could do does " +
    "did have has it this that these those what how who which where when why also not no to from"
  ).split(" "),
);

// Each group is one concept; any word in a group matches any other.
const SYNONYM_GROUPS: string[][] = [
  ["kost", "kosten", "prijs", "prijzen", "tarief", "tarieven", "budget", "betalen", "betaal", "duur", "goedkoop", "offerte", "investering", "euro", "cost", "costs", "price", "pricing", "prices", "rate", "rates", "fee", "fees", "quote", "pay", "expensive", "cheap"],
  ["seo", "google", "gevonden", "vinden", "vindbaar", "vindbaarheid", "zoekmachine", "zoekmachines", "ranking", "ranken", "search", "findable"],
  ["shopify", "webshop", "webwinkel", "winkel", "store", "shop", "ecommerce", "e-commerce"],
  // Platform names map to "Which platforms do you build on?", which says
  // the choice is made per project (the site makes no claim either way
  // about WordPress and the like).
  ["platform", "platforms", "wordpress", "woocommerce", "webflow", "framer", "wix", "squarespace", "lightspeed", "magento", "drupal", "joomla", "cms", "medusa", "headless"],
  ["website", "site", "websites", "webdesign", "webpagina", "landingspagina", "page", "landing"],
  ["taal", "talen", "engels", "nederlands", "spreek", "spreken", "language", "languages", "english", "dutch", "speak"],
  ["buitenland", "internationaal", "buiten", "nederland", "abroad", "international", "outside", "netherlands", "country", "countries"],
  ["almere", "amsterdam", "regio", "locatie", "langskomen", "location", "area", "nearby"],
  ["ai", "chatgpt", "kunstmatige", "automatisering", "automatiseren", "automation", "artificial"],
  ["social", "socials", "instagram", "facebook", "meta", "tiktok", "ads", "advertenties", "adverteren", "campagne", "campagnes", "advertising", "campaign", "campaigns"],
  ["hoelang", "lang", "duurt", "duren", "tijd", "doorlooptijd", "weken", "maanden", "deadline", "long", "time", "timeline", "weeks", "months"],
  ["logo", "huisstijl", "branding", "merk", "identiteit", "brand", "identity"],
  ["onderhoud", "support", "hosting", "beheer", "beheren", "lancering", "launch", "maintenance", "manage", "after"],
  ["overnemen", "bestaande", "bestaand", "migratie", "migreren", "redesign", "vernieuwen", "existing", "take", "migrate", "rebuild"],
  ["proces", "werkwijze", "onboarding", "stappen", "roadmap", "aanpak", "starten", "beginnen", "process", "steps", "approach", "start"],
  ["design", "ontwerp", "ontwerpen", "ux", "ui", "bouwen", "build", "develop", "development", "ontwikkelen"],
  ["eigenaar", "eigendom", "rechten", "meenemen", "bezit", "owner", "owns", "ownership", "rights"],
  ["team", "samenwerken", "samenwerking", "contact", "persoon", "together", "work", "partner"],
];

const conceptOf = new Map<string, number>();
SYNONYM_GROUPS.forEach((group, i) => group.forEach((w) => conceptOf.set(w, i)));

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // ë -> e
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Concept id for a word, also matching simple inflections ("prijzen" ->
 * "prijs" is listed; "websitekosten" -> "kosten" via suffix). */
function conceptFor(token: string): number | undefined {
  const direct = conceptOf.get(token);
  if (direct !== undefined) return direct;
  if (token.length < 5) return undefined;
  for (const [word, id] of conceptOf) {
    if (word.length >= 4 && (token.endsWith(word) || token.startsWith(word))) return id;
  }
  return undefined;
}

interface Prepared {
  item: FaqIndexItem;
  qTokens: string[];
  aTokens: string[];
  qConcepts: Set<number>;
  aConcepts: Set<number>;
}

const prepCache = new WeakMap<FaqIndexItem[], Prepared[]>();

function prepare(items: FaqIndexItem[]): Prepared[] {
  const hit = prepCache.get(items);
  if (hit) return hit;
  const prepared = items.map((item) => {
    const qTokens = tokenize(item.question);
    const aTokens = tokenize(plainAnswer(item.answer));
    const concepts = (tokens: string[]) =>
      new Set(tokens.map(conceptFor).filter((c): c is number => c !== undefined));
    return { item, qTokens, aTokens, qConcepts: concepts(qTokens), aConcepts: concepts(aTokens) };
  });
  prepCache.set(items, prepared);
  return prepared;
}

function wordHit(term: string, tokens: string[]): boolean {
  // Prefix match from 3 letters on, so results appear while still typing
  // ("prij" already finds "prijs").
  return tokens.some((t) => t === term || (term.length >= 3 && t.startsWith(term)));
}

export interface ScoredFaq {
  item: FaqIndexItem;
  score: number;
}

/** Keyword-ranked matches, best first. Score is 0..1: the share of the
 * query's meaningful words found, with question hits weighing more than
 * answer hits. */
export function searchFaqLocal(items: FaqIndexItem[], query: string, limit = 6): ScoredFaq[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  const results: ScoredFaq[] = [];

  for (const p of prepare(items)) {
    let total = 0;
    for (const term of terms) {
      const concept = conceptFor(term);
      let s = 0;
      if (wordHit(term, p.qTokens)) s = 1;
      else if (concept !== undefined && p.qConcepts.has(concept)) s = 0.8;
      else if (wordHit(term, p.aTokens)) s = 0.45;
      else if (concept !== undefined && p.aConcepts.has(concept)) s = 0.35;
      total += s;
    }
    const score = total / terms.length;
    if (score > 0.2) results.push({ item: p.item, score });
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

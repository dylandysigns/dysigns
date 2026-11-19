import type { Lang } from "../../hooks/useLanguage";

/* ─── About page copy (AboutPage.tsx) ───────────────────────────────────────
 *  Voice: "we / our". Never "agency", "studio" or "my" (see data/content.ts).
 *  No invented numbers, and never a zero as a figure or in list numbering.
 * ───────────────────────────────────────────────────────────────────────── */

export type PillarItem = { label: string; to?: string };

export type AboutCopy = {
  label: string;
  /** The h1, one array per line. Lines are justified edge to edge on desktop. */
  headline: string[][];
  /** [plain, highlighted, plain, highlighted, ...] */
  sub: string[];
  intro: string;
  statementKicker: string;
  statementLead: string;
  /** The big word, split where the video sits. */
  statementWord: [string, string];
  deliverLabel: string;
  deliverTitle: string;
  services: string;
  pillars: { title: string; text: string; items: PillarItem[]; image: string }[];
  storyLabel: string;
  storyTitle: string;
  story: string[];
  facts: { figure: string; text: string }[];
  valuesWord: string;
  valuesSub: string[];
  values: { title: string; text: string }[];
  casesLabel: string;
  links: { work: string; insights: string; social: string };
  topLine: string;
  locationsLabel: string;
  locationsText: string;
  locations: { label: string; to: string }[];
  locationServices: { label: string; to: string }[];
  clientsLabel: string;
  clientsText: string;
};

export const aboutCopy: Record<Lang, AboutCopy> = {
  nl: {
    label: "Over ons",
    headline: [
      ["DYSIGNS", "bouwt", "voor"],
      ["merken", "die", "niet"],
      ["stil", "willen", "staan"],
    ],
    sub: [
      "Een klein team van specialisten dat ",
      "ontwerpt, bouwt en laat groeien.",
      " Zonder wachttijden en ",
      "zonder ruis.",
    ],
    intro:
      "DYSIGNS is jouw creative partner uit Almere en Amsterdam: een digitaal bureau met een klein team van specialisten voor UX/UI design, branding, webdesign, Shopify-webshops, SEO, AI-implementatie en social- en advertentiecampagnes. Eén team in plaats van vier bureaus die naar elkaar wijzen, voor klanten in Nederland en daarbuiten.",
    statementKicker: "Eén partner voor het hele traject, van eerste schets tot de campagne erna.",
    statementLead: "Alles wat we maken is ontworpen om te",
    statementWord: ["Gro", "eien"],
    deliverLabel: "Wat we leveren",
    deliverTitle: "Drie dingen, één team.",
    services: "Diensten",
    pillars: [
      {
        title: "Growth",
        text: "Een merk dat je in één oogopslag herkent en dat op elk scherm klopt, van logo tot laatste knop.",
        items: [
          { label: "Merkstrategie en positionering", to: "/branding" },
          { label: "Visuele identiteit", to: "/branding" },
          { label: "UX/UI design", to: "/ux-ui-design" },
          { label: "Design systems", to: "/ux-ui-design" },
        ],
        image: "/images/merelymade-cover.avif",
      },
      {
        title: "Scale",
        text: "Websites en webshops die snel laden, met AI die het saaie werk uit je handen neemt: slimme chatbots, automatiseringen en tools die met je meegroeien.",
        items: [
          { label: "AI-implementatie", to: "/ai-implementation" },
          { label: "Webdesign en development", to: "/web-design" },
          { label: "Shopify-webshops", to: "/shopify-development" },
          { label: "Technische SEO", to: "/web-design" },
        ],
        image: "/images/stelz-app-work-cover.avif",
      },
      {
        title: "Run it",
        text: "Live gaan is het begin. Daarna zorgen we dat de juiste mensen je vinden, blijven hangen en terugkomen.",
        items: [
          { label: "Social media", to: "/social-media-meta-ads" },
          { label: "Meta ads", to: "/social-media-meta-ads" },
          { label: "Data-gedreven SEO" },
          { label: "Doorlopende optimalisatie" },
        ],
        image: "/images/biyu-campaign.avif",
      },
    ],
    storyLabel: "Ons verhaal",
    storyTitle: "Begonnen als designers. Gebleven als partner.",
    story: [
      "We begonnen als UX- en UI-designers. Schermen, flows, producten: dat was ons ding. Maar we wilden steeds een stapje verder. Wie bedenkt het merk erachter? Wie bouwt de site eromheen? Wie zorgt dat mensen er ook echt naartoe komen? Die nieuwsgierigheid is nooit meer weggegaan.",
      "Onderweg zagen we bij klanten steeds hetzelfde gebeuren. Een kleine aanpassing kostte weken. Niemand wist waar het project stond. De designer wees naar de developer, de developer naar de marketeer. Zo lekt momentum weg, en kansen gaan er gezellig achteraan.",
      "Dus draaiden we het om. Eén vast aanspreekpunt in plaats van een wisselend team. Korte lijntjes, zodat je binnen een paar dagen iets ziet en niet pas na maanden. En heldere afspraken over wat er gebeurt, wanneer en waarom. Geen bureaugezwam.",
      "Geboren uit design, en nog altijd door en door creatief. Vandaag zijn we een klein, scherp team van specialisten, en ze zijn stuk voor stuk even goed in hun vak. Design, development, SEO, AI, social en campagnes: voor elk vlak hebben we iemand die er echt in thuis is. Geen bijzaken, geen halve dingen. Zo krijg je alles op hetzelfde hoge niveau, bij één team.",
    ],
    facts: [
      { figure: "1", text: "vast aanspreekpunt, van de eerste call tot ver na de lancering" },
      { figure: "5", text: "disciplines onder één dak: branding, UX/UI, web, AI en social" },
    ],
    valuesWord: "Intentie & vakmanschap",
    valuesSub: [
      "We maken met ",
      "intentie",
      " en bouwen met ",
      "zorg.",
      " Dit zijn de vier dingen waar we niet van afwijken.",
    ],
    values: [
      {
        title: "Vakmanschap boven shortcuts",
        text: "Elke pixel, elke interactie, elk woord. We blijven schaven aan details, omdat mensen juist daar het verschil voelen.",
      },
      {
        title: "Strategie eerst",
        text: "Mooi werk zonder doel is decoratie. We beginnen bij het waarom, onderbouwd met data in plaats van giswerk.",
      },
      {
        title: "Eerlijke samenwerking",
        text: "We voeren niet klakkeloos uit. We dagen aannames uit, zeggen het als iets beter kan en laten altijd zien waar we staan.",
      },
      {
        title: "Blijvende impact",
        text: "We meten succes niet in opleveringen, maar in wat erna gebeurt: merken die groeien en ervaringen die mensen onthouden.",
      },
    ],
    casesLabel: "Uit ons werk",
    links: { work: "Bekijk al het werk", insights: "Lees onze inzichten", social: "Volg ons op Instagram" },
    topLine: "Digitaal bureau in Almere en Amsterdam",
    locationsLabel: "Almere en Amsterdam",
    locationsText:
      "We werken vanuit Almere en Amsterdam, voor klanten in de regio en ver daarbuiten. Zoek je een digitale partner dichtbij? Kijk dan hoe we het in jouw stad aanpakken.",
    locations: [
      { label: "Digitaal bureau Almere", to: "/web-design-almere" },
      { label: "Digitaal bureau Amsterdam", to: "/web-design-amsterdam" },
    ],
    locationServices: [
      { label: "Webdesign", to: "/web-design" },
      { label: "Shopify-webshops", to: "/shopify-development" },
      { label: "Branding", to: "/branding" },
      { label: "UX/UI design", to: "/ux-ui-design" },
      { label: "AI-implementatie", to: "/ai-implementation" },
      { label: "Social media en Meta ads", to: "/social-media-meta-ads" },
    ],
    clientsLabel: "Vertrouwd door",
    clientsText: "Van startup tot scale-up, in Nederland en daarbuiten.",
  },
  en: {
    label: "About us",
    headline: [
      ["DYSIGNS", "is", "built", "for"],
      ["brands", "that", "refuse"],
      ["to", "stand", "still"],
    ],
    sub: [
      "A small team of specialists that ",
      "designs, builds and grows.",
      " No waiting and ",
      "no noise.",
    ],
    intro:
      "DYSIGNS is your creative partner from Almere and Amsterdam: a digital agency with a small team of specialists in UX/UI design, branding, web design, Shopify stores, SEO, AI implementation and social and paid campaigns. One team instead of four agencies pointing at each other, for clients in the Netherlands and beyond.",
    statementKicker: "One partner for the whole journey, from first sketch to the campaign after launch.",
    statementLead: "Everything we make is designed to",
    statementWord: ["Gr", "ow"],
    deliverLabel: "What we deliver",
    deliverTitle: "Three things, one team.",
    services: "Services",
    pillars: [
      {
        title: "Growth",
        text: "A brand people recognise at a glance and that holds up on every screen, from the logo to the last button.",
        items: [
          { label: "Brand strategy and positioning", to: "/branding" },
          { label: "Visual identity", to: "/branding" },
          { label: "UX/UI design", to: "/ux-ui-design" },
          { label: "Design systems", to: "/ux-ui-design" },
        ],
        image: "/images/merelymade-cover.avif",
      },
      {
        title: "Scale",
        text: "Websites and stores that load fast, with AI that takes the boring work off your hands: smart chatbots, automations and tools that grow with you.",
        items: [
          { label: "AI implementation", to: "/ai-implementation" },
          { label: "Web design and development", to: "/web-design" },
          { label: "Shopify stores", to: "/shopify-development" },
          { label: "Technical SEO", to: "/web-design" },
        ],
        image: "/images/stelz-app-work-cover.avif",
      },
      {
        title: "Run it",
        text: "Going live is the start. After that we make sure the right people find you, stick around and come back.",
        items: [
          { label: "Social media", to: "/social-media-meta-ads" },
          { label: "Meta ads", to: "/social-media-meta-ads" },
          { label: "Data-driven SEO" },
          { label: "Ongoing optimisation" },
        ],
        image: "/images/biyu-campaign.avif",
      },
    ],
    storyLabel: "Our story",
    storyTitle: "Started as designers. Stayed as partners.",
    story: [
      "We started out as UX and UI designers. Screens, flows, products: that was our thing. But we always wanted to go one step further. Who dreams up the brand behind it? Who builds the website around it? Who makes sure people actually show up? That curiosity never went away.",
      "Along the way we saw the same thing happen to clients again and again. A tiny tweak took weeks. Nobody knew where the project stood. The designer pointed at the developer, the developer at the marketer. That is how momentum leaks away, and opportunities happily follow it out the door.",
      "So we flipped it. One fixed point of contact instead of a rotating team. Short lines, so you see something within days and not after months. And clear agreements on what happens, when and why. No agency waffle.",
      "Born from design, and still creative to the core. Today we are a small, sharp team of specialists, and every one of them is great at their craft. Design, development, SEO, AI, social and campaigns: for every field we have someone who is truly at home in it. No side dishes, nothing half-done. That way you get everything at the same high level, from one team.",
    ],
    facts: [
      { figure: "1", text: "fixed point of contact, from the first call to long after launch" },
      { figure: "5", text: "disciplines under one roof: branding, UX/UI, web, AI and social" },
    ],
    valuesWord: "Intent & craft",
    valuesSub: [
      "We create with ",
      "intent",
      " and build with ",
      "care.",
      " These are the four things we do not compromise on.",
    ],
    values: [
      {
        title: "Craft over shortcuts",
        text: "Every pixel, every interaction, every word. We keep refining the details, because that is where people feel the difference.",
      },
      {
        title: "Strategy first",
        text: "Beautiful work without a purpose is decoration. We start with the why, backed by data instead of guesswork.",
      },
      {
        title: "Honest collaboration",
        text: "We are not order-takers. We challenge assumptions, say so when something can be better and always show where things stand.",
      },
      {
        title: "Lasting impact",
        text: "We measure success not in deliverables but in what happens next: brands that grow and experiences people remember.",
      },
    ],
    casesLabel: "From our work",
    links: { work: "View all work", insights: "Read our insights", social: "Follow us on Instagram" },
    topLine: "Digital agency in Almere and Amsterdam",
    locationsLabel: "Almere and Amsterdam",
    locationsText:
      "We work from Almere and Amsterdam, for clients in the region and far beyond. Looking for a digital partner nearby? See how we approach it in your city.",
    locations: [
      { label: "Digital agency Almere", to: "/web-design-almere" },
      { label: "Digital agency Amsterdam", to: "/web-design-amsterdam" },
    ],
    locationServices: [
      { label: "Web design", to: "/web-design" },
      { label: "Shopify stores", to: "/shopify-development" },
      { label: "Branding", to: "/branding" },
      { label: "UX/UI design", to: "/ux-ui-design" },
      { label: "AI implementation", to: "/ai-implementation" },
      { label: "Social media and Meta ads", to: "/social-media-meta-ads" },
    ],
    clientsLabel: "Trusted by",
    clientsText: "From startup to scale-up, in the Netherlands and beyond.",
  },
};

/** Cases shown large on the page; title, category and cover come from data/projects.ts. */
export const aboutCaseSlugs = [
  "stelz-app",
  "merely-made-webshop",
  "sfumato-agency",
  "biyu",
  "studio75-branding",
  "a-cafe-app-design",
];

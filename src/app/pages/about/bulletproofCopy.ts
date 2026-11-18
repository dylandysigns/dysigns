import type { Lang } from "../../hooks/useLanguage";

/* Copy for the "Bulletproof" variant of the About page (AboutBulletproof.tsx),
   kept apart from aboutCopy.ts so the two versions can be compared side by side
   and changed without touching each other. Preview only, see routes.ts. */

export type PillarItem = { label: string; to?: string };

export type BulletproofCopy = {
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
  clientsLabel: string;
  clientsText: string;
};

export const bulletproofCopy: Record<Lang, BulletproofCopy> = {
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
      "DYSIGNS is een creative partner uit Nederland: een klein team van specialisten in plaats van één generalist. Wij verzorgen het hele traject, van UX en merkidentiteit tot websites en Shopify-webshops, data-gedreven SEO, AI-implementatie en de social- en advertentiecampagnes die daarna klanten binnenhalen. Eén partner in plaats van vier leveranciers die naar elkaar wijzen, met klanten over de hele wereld.",
    statementKicker: "Eén partner voor het hele traject, van eerste schets tot de campagne erna.",
    statementLead: "Alles wat we maken is ontworpen om te",
    statementWord: ["Gro", "eien"],
    deliverLabel: "Wat we leveren",
    deliverTitle: "Drie dingen, één team.",
    services: "Diensten",
    pillars: [
      {
        title: "Merk",
        text: "Een merk dat je in één oogopslag herkent en dat op elk scherm klopt, van logo tot laatste knop.",
        items: [
          { label: "Merkstrategie en positionering", to: "/branding" },
          { label: "Visuele identiteit", to: "/branding" },
          { label: "UX/UI design", to: "/ux-ui-design" },
          { label: "Design systems" },
        ],
        image: "/images/sfumato-moodboard.avif",
      },
      {
        title: "Bouw",
        text: "Websites, webshops en slimme tools die snel laden, makkelijk te beheren zijn en blijven werken als je groeit.",
        items: [
          { label: "Webdesign en development", to: "/web-design" },
          { label: "Shopify-webshops", to: "/shopify-development" },
          { label: "AI-implementatie", to: "/ai-implementation" },
          { label: "Technische SEO" },
        ],
        image: "/images/merelymade-web-hero.avif",
      },
      {
        title: "Groei",
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
      "DYSIGNS begon bij UX en UI. We ontwierpen schermen, flows en producten, en wilden steeds een stap verder: het merk erachter, de site eromheen, de campagne die mensen ernaartoe brengt. Die nieuwsgierigheid is nooit weggegaan.",
      "Onderweg zagen we bij klanten telkens hetzelfde misgaan. Een kleine wijziging duurde weken. Niemand wist precies waar het project stond. De ontwerper wees naar de developer, de developer naar de marketeer. Zo lekt momentum weg, en met momentum ook kansen.",
      "Dus bouwden we DYSIGNS precies andersom. Eén vast aanspreekpunt in plaats van een wisselend team. Korte feedbackloops, zodat je binnen dagen iets ziet en niet pas na maanden. Heldere afspraken over wat er gebeurt, wanneer en waarom.",
      "Vandaag zijn we een klein team van specialisten. Sterk design blijft de kern. Daaromheen zit alles wat nodig is om het te laten werken: development, vindbaarheid, AI en campagnes. Zo groeit je zichtbaarheid mee met het werk, in plaats van erachteraan te lopen.",
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
      "DYSIGNS is a creative partner based in the Netherlands: a small team of specialists rather than one generalist. We handle the whole journey, from UX and brand identity to websites and Shopify stores, data-driven SEO, AI implementation, and the social and paid campaigns that bring in customers afterwards. One partner instead of four vendors pointing at each other, working with clients worldwide.",
    statementKicker: "One partner for the whole journey, from first sketch to the campaign after launch.",
    statementLead: "Everything we make is designed to",
    statementWord: ["Gr", "ow"],
    deliverLabel: "What we deliver",
    deliverTitle: "Three things, one team.",
    services: "Services",
    pillars: [
      {
        title: "Brand",
        text: "A brand people recognise at a glance and that holds up on every screen, from the logo to the last button.",
        items: [
          { label: "Brand strategy and positioning", to: "/branding" },
          { label: "Visual identity", to: "/branding" },
          { label: "UX/UI design", to: "/ux-ui-design" },
          { label: "Design systems" },
        ],
        image: "/images/sfumato-moodboard.avif",
      },
      {
        title: "Build",
        text: "Websites, stores and smart tools that load fast, are easy to manage and keep working as you grow.",
        items: [
          { label: "Web design and development", to: "/web-design" },
          { label: "Shopify stores", to: "/shopify-development" },
          { label: "AI implementation", to: "/ai-implementation" },
          { label: "Technical SEO" },
        ],
        image: "/images/merelymade-web-hero.avif",
      },
      {
        title: "Grow",
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
      "DYSIGNS started with UX and UI. We designed screens, flows and products, and kept wanting to go one step further: the brand behind it, the site around it, the campaign that brings people to it. That curiosity never left.",
      "Along the way we saw the same thing go wrong for clients again and again. A small change took weeks. Nobody knew exactly where the project stood. The designer pointed at the developer, the developer at the marketer. That is how momentum leaks away, and opportunities with it.",
      "So we built DYSIGNS the other way around. One fixed point of contact instead of a rotating team. Short feedback loops, so you see something within days and not after months. Clear agreements on what happens, when and why.",
      "Today we are a small team of specialists. Strong design stays at the core. Around it sits everything needed to make it work: development, search visibility, AI and campaigns. That way your visibility scales with the work instead of trailing behind it.",
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
    clientsLabel: "Trusted by",
    clientsText: "From startup to scale-up, in the Netherlands and beyond.",
  },
};

/** Cases shown large on the page; title, category and cover come from data/projects.ts. */
export const bulletproofCaseSlugs = [
  "stelz-app",
  "merely-made-webshop",
  "sfumato-agency",
  "biyu",
  "studio75-branding",
  "a-cafe-app-design",
];

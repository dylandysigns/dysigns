import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

export type Lang = "en" | "nl";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggleLang: () => {},
  setLang: () => {},
  t: (k) => k,
});

/* ─── TRANSLATIONS ─── */
const dict: Record<string, Record<Lang, string>> = {
  /* ── Navigation ── */
  "nav.work": { en: "Work", nl: "Werk" },
  "nav.about": { en: "About", nl: "Over ons" },
  "nav.contact": { en: "Contact", nl: "Contact" },

  /* ── Cursor hints ── */
  "cursor.home": { en: "HOME", nl: "HOME" },
  "cursor.view": { en: "VIEW", nl: "BEKIJK" },
  "cursor.viewProject": { en: "VIEW PROJECT", nl: "BEKIJK PROJECT" },
  "cursor.viewWork": { en: "VIEW WORK", nl: "BEKIJK WERK" },
  "cursor.open": { en: "OPEN", nl: "OPEN" },
  "cursor.back": { en: "BACK", nl: "TERUG" },
  "cursor.email": { en: "EMAIL", nl: "E-MAIL" },
  "cursor.whatsapp": { en: "WHATSAPP", nl: "WHATSAPP" },
  "cursor.drag": { en: "DRAG", nl: "SLEEP" },
  "cursor.play": { en: "PLAY", nl: "AFSPELEN" },
  "cursor.contact": { en: "CONTACT", nl: "CONTACT" },
  "cursor.previous": { en: "PREVIOUS", nl: "VORIGE" },
  "cursor.next": { en: "NEXT", nl: "VOLGENDE" },

  /* ── Hero ── */
  "hero.headline.A": {
    en: "DYSIGNS. Where ideas turn into pull.",
    nl: "DYSIGNS. Waar ideeën aantrekkingskracht krijgen.",
  },
  "hero.sub": {
    en: "We craft brands, products, and digital experiences that move people forward.",
    nl: "Wij creëren merken, producten en digitale ervaringen die mensen vooruit bewegen.",
  },
  "hero.cta1": { en: "View our work", nl: "Bekijk ons werk" },
  "hero.cta2": { en: "Start a project", nl: "Start een project" },
  "hero.available": { en: "Available for projects", nl: "Beschikbaar voor projecten" },
  "hero.scroll": { en: "Scroll", nl: "Scroll" },
  "hero.chip.ux": { en: "UX / UI", nl: "UX / UI" },
  "hero.chip.brand": { en: "Brand Identity", nl: "Merkidentiteit" },
  "hero.chip.web": { en: "Web Design", nl: "Webdesign" },
  "hero.chip.product": { en: "Product", nl: "Product" },

  /* ── Partners ── */
  "partners.label": { en: "Trusted by", nl: "Vertrouwd door" },

  /* ── Vision ── */
  "vision.label": { en: "Our vision", nl: "Onze visie" },
  "vision.title": { en: "We are DYSIGNS.", nl: "Wij zijn DYSIGNS." },
  "vision.text": {
    en: "We believe great design sits at the intersection of strategy and craft. 8+ years of building brands and products that actually work — no fluff, no filler, just work that moves the needle.",
    nl: "Wij geloven dat goed ontwerp op het snijvlak van strategie en vakmanschap ligt. 8+ jaar ervaring in het bouwen van merken en producten die écht werken — geen poespas, alleen werk dat het verschil maakt.",
  },

  /* ── Sentence Reveal ── */
  "sentence": { en: "We are DYSIGNS.", nl: "Wij zijn DYSIGNS." },

  /* ── Services ── */
  "services.label": { en: "What we do", nl: "Wat we doen" },
  "services.title": { en: "Services", nl: "Diensten" },
  "services.0.title": { en: "Brand Identity", nl: "Merkidentiteit" },
  "services.0.desc": {
    en: "From strategy to visual identity — we help brands find their voice and make it impossible to ignore.",
    nl: "Van strategie tot visuele identiteit — we helpen merken hun stem te vinden en onmogelijk te negeren te maken.",
  },
  "services.1.title": { en: "Web Design", nl: "Webdesign" },
  "services.1.desc": {
    en: "Websites that combine stunning visuals with strategic thinking. Every page built to perform.",
    nl: "Websites die verbluffende visuals combineren met strategisch denken. Elke pagina gebouwd om te presteren.",
  },
  "services.2.title": { en: "Product Design", nl: "Productontwerp" },
  "services.2.desc": {
    en: "Digital products users love. From concept to design system, we bring clarity to complexity.",
    nl: "Digitale producten waar gebruikers van houden. Van concept tot design system, we brengen helderheid in complexiteit.",
  },
  "services.3.title": { en: "Creative Direction", nl: "Creatieve Regie" },
  "services.3.desc": {
    en: "We steer the creative vision across campaigns, product launches, and brand initiatives.",
    nl: "Wij sturen de creatieve visie aan bij campagnes, productlanceringen en merkinitiatieven.",
  },

  /* ── Design Timeline ── */
  "timeline.label": { en: "How we design", nl: "Hoe we ontwerpen" },
  "timeline.0.title": { en: "Discover", nl: "Ontdekken" },
  "timeline.0.desc": {
    en: "We immerse ourselves in your world — stakeholder interviews, competitive analysis, user insights.",
    nl: "We verdiepen ons in jouw wereld — stakeholder-interviews, concurrentieanalyse, gebruikersinzichten.",
  },
  "timeline.1.title": { en: "Define", nl: "Definiëren" },
  "timeline.1.desc": {
    en: "Strategy crystallized. We map the problem space and align on a creative brief.",
    nl: "Strategie uitgekristalliseerd. We brengen het probleemveld in kaart en stemmen af op een creatieve briefing.",
  },
  "timeline.2.title": { en: "Design", nl: "Ontwerpen" },
  "timeline.2.desc": {
    en: "Concepts take shape. High-fidelity explorations and visual systems.",
    nl: "Concepten krijgen vorm. Gedetailleerde uitwerkingen en visuele systemen.",
  },
  "timeline.3.title": { en: "Prototype", nl: "Prototype" },
  "timeline.3.desc": {
    en: "Ideas become tangible. Interactive prototypes to test and refine.",
    nl: "Ideeën worden tastbaar. Interactieve prototypes om te testen en te verfijnen.",
  },
  "timeline.4.title": { en: "Build", nl: "Bouwen" },
  "timeline.4.desc": {
    en: "Pixel-perfect execution alongside engineering. Every detail ships.",
    nl: "Pixel-perfecte uitvoering samen met engineering. Elk detail wordt opgeleverd.",
  },
  "timeline.5.title": { en: "Launch", nl: "Lanceren" },
  "timeline.5.desc": {
    en: "The world meets your product. We monitor, optimize, and iterate.",
    nl: "De wereld ontmoet je product. We monitoren, optimaliseren en itereren.",
  },

  /* ── Kind Words / Testimonials ── */
  "testimonials.label": { en: "Testimonials", nl: "Ervaringen" },
  "testimonials.heading1": { en: "Words of", nl: "Woorden van" },
  "testimonials.heading2": { en: "praise", nl: "lof" },
  "testimonials.sub": {
    en: "What our collaborators say about working with us.",
    nl: "Wat onze partners zeggen over de samenwerking met ons.",
  },

  /* ── Selected Projects (home) ── */
  "projects.label": { en: "Selected work", nl: "Geselecteerd werk" },
  "projects.heading": { en: "Projects we\u2019re proud of", nl: "Projecten waar we trots op zijn" },
  "projects.viewAll": { en: "View all work", nl: "Bekijk al het werk" },
  "projects.showMore": { en: "Show more", nl: "Meer tonen" },

  /* ── ZoomToGrid ── */
  "zoom.start": { en: "Selected projects", nl: "Geselecteerde projecten" },
  "zoom.end": { en: "we're proud of", nl: "waar we trots op zijn" },

  /* ── Contact Band ── */
  "contact.headline": {
    en: "Let\u2019s build something together",
    nl: "Laten we samen iets bouwen",
  },
  "contact.sub": {
    en: "Got a project in mind? We\u2019d love to make something extraordinary with you.",
    nl: "Heb je een project in gedachten? We maken graag samen iets bijzonders.",
  },
  "contact.emailUs": { en: "Email us", nl: "E-mail ons" },
  "contact.label": { en: "Contact", nl: "Contact" },
  "contact.followUs": { en: "Follow us", nl: "Volg ons" },

  /* ── About Page ── */
  "about.label": { en: "About us", nl: "Over ons" },
  "about.storyTitle": {
    en: "Design with intention, build with care",
    nl: "Ontwerpen met intentie, bouwen met zorg",
  },
  "about.storyText": {
    en: "We bring together strategic thinking and meticulous craft to create brands, products, and experiences that people actually remember. Our work spans brand identity, web design, product design, and creative direction\u2014always in service of outcomes that matter.",
    nl: "Wij combineren strategisch denken met zorgvuldig vakmanschap om merken, producten en ervaringen te creëren die mensen echt onthouden. Ons werk omvat merkidentiteit, webdesign, productontwerp en creatieve regie\u2014altijd gericht op resultaten die ertoe doen.",
  },
  "about.valuesLabel": { en: "What we believe", nl: "Waar we in geloven" },
  "about.value0.title": { en: "Craft over shortcuts", nl: "Vakmanschap boven shortcuts" },
  "about.value0.text": {
    en: "Every pixel, every interaction, every word\u2014we obsess over the details because that\u2019s where the magic lives.",
    nl: "Elke pixel, elke interactie, elk woord\u2014we zijn geobsedeerd door de details, want daar zit de magie.",
  },
  "about.value1.title": { en: "Strategy first", nl: "Strategie eerst" },
  "about.value1.text": {
    en: "Beautiful work means nothing without purpose. We start with \u2018why\u2019 before we ever touch a screen.",
    nl: "Mooi werk betekent niets zonder doel. We beginnen met \u2018waarom\u2019 voordat we een scherm aanraken.",
  },
  "about.value2.title": { en: "Honest collaboration", nl: "Eerlijke samenwerking" },
  "about.value2.text": {
    en: "We\u2019re not order-takers. We challenge assumptions, share ideas openly, and build trust through transparency.",
    nl: "Wij nemen niet klakkeloos orders aan. We dagen aannames uit, delen ideeën openlijk en bouwen vertrouwen op door transparantie.",
  },
  "about.value3.title": { en: "Lasting impact", nl: "Blijvende impact" },
  "about.value3.text": {
    en: "We measure success not in deliverables but in outcomes\u2014brands that grow, products that scale, experiences people remember.",
    nl: "We meten succes niet in opleverpunten maar in resultaten\u2014merken die groeien, producten die schalen, ervaringen die mensen onthouden.",
  },
  "about.ctaTitle": {
    en: "Interested in working together?",
    nl: "Interesse om samen te werken?",
  },
  "about.ctaButton": { en: "Get in touch", nl: "Neem contact op" },

  /* ── Work Page ── */
  "work.label": { en: "Our work", nl: "Ons werk" },
  "work.title": { en: "Selected projects", nl: "Geselecteerde projecten" },
  "work.filterAll": { en: "All", nl: "Alle" },

  /* ── Case Detail ── */
  "case.back": { en: "Back to work", nl: "Terug naar werk" },
  "case.overview": { en: "Overview", nl: "Overzicht" },
  "case.outcomes": { en: "Outcomes", nl: "Resultaten" },
  "case.previous": { en: "Previous", nl: "Vorige" },
  "case.next": { en: "Next", nl: "Volgende" },
  "case.notFound": { en: "Project not found", nl: "Project niet gevonden" },

  /* ── Footer ── */
  "footer.rights": { en: "All rights reserved.", nl: "Alle rechten voorbehouden." },

  /* ── Language Toggle ── */
  "lang.switchTo": { en: "Switch to Dutch", nl: "Switch to English" },

  /* ── Testimonial Quotes (i18n) ── */
  "testimonial.t1.quote": {
    en: "Exceeded our expectations with innovative designs that brought our vision to life — a truly remarkable creative partner.",
    nl: "Overtrof onze verwachtingen met innovatieve ontwerpen die onze visie tot leven brachten — een werkelijk opmerkelijke creatieve partner.",
  },
  "testimonial.t2.quote": {
    en: "Their ability to capture our brand essence in every project is unparalleled — an invaluable creative collaborator.",
    nl: "Hun vermogen om onze merkessence in elk project vast te leggen is ongeëvenaard — een onmisbare creatieve partner.",
  },
  "testimonial.t3.quote": {
    en: "Creative geniuses who listen, understand, and craft captivating visuals — a team that truly understands our needs.",
    nl: "Creatieve genieën die luisteren, begrijpen en boeiende visuals creëren — een team dat onze behoeften echt begrijpt.",
  },
  "testimonial.t4.quote": {
    en: "The website they designed didn\u2019t just look incredible — it transformed how our customers experience our brand.",
    nl: "De website die zij ontwierpen zag er niet alleen ongelooflijk uit — het transformeerde hoe onze klanten ons merk ervaren.",
  },
  "testimonial.t5.quote": {
    en: "A refreshing and imaginative team that consistently delivers exceptional results — highly recommended for any project.",
    nl: "Een verfrissend en creatief team dat consequent uitzonderlijke resultaten levert — sterk aanbevolen voor elk project.",
  },
  "testimonial.t6.quote": {
    en: "Their artistic flair and strategic approach resulted in remarkable outcomes — a reliable creative partner we trust completely.",
    nl: "Hun artistieke flair en strategische aanpak resulteerden in opmerkelijke resultaten — een betrouwbare creatieve partner die we volledig vertrouwen.",
  },
  "testimonial.t7.quote": {
    en: "From concept to execution, their creativity knows no bounds — a game-changer for our brand\u2019s digital presence.",
    nl: "Van concept tot uitvoering kent hun creativiteit geen grenzen — een gamechanger voor de digitale aanwezigheid van ons merk.",
  },
  "testimonial.t8.quote": {
    en: "Best collaboration experience. Clear communication, exceptional craft, and always delivered ahead of schedule.",
    nl: "Beste samenwerkingservaring. Heldere communicatie, uitzonderlijk vakmanschap en altijd voor deadline opgeleverd.",
  },
};

/* ─── PROVIDER ─── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dysigns-lang");
      if (saved === "nl" || saved === "en") return saved;
    }
    return "en";
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("dysigns-lang", l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "nl" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: string): string => {
      const entry = dict[key];
      if (!entry) return key;
      return entry[lang] ?? entry.en ?? key;
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, toggleLang, setLang, t }),
    [lang, toggleLang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
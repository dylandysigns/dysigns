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
  "cursor.email": { en: "EMAIL", nl: "EMAIL" },
  "cursor.whatsapp": { en: "WHATSAPP", nl: "WHATSAPP" },
  "cursor.drag": { en: "DRAG ME", nl: "SLEEP MIJ" },
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
    en: "We turn ideas into reality and make digital work for you.",
    nl: "We maken van ideeën realiteit en gebruiksvriendelijke digitale ervaringen die voor je werken.",
  },
  "hero.cta1": { en: "View work", nl: "Bekijk ons werk" },
  "hero.cta2": { en: "Free chat, why not?", nl: "Even kletsen, waarom niet?" },
  "hero.available": { en: "Available for projects", nl: "Beschikbaar voor projecten" },
  "hero.scroll": { en: "Scroll", nl: "Scroll" },
  "hero.chip.ux": { en: "UX / UI", nl: "UX / UI" },
  "hero.chip.brand": { en: "Brand Identity", nl: "Brand identity" },
  "hero.chip.web": { en: "Web Design", nl: "Web Design" },
  "hero.chip.product": { en: "Product", nl: "Product" },

  /* ── Partners ── */
  "partners.label": { en: "Trusted by", nl: "Vertrouwd door" },

  /* ── Vision ── */
  "vision.label": { en: "Our vision", nl: "Onze visie" },
  "vision.title": { en: "ARE WE YOUR NEXT DYSIGNS?", nl: "Wij zijn DYSIGNS." },
  "vision.text": {
    en: "We believe great design sits at the intersection of strategy and craft. Building brands and products that actually work: no fluff, no filler, just digital work that moves the needle.",
    nl: "Wij geloven dat goed ontwerp op het snijvlak van strategie en vakmanschap ligt. Het bouwen van merken en producten die écht werken: geen poespas, alleen digitale werk dat het verschil maakt.",
  },

  /* ── Sentence Reveal ── */
  "sentence": { en: "Create better with DYSIGNS", nl: "Creëer beter met DYSIGNS" },

  /* ── Services ── */
  "services.label": { en: "What we do", nl: "Wat wij doen" },
  "services.title": { en: "Services", nl: "Diensten" },
  "services.0.title": { en: "Brand Identity", nl: "Merkidentiteit" },
  "services.0.desc": {
    en: "From strategy to visual identity, we help brands define their voice, stand out with confidence, and scale with clarity.",
    nl: "Van strategie tot visuele identiteit helpen we merken hun stem bepalen, opvallen met vertrouwen en gericht groeien.",
  },
  "services.1.title": { en: "UX/UI & Web Design", nl: "UX/UI & Webdesign" },
  "services.1.desc": {
    en: "We started as a UX and UI driven company and that foundation shapes also our web design approach. Websites that combine strong visuals with clear structure, where every page is built to perform.",
    nl: "We zijn gestart als een UX en UI gedreven bedrijf en die basis vormt ook onze webdesign aanpak. Websites waar sterke visuals en een duidelijke structuur samenkomen en elke pagina is ontworpen om te presteren.",
  },
  "services.2.title": { en: "Product Design", nl: "Productontwerp" },
  "services.2.desc": {
    en: "Digital products users love. From concept to design system, we bring clarity to complexity.",
    nl: "Digitale producten waar gebruikers van houden. Van concept tot design system, we brengen helderheid in complexiteit.",
  },
  "services.3.title": { en: "Creative thinking", nl: "Creative thinking" },
  "services.3.desc": {
    en: "We steer the creative vision across campaigns, product launches, and brand initiatives.",
    nl: "Wij sturen de creatieve visie aan bij campagnes, productlanceringen en merkinitiatieven.",
  },

  /* ── Design Timeline ── */
  "timeline.label": { en: "DYSIGNS way", nl: "De DYSIGNS manier" },
  "timeline.0.title": { en: "Explore", nl: "Ontdekken" },
  "timeline.0.desc": {
    en: "We immerse ourselves in your world. Stakeholder interviews, competitive analysis, user insights.",
    nl: "We verdiepen ons in jouw wereld. Stakeholder-interviews, concurrentieanalyse, gebruikersinzichten.",
  },
  "timeline.1.title": { en: "Define", nl: "Definiëren" },
  "timeline.1.desc": {
    en: "Strategy crystallized. We map the problem space and align on a creative brief.",
    nl: "Strategie uitgekristalliseerd. We brengen het probleemveld in kaart en stemmen af op een creatieve briefing.",
  },
  "timeline.2.title": { en: "Design", nl: "Ontwerpen" },
  "timeline.2.desc": {
    en: "Concepts take shape. Wireframing. High-fidelity explorations and visual systems.",
    nl: "Concepten krijgen vorm. Wireframing. Gedetailleerde uitwerkingen en visuele systemen.",
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
  "testimonials.label": { en: "Our partners", nl: "Onze partners" },
  "testimonials.heading1": { en: "Kind", nl: "Mooie" },
  "testimonials.heading2": { en: "words", nl: "woorden" },
  "testimonials.sub": {
    en: "What our partners say about working with us.",
    nl: "Wat onze partners zeggen over de samenwerking met ons.",
  },

  /* ── Selected Projects (home) ── */
  "projects.label": { en: "Selected work", nl: "Selected werk" },
  "projects.heading": { en: "Projects we\u2019re proud of", nl: "Projecten waar we trots op zijn" },
  "projects.viewAll": { en: "View all work", nl: "Bekijk al het werk" },
  "projects.showMore": { en: "Show more", nl: "Meer tonen" },

  /* ── ZoomToGrid ── */
  "zoom.start": { en: "Selected projects", nl: "Geselecteerde projecten" },
  "zoom.end": { en: "we're proud of", nl: "waar we trots op zijn" },

  /* ── Contact Band ── */
  "contact.headline": {
    en: "Lets just talk, we\u2019re very chill.",
    nl: "Laten we lekker babbelen, we zijn heel gezellig.",
  },
  "contact.sub": {
    en: "Got a idea in mind? We\u2019d love to make something unique with you.",
    nl: "Heb je een idee in gedachten? We houden van unieke dingen.",
  },
  "contact.emailUs": { en: "Email us", nl: "E-mail ons" },
  "contact.label": { en: "Contact", nl: "Contact" },
  "contact.followUs": { en: "Follow us", nl: "Volg ons" },

  /* ── About Page ── */
  "about.label": { en: "About us", nl: "Over ons" },
  "about.storyTitle": {
    en: "DYSIGNS create with intent, craft with care",
    nl: "DYSIGNS creëert met intentie, bouwen met zorg.",
  },
"about.storyText": {
en: "We started as UX and UI designers driven by curiosity and the ambition to grow across multiple design disciplines, which ultimately led to the creation of DYSIGNS.\n\n\nAlong this journey, we identified a recurring problem where clients had to wait too long for changes and lacked clarity in the process, causing lost momentum and missed opportunities, and that insight became the foundation of DYSIGNS.\n\n\nToday, our workflow is built around transparency, speed, and a true partner experience, with short feedback loops, clear communication, and a realistic yet fast pace so digital ideas move forward quickly while strong UX and UI remain at the core.",
nl: "We zijn gestart als UX en UI designers met een sterke drang om te groeien en verschillende disciplines binnen design te verkennen, wat uiteindelijk leidde tot de oprichting van DYSIGNS.\n\n\nTijdens dit traject merkten we een terugkerend probleem waarbij klanten vaak te lang moesten wachten op aanpassingen en duidelijkheid ontbrak in het proces, waardoor momentum verloren ging en kansen bleven liggen, precies dat inzicht vormde de basis van DYSIGNS.\n\n\nDaarom bouwen wij onze werkwijze rond transparantie, snelheid en een echte partnerervaring, met korte feedbackloops, heldere communicatie en een realistisch maar hoog werktempo zodat digitale ideeën snel tot leven komen terwijl sterke UX en UI altijd de kern blijven."
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
  "case.outcomes": { en: "Results", nl: "Resultaten" },
  "case.previous": { en: "Previous", nl: "Vorige" },
  "case.next": { en: "Next", nl: "Volgende" },
  "case.notFound": { en: "Project not found", nl: "Project niet gevonden" },
  "case.visit": { en: "VISIT", nl: "BEZOEK" },

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

  /* ── Category translations ── */
  "category.Branding": { en: "Branding", nl: "Branding" },
  "category.Product": { en: "Product", nl: "Product" },
  "category.Web": { en: "Web", nl: "Web" },

  /* ── Tag translations ── */
  "tag.Brand Identity": { en: "Brand Identity", nl: "Merkidentiteit" },
  "tag.Web Design": { en: "Web Design", nl: "Webdesign" },
  "tag.Design System": { en: "Design System", nl: "Design System" },
  "tag.Mobile App": { en: "Mobile App", nl: "Mobiele App" },
  "tag.UX Design": { en: "UX Design", nl: "UX-ontwerp" },
  "tag.E-Commerce": { en: "E-Commerce", nl: "E-commerce" },
  "tag.Development": { en: "Development", nl: "Ontwikkeling" },
  "tag.Dashboard": { en: "Dashboard", nl: "Dashboard" },
  "tag.SaaS": { en: "SaaS", nl: "SaaS" },
  "tag.Data Viz": { en: "Data Viz", nl: "Datavisualisatie" },
  "tag.Print": { en: "Print", nl: "Print" },
  "tag.Creative Direction": { en: "Creative Direction", nl: "Creatieve Regie" },
  "tag.Photography": { en: "Photography", nl: "Fotografie" },
  "tag.Product Design": { en: "Product Design", nl: "Productontwerp" },
  "tag.Motion Design": { en: "Motion Design", nl: "Motion Design" },

  /* ── Project: Nova Brand Platform ── */
  "project.nova-brand-platform.title": {
    en: "Nova Brand Platform",
    nl: "Nova Brand Platform",
  },
  "project.nova-brand-platform.overview": {
    en: "We partnered with Nova Finance to reimagine their entire brand ecosystem\u2014from visual identity through to a comprehensive design system spanning web, mobile, and print. The result is a cohesive platform that communicates trust, innovation, and accessibility across every touchpoint.",
    nl: "We werkten samen met Nova Finance om hun complete merkecosysteem opnieuw vorm te geven\u2014van visuele identiteit tot een uitgebreid design system voor web, mobiel en print. Het resultaat is een samenhangend platform dat vertrouwen, innovatie en toegankelijkheid uitstraalt op elk contactpunt.",
  },
  "project.nova-brand-platform.outcome.0": {
    en: "42% increase in brand recall within 6 months",
    nl: "42% stijging in merkherkenning binnen 6 maanden",
  },
  "project.nova-brand-platform.outcome.1": {
    en: "Design system adopted across 3 product teams",
    nl: "Design system overgenomen door 3 productteams",
  },
  "project.nova-brand-platform.outcome.2": {
    en: "Reduced design-to-dev handoff time by 60%",
    nl: "Design-naar-dev overdrachtstijd met 60% verkort",
  },
  "project.nova-brand-platform.outcome.3": {
    en: "Featured in Awwwards SOTD collection",
    nl: "Opgenomen in de Awwwards SOTD-collectie",
  },

  /* ── Project: Meridian App Redesign ── */
  "project.meridian-app-redesign.title": {
    en: "Meridian App Redesign",
    nl: "Meridian App Herontwerp",
  },
  "project.meridian-app-redesign.overview": {
    en: "Meridian Health needed a mobile experience that made complex health data feel simple and empowering. We redesigned every screen with a focus on clarity, emotional reassurance, and accessibility\u2014resulting in an app people actually want to open every day.",
    nl: "Meridian Health had een mobiele ervaring nodig die complexe gezondheidsdata eenvoudig en empowerend liet voelen. We herontwierpen elk scherm met focus op helderheid, emotionele geruststelling en toegankelijkheid\u2014met als resultaat een app die mensen echt dagelijks willen openen.",
  },
  "project.meridian-app-redesign.outcome.0": {
    en: "4.8-star App Store rating post-launch",
    nl: "4,8-sterren App Store-beoordeling na lancering",
  },
  "project.meridian-app-redesign.outcome.1": {
    en: "Daily active users up 128%",
    nl: "Dagelijks actieve gebruikers gestegen met 128%",
  },
  "project.meridian-app-redesign.outcome.2": {
    en: "Onboarding completion rate improved by 45%",
    nl: "Onboarding-voltooiingspercentage verbeterd met 45%",
  },
  "project.meridian-app-redesign.outcome.3": {
    en: "Accessibility AA compliance achieved",
    nl: "Toegankelijkheid AA-compliance behaald",
  },

  /* ── Project: Arco E-Commerce ── */
  "project.arco-ecommerce.title": {
    en: "Arco E-Commerce",
    nl: "Arco E-Commerce",
  },
  "project.arco-ecommerce.overview": {
    en: "Arco Living is a premium furniture brand that needed an online presence matching the quality of their craft. We designed and built a bespoke e-commerce experience emphasizing materiality, detail photography, and a frictionless purchase journey.",
    nl: "Arco Living is een premium meubelmerk dat een online aanwezigheid nodig had die past bij de kwaliteit van hun vakmanschap. We ontwierpen en bouwden een op maat gemaakte e-commerce-ervaring met nadruk op materialiteit, detailfotografie en een soepele aankoopervaring.",
  },
  "project.arco-ecommerce.outcome.0": {
    en: "Conversion rate up 38% vs. previous platform",
    nl: "Conversieratio 38% hoger dan vorig platform",
  },
  "project.arco-ecommerce.outcome.1": {
    en: "Average session duration increased by 2.4\u00d7",
    nl: "Gemiddelde sessieduur gestegen met 2,4\u00d7",
  },
  "project.arco-ecommerce.outcome.2": {
    en: "Bounce rate dropped 22%",
    nl: "Bouncepercentage gedaald met 22%",
  },
  "project.arco-ecommerce.outcome.3": {
    en: "Shortlisted for FWA of the Day",
    nl: "Genomineerd voor FWA van de Dag",
  },

  /* ── Project: Pulse Analytics ── */
  "project.pulse-analytics.title": {
    en: "Pulse Analytics",
    nl: "Pulse Analytics",
  },
  "project.pulse-analytics.overview": {
    en: "Pulse needed to transform dense analytical data into actionable insights for non-technical stakeholders. We created a dashboard experience that balances power with simplicity\u2014making complex data accessible at a glance.",
    nl: "Pulse moest dichte analytische data omzetten in bruikbare inzichten voor niet-technische stakeholders. We cre\u00eberden een dashboard-ervaring die kracht en eenvoud in balans brengt\u2014complexe data toegankelijk in \u00e9\u00e9n oogopslag.",
  },
  "project.pulse-analytics.outcome.0": {
    en: "User task completion time reduced by 55%",
    nl: "Taakvoltooiingstijd gebruikers verminderd met 55%",
  },
  "project.pulse-analytics.outcome.1": {
    en: "NPS score jumped from 32 to 71",
    nl: "NPS-score gestegen van 32 naar 71",
  },
  "project.pulse-analytics.outcome.2": {
    en: "Enterprise plan adoption up 40%",
    nl: "Enterprise-plan adoptie gestegen met 40%",
  },
  "project.pulse-analytics.outcome.3": {
    en: "Zero-training onboarding achieved",
    nl: "Onboarding zonder training gerealiseerd",
  },

  /* ── Project: STËLZ Web Design ── */
  "project.stëlz-web-design.title": {
    en: "STËLZ Web Design",
    nl: "STËLZ Web Design",
  },
  "project.stëlz-web-design.overview": {
 en: "STËLZ asked us to redesign their website to improve conversion and simplify daily updates across teams. We created a modular Shopify setup that supports faster product discovery, a smoother add to cart flow and a clear content structure that allows quick edits without development dependency. Our collaboration evolved into a long term partnership where we continuously refine the experience through design iterations, UX optimisation and campaign driven updates. This ongoing workflow ensures the platform stays aligned with brand growth, supports new product launches and maintains strong performance across devices while enabling the STËLZ team to manage content efficiently.",
  nl: "STËLZ vroeg ons om hun website te herontwerpen voor meer conversie en eenvoudiger beheer. We bouwden een modulaire Shopify ervaring met snellere productkeuze, een soepelere add to cart flow en een heldere content structuur voor snelle aanpassingen.",
},

"project.stëlz-web-design.outcome.0": {
  en: "€200K+ revenue during the campaign launch weekend",
  nl: "€200K+ omzet tijdens het livegang weekend van de campagne",
},
"project.stëlz-web-design.outcome.1": {
  en: "4,000+ orders in three days",
  nl: "4.000+ bestellingen in drie dagen",
},
"project.stëlz-web-design.outcome.2": {
  en: "19,000+ visitors and 27,000+ sessions",
  nl: "19.000+ bezoekers en 27.000+ sessies",
},
"project.stëlz-web-design.outcome.3": {
  en: "4,200+ unique customers and 19%+ returning",
  nl: "4.200+ unieke klanten en 19%+ terugkerend",
},

  /* ── Project: Verso Brand Identity ── */
  "project.verso-brand-identity.title": {
    en: "Verso Brand Identity",
    nl: "Verso Merkidentiteit",
  },
  "project.verso-brand-identity.overview": {
    en: "Verso is a boutique publishing house that needed an identity system as refined as the books they produce. We crafted a brand that feels both literary and contemporary\u2014from typography choices to print collateral and a bespoke website.",
    nl: "Verso is een boutique-uitgeverij die een identiteitssysteem nodig had dat net zo verfijnd is als de boeken die ze produceren. We cre\u00eberden een merk dat zowel literair als eigentijds aanvoelt\u2014van typografiekeuzes tot drukwerk en een op maat gemaakte website.",
  },
  "project.verso-brand-identity.outcome.0": {
    en: "Brand awareness up 80% in target demographic",
    nl: "Merkbekendheid 80% gestegen in doelgroep",
  },
  "project.verso-brand-identity.outcome.1": {
    en: "Press coverage in 12 design publications",
    nl: "Persaandacht in 12 designpublicaties",
  },
  "project.verso-brand-identity.outcome.2": {
    en: "Print collateral won 2 regional design awards",
    nl: "Drukwerk won 2 regionale designprijzen",
  },
  "project.verso-brand-identity.outcome.3": {
    en: "Social media following grew 3\u00d7 in 4 months",
    nl: "Social media-volgers verdrievoudigd in 4 maanden",
  },

  /* ── Project: Echo Fashion ── */
  "project.echo-fashion.title": {
    en: "Echo Fashion",
    nl: "Echo Fashion",
  },
  "project.echo-fashion.overview": {
    en: "Echo is a conscious fashion label that wanted a visual identity and digital home to match their values\u2014clean, honest, and striking. We art-directed a campaign shoot, designed the brand system, and built a Shopify experience that converts while telling a story.",
    nl: "Echo is een bewust modelabel dat een visuele identiteit en digitaal thuis wilde dat past bij hun waarden\u2014schoon, eerlijk en opvallend. We regisseerden een campagneshoot, ontwierpen het merksysteem en bouwden een Shopify-ervaring die converteert terwijl het een verhaal vertelt.",
  },
  "project.echo-fashion.outcome.0": {
    en: "Campaign imagery featured in Vogue Italia online",
    nl: "Campagnebeelden verschenen in Vogue Italia online",
  },
  "project.echo-fashion.outcome.1": {
    en: "E-commerce revenue up 52% year-over-year",
    nl: "E-commerce-omzet 52% gestegen jaar-op-jaar",
  },
  "project.echo-fashion.outcome.2": {
    en: "Email sign-ups increased 200% through new landing pages",
    nl: "E-mailaanmeldingen 200% gestegen via nieuwe landingspagina\u2019s",
  },
  "project.echo-fashion.outcome.3": {
    en: "Brand consistency score improved across all channels",
    nl: "Merkconsistentiescore verbeterd over alle kanalen",
  },

  /* ── Project: Orbit SaaS Platform ── */
  "project.orbit-saas-platform.title": {
    en: "Orbit SaaS Platform",
    nl: "Orbit SaaS Platform",
  },
  "project.orbit-saas-platform.overview": {
    en: "Orbit needed to evolve from a developer tool into a platform teams actually enjoy using. We redesigned the entire product experience\u2014dashboard, settings, workflows\u2014and built a design system that scales with their engineering velocity.",
    nl: "Orbit moest evolueren van een ontwikkelaarstool naar een platform dat teams echt graag gebruiken. We herontwierpen de complete productervaring\u2014dashboard, instellingen, workflows\u2014en bouwden een design system dat meeschaalt met hun engineering-snelheid.",
  },
  "project.orbit-saas-platform.outcome.0": {
    en: "User activation rate improved 67%",
    nl: "Gebruikersactivatiepercentage verbeterd met 67%",
  },
  "project.orbit-saas-platform.outcome.1": {
    en: "Support tickets reduced by 40%",
    nl: "Supporttickets verminderd met 40%",
  },
  "project.orbit-saas-platform.outcome.2": {
    en: "Design system covers 95% of UI patterns",
    nl: "Design system dekt 95% van alle UI-patronen",
  },
  "project.orbit-saas-platform.outcome.3": {
    en: "Raised Series B shortly after redesign launch",
    nl: "Series B-ronde opgehaald kort na lancering herontwerp",
  },

  /* ── Project: Flux Motion Identity ── */
  "project.flux-motion-identity.title": {
    en: "Flux Motion Identity",
    nl: "Flux Motion Identiteit",
  },
  "project.flux-motion-identity.overview": {
    en: "Flux is a motion design collective that needed an identity system as dynamic as their work. We created a living brand that shifts and evolves\u2014from generative logo animations to a custom type system and a portfolio site that feels like a reel in itself.",
    nl: "Flux is een motion design-collectief dat een identiteitssysteem nodig had dat net zo dynamisch is als hun werk. We cre\u00eberden een levend merk dat verschuift en evolueert\u2014van generatieve logo-animaties tot een op maat gemaakt typesysteem en een portfoliosite die zelf als reel aanvoelt.",
  },
  "project.flux-motion-identity.outcome.0": {
    en: "Brand launch generated 50K+ social impressions in 48 hours",
    nl: "Merklancering genereerde 50K+ sociale impressies in 48 uur",
  },
  "project.flux-motion-identity.outcome.1": {
    en: "Inbound project inquiries tripled within the first quarter",
    nl: "Inkomende projectaanvragen verdrievoudigd in het eerste kwartaal",
  },
  "project.flux-motion-identity.outcome.2": {
    en: "Identity system adaptable across 12 different media formats",
    nl: "Identiteitssysteem aanpasbaar over 12 verschillende mediaformaten",
  },
  "project.flux-motion-identity.outcome.3": {
    en: "Featured on It\u2019s Nice That and Brand New",
    nl: "Verschenen op It\u2019s Nice That en Brand New",
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
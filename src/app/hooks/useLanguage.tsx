import React, { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

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
    en: "DYSIGNS is your creative partner: a small team creating brands, websites, and social campaigns that transform company values into meaningful business value.",
    nl: "DYSIGNS is jouw creative partner: een klein team dat bedrijfswaarden vertaalt naar sterke merken, websites en socialmediacampagnes die impact maken.",
  },
  "hero.cta1": { en: "View work", nl: "Bekijk ons werk" },
  "hero.cta2": { en: "Free chat, why not?", nl: "Even kletsen, waarom niet?" },
  "hero.available": { en: "Available for projects, Almere", nl: "Beschikbaar voor projecten, Almere" },
  "hero.availableIn": { en: "We are available in", nl: "Wij zijn beschikbaar in" },
  "hero.fallbackLocation": { en: "the Netherlands", nl: "Nederland" },
  "hero.scroll": { en: "Scroll", nl: "Scroll" },
  "hero.watchVideo": { en: "See us in 19 sec", nl: "Zie ons in 19 sec" },
  "hero.closeVideo": { en: "Close video", nl: "Sluit video" },
  "hero.chip.strategy": { en: "Strategy", nl: "Strategie" },
  "hero.chip.ux": { en: "UX / UI", nl: "UX / UI" },
  "hero.chip.brand": { en: "Brand Identity", nl: "Brand identity" },
  "hero.chip.web": { en: "Web Design", nl: "Web Design" },
  "hero.chip.product": { en: "Social Media", nl: "Social media" },

  /* ── Partners ── */
  "partners.label": { en: "Trusted by", nl: "Vertrouwd door" },

  /* ── Vision ── */
  "vision.label": { en: "Our vision", nl: "Onze visie" },
  "vision.title": { en: "ARE WE YOUR NEXT DYSIGNS?", nl: "Wij zijn DYSIGNS." },
  "vision.text": {
    en: "We believe great design sits at the intersection of strategy and craft. Building brands and social media systems that actually work: no fluff, no filler, just digital work that moves the needle.",
    nl: "Wij geloven dat goed ontwerp op het snijvlak van strategie en vakmanschap ligt. Het bouwen van merken en social media systemen die écht werken: geen poespas, alleen digitaal werk dat het verschil maakt.",
  },

  /* ── Sentence Reveal ── */
  "sentence": { en: "BETTER DYSIGNS", nl: "BETERE DYSIGNS" },

  /* ── Services ── */
  "services.label": { en: "What we do", nl: "Wat wij doen" },
  "services.includesCarousel": { en: "What's included", nl: "Wat is inbegrepen" },
  "services.introHeading": {
    en: "Design, development and marketing, in one team",
    nl: "Design, development en marketing, in één team",
  },
  "services.introText": {
    en: "A creative partner and small team in the Netherlands, working with clients worldwide. UX, brand, websites, Shopify, AI implementation, and the campaigns that bring customers in afterwards. One partner instead of four vendors pointing at each other.",
    nl: "Een creative partner en klein team in Nederland, met klanten wereldwijd. UX, branding, websites, Shopify, AI-implementatie en de campagnes die daarna klanten binnenhalen. Eén partner in plaats van vier partijen die naar elkaar wijzen.",
  },
  "services.eyebrow": { en: "Service", nl: "Dienst" },
  "services.explorePrefix": { en: "Explore", nl: "Bekijk" },
  "services.whatIncludes": { en: "What this includes", nl: "Wat dit inhoudt" },
  "services.whoHeading": { en: "Who it is for", nl: "Voor wie is dit" },
  "services.alsoFrom": { en: "Also from DYSIGNS", nl: "Ook van DYSIGNS" },
  "services.faqHeading": { en: "Frequently asked questions", nl: "Veelgestelde vragen" },
  "faq.group.workingTogether": { en: "Working together", nl: "Samenwerken" },
  "faq.group.servicesPlatforms": { en: "Services and platforms", nl: "Diensten en platforms" },
  "faq.group.practical": { en: "Practical", nl: "Praktisch" },
  "process.heading": { en: "How we work", nl: "Hoe wij werken" },
  "afterLaunch.heading": {
    en: "Launch is the start, not the finish",
    nl: "Livegang is het begin, niet het einde",
  },
  "services.whyHeadingDefault": {
    en: "Why this sits with design and development",
    nl: "Waarom dit bij design en development hoort",
  },
  "services.shopifyWhyHeading": {
    en: "When Shopify is not the right choice",
    nl: "Wanneer Shopify niet de juiste keuze is",
  },
  "breadcrumb.home": { en: "Home", nl: "Home" },
  "nav.insights": { en: "Insights", nl: "Inzichten" },
  "insights.readMore": { en: "Read article", nl: "Lees artikel" },
  "privacy.eyebrow": { en: "Privacy", nl: "Privacy" },
  "footer.privacyLink": { en: "Privacy policy", nl: "Privacybeleid" },
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
  "services.2.title": { en: "Social Media Management", nl: "Social media beheer" },
  "services.2.desc": {
    en: "We plan, create, and manage social content that keeps brands visible, consistent, and growing.",
    nl: "We plannen, creëren en beheren social content die merken zichtbaar, consistent en groeiend houdt.",
  },
  "services.3.title": { en: "Creative thinking", nl: "Creative thinking" },
  "services.3.desc": {
    en: "We steer the creative vision across campaigns, content rollouts, and brand initiatives.",
    nl: "Wij sturen de creatieve visie aan bij campagnes, contentuitrol en merkinitiatieven.",
  },
  "services.explore": { en: "Explore service", nl: "Bekijk dienst" },
  "services.pageIntro": {
    en: "A closer look at the brand, web, social media, and creative systems we build.",
    nl: "Een nadere blik op de merk-, web-, social media- en creatieve systemen die we bouwen.",
  },
  "services.related": { en: "Related work", nl: "Relevant werk" },
  "services.back": { en: "Back to services", nl: "Terug naar diensten" },
  "services.viewRelatedWork": { en: "View related work", nl: "Bekijk relevant werk" },
  "services.notFound": { en: "Service not found", nl: "Dienst niet gevonden" },
  "services.emptyRelated": {
    en: "Relevant case studies will appear here soon.",
    nl: "Relevante cases verschijnen hier binnenkort.",
  },
  "services.carouselTouchHint": {
    en: "Swipe through the work.",
    nl: "Swipe door het werk.",
  },
  "services.carouselDesktopHint": {
    en: "Explore the projects through the center stage.",
    nl: "Verken de projecten via de center stage.",
  },
  "services.allServices": { en: "All services", nl: "Alle diensten" },
  "services.capabilities": { en: "Focus areas", nl: "Focusgebieden" },
  "services.closeDetail": { en: "Close", nl: "Sluiten" },
  "serviceShowcase.powermobile.label": {
    en: "Product Design",
    nl: "Productontwerp",
  },
  "serviceShowcase.powermobile.subtitle": {
    en: "A mobile case management system built from scratch for government field teams.",
    nl: "Een mobiel zaaksysteem from scratch gebouwd voor overheidsprofessionals in het veld.",
  },
  "serviceShowcase.stelz-web-design.label": {
    en: "Web Design",
    nl: "Webdesign",
  },
  "serviceShowcase.stelz-web-design.subtitle": {
    en: "A conversion-focused Shopify redesign with clearer collection discovery.",
    nl: "Een conversiegerichte Shopify redesign met helderdere collectienavigatie.",
  },
  "serviceShowcase.verkeersschool-beckers-branding.label": {
    en: "Brand Identity",
    nl: "Merkidentiteit",
  },
  "serviceShowcase.verkeersschool-beckers-branding.subtitle": {
    en: "A full identity system rolled out across social media, web, print, and the road.",
    nl: "Een complete identiteit doorvertaald naar social media, web, print en de weg.",
  },
  "serviceShowcase.nova-brand-platform.label": {
    en: "Brand Platform",
    nl: "Brand Platform",
  },
  "serviceShowcase.nova-brand-platform.subtitle": {
    en: "A cohesive brand ecosystem built to scale across every touchpoint.",
    nl: "Een samenhangend merkecosysteem gebouwd om op elk touchpoint te schalen.",
  },
  "serviceShowcase.flux-motion-identity.label": {
    en: "Motion Identity",
    nl: "Motion Identity",
  },
  "serviceShowcase.flux-motion-identity.subtitle": {
    en: "A cinematic visual identity system shaped for motion-led storytelling.",
    nl: "Een filmisch identity-systeem gevormd voor motion-led storytelling.",
  },

  /* ── Design Timeline ── */
  "timeline.label": { en: "DYSIGNS way", nl: "De DYSIGNS manier" },
  "timeline.0.title": { en: "Discover", nl: "Ontdekken" },
  "timeline.0.desc": {
    en: "We explore your brand, goals and users to define the right direction.",
    nl: "We verkennen je merk, doelen en gebruikers om de juiste richting te bepalen.",
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
    en: "Met prototypes brengen we ideeen tot leven en scherpen we keuzes aan",
    nl: "With prototypes we bring ideas to life and refine decisions",
  },
  "timeline.4.title": { en: "Build", nl: "Bouwen" },
  "timeline.4.desc": {
    en: "We turn the concepts into working solutions",
    nl: "We vertalen de concepten naar werkende oplossingen",
  },
  "timeline.5.title": { en: "Launch", nl: "Lanceren" },
  "timeline.5.desc": {
    en: "Your brand goes live. We monitor, optimize and iterate.",
    nl: "Je merk gaat live. We monitoren, optimaliseren en itereren.",
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
    en: "Let’s just talk, we’re very chill.",
    nl: "Laten we lekker babbelen, we zijn heel gezellig.",
  },
  "contact.sub": {
    en: "Got an idea in mind? We’d love to make something unique with you.",
    nl: "Heb je een idee in gedachten? We houden van unieke dingen.",
  },
  "contact.contactUs": { en: "Contact us", nl: "Neem contact op" },
  "contact.viewForm": { en: "Go to the contact form", nl: "Ga naar het contactformulier" },
  "contact.label": { en: "Contact", nl: "Contact" },
  "contact.followUs": { en: "Follow us", nl: "Volg ons" },
  "contact.form.emailLabel": { en: "Your email", nl: "Jouw e-mail" },
  "contact.form.emailPlaceholder": { en: "you@awesome.com", nl: "jij@geweldig.nl" },
  "contact.form.messageLabel": { en: "What's on your mind?", nl: "Waar denk je aan?" },
  "contact.form.messagePlaceholder": {
    en: "Tell us about your idea, your project, or just say hi...",
    nl: "Vertel over je idee, je project, of zeg gewoon hoi...",
  },
  "contact.form.submit": { en: "Send it over", nl: "Verstuur maar" },
  "contact.form.verifyError": {
    en: "We could not verify you are human. Please try again.",
    nl: "We konden niet verifiëren dat je een mens bent. Probeer het opnieuw.",
  },
  "contact.or": { en: "OR", nl: "OF" },
  "contact.sendWhatsapp": { en: "Send me a WhatsApp!", nl: "Stuur een WhatsApp!" },
  "contact.nap.emailLabel": { en: "Email", nl: "E-mail" },
  "contact.nap.phoneLabel": { en: "Phone / WhatsApp", nl: "Telefoon / WhatsApp" },
  "contact.nap.location": {
    en: "Almere & Amsterdam, Netherlands",
    nl: "Almere & Amsterdam, Nederland",
  },

  /* ── Thank You Page ── */
  "thankyou.label": { en: "Message sent", nl: "Bericht verstuurd" },
  "thankyou.headline": { en: "Thanks, got it.", nl: "Bedankt, binnen." },
  "thankyou.sub": {
    en: "Your message is on its way to us. We reply within one business day.",
    nl: "Je bericht is onderweg naar ons. We reageren binnen één werkdag.",
  },
  "thankyou.backHome": { en: "Back to home", nl: "Terug naar home" },

  /* ── About Page ── */
  "about.label": { en: "About us", nl: "Over ons" },
  "about.introPre": {
    en: "DYSIGNS is a creative partner: a small team",
    nl: "DYSIGNS is een creative partner: een klein team",
  },
  "about.introPost": {
    en: ". We handle the whole journey: UX and brand identity, websites and Shopify stores, data-driven SEO and technical optimization, AI implementation, and the social and paid campaigns that bring in customers afterwards. One partner instead of four vendors pointing at each other. Based in the Netherlands, working with clients worldwide.",
    nl: ". Wij verzorgen het hele traject: UX en merkidentiteit, websites en Shopify-webshops, data-gedreven SEO en technische optimalisatie, AI-implementatie, en de social-media- en advertentiecampagnes die daarna klanten binnenhalen. Eén partner in plaats van vier leveranciers die naar elkaar wijzen. Gevestigd in Nederland, met klanten over de hele wereld.",
  },
  "about.storyTitle": {
    en: "DYSIGNS create with intent, craft with care",
    nl: "DYSIGNS creëert met intentie, bouwen met zorg.",
  },
"about.storyText": {
en: "We started as UX and UI designers driven by curiosity and the ambition to grow across multiple design disciplines, which ultimately led to the creation of DYSIGNS.\n\n\nAlong this journey, we identified a recurring problem where clients had to wait too long for changes and lacked clarity in the process, causing lost momentum and missed opportunities, and that insight became the foundation of DYSIGNS.\n\n\nToday, our workflow is built around transparency, speed, and a true partner experience, with short feedback loops, clear communication, and a realistic yet fast pace so digital ideas move forward quickly. Strong UX and UI stay at the core, backed by strategic, data-driven SEO and technical optimization, so visibility scales with the work instead of trailing behind it.",
nl: "We zijn gestart als UX en UI designers met een sterke drang om te groeien en verschillende disciplines binnen design te verkennen, wat uiteindelijk leidde tot de oprichting van DYSIGNS.\n\n\nTijdens dit traject merkten we een terugkerend probleem waarbij klanten vaak te lang moesten wachten op aanpassingen en duidelijkheid ontbrak in het proces, waardoor momentum verloren ging en kansen bleven liggen, precies dat inzicht vormde de basis van DYSIGNS.\n\n\nDaarom bouwen wij onze werkwijze rond transparantie, snelheid en een echte partnerervaring, met korte feedbackloops, heldere communicatie en een realistisch maar hoog werktempo zodat digitale ideeën snel tot leven komen. Sterke UX en UI blijven de kern, ondersteund door strategische, data-gedreven SEO en technische optimalisatie, zodat vindbaarheid meegroeit met het werk in plaats van erachteraan te lopen."
},
  "about.valuesLabel": { en: "What we believe", nl: "Waar we in geloven" },
  "about.value0.title": { en: "Craft over shortcuts", nl: "Vakmanschap boven shortcuts" },
  "about.value0.text": {
    en: "Every pixel, every interaction, every word: we obsess over the details because that\u2019s where the magic lives.",
    nl: "Elke pixel, elke interactie, elk woord: we zijn geobsedeerd door de details, want daar zit de magie.",
  },
  "about.value1.title": { en: "Strategy first", nl: "Strategie eerst" },
  "about.value1.text": {
    en: "Beautiful work means nothing without purpose. We start with \u2018why\u2019 before we ever touch a screen, backed by data instead of guesswork, so organic visibility scales as the work does.",
    nl: "Mooi werk betekent niets zonder doel. We beginnen met \u2018waarom\u2019 voordat we een scherm aanraken, onderbouwd met data in plaats van giswerk, zodat organische vindbaarheid meegroeit met het werk.",
  },
  "about.value2.title": { en: "Honest collaboration", nl: "Eerlijke samenwerking" },
  "about.value2.text": {
    en: "We\u2019re not order-takers. We challenge assumptions, share ideas openly, and build trust through transparency.",
    nl: "Wij nemen niet klakkeloos orders aan. We dagen aannames uit, delen ideeën openlijk en bouwen vertrouwen op door transparantie.",
  },
  "about.value3.title": { en: "Lasting impact", nl: "Blijvende impact" },
  "about.value3.text": {
    en: "We measure success not in deliverables but in outcomes: brands that grow, communities that engage, experiences people remember.",
    nl: "We meten succes niet in opleverpunten maar in resultaten: merken die groeien, communities die betrokken raken en ervaringen die mensen onthouden.",
  },
  "about.ctaTitle": {
    en: "Interested in working together?",
    nl: "Interesse om samen te werken?",
  },
  "about.ctaButton": { en: "Get in touch", nl: "Neem contact op" },
  "about.insightsLink": { en: "Or read our insights", nl: "Of lees onze inzichten" },

  /* ── Work Page ── */
  "work.label": { en: "Our work", nl: "Ons werk" },
  "work.title": { en: "Selected projects", nl: "Geselecteerde projecten" },
  "work.viewAll": { en: "View all work", nl: "Bekijk al het werk" },
  "work.filterAll": { en: "All", nl: "Alle" },
  "work.clearFilters": { en: "Reset filters", nl: "Filters resetten" },
  "work.filteredBy": { en: "Filtered by", nl: "Gefilterd op" },
  "work.serviceFilter": { en: "Service", nl: "Dienst" },
  "work.tagFilter": { en: "Tag", nl: "Tag" },
  "work.noResults": {
    en: "No projects match these filters yet.",
    nl: "Er passen nog geen projecten bij deze filters.",
  },
  "work.noResultsBody": {
    en: "Try another tag or reset the view to see all work.",
    nl: "Probeer een andere tag of reset het overzicht om al het werk te zien.",
  },

/* ── Case Detail ── */
  "case.back": { en: "Back to work", nl: "Terug naar werk" },
  "case.overview": { en: "Overview", nl: "Overzicht" },
  "case.outcomes": { en: "Results", nl: "Resultaten" },
  "case.previous": { en: "Previous", nl: "Vorige" },
  "case.next": { en: "Next", nl: "Volgende" },
  "case.notFound": { en: "Project not found", nl: "Project niet gevonden" },
  "case.visit": { en: "VISIT", nl: "BEZOEK" },
  "case.download": { en: "DOWNLOAD", nl: "DOWNLOAD" },
  "case.client": { en: "Client", nl: "Klant" },
  "case.services": { en: "Services", nl: "Diensten" },
  "case.year": { en: "Year", nl: "Jaar" },
  "case.before": { en: "Before", nl: "Voor" },
  "case.after": { en: "After", nl: "Na" },
  "case.scroll": { en: "Scroll", nl: "Scroll" },

  /* ── Footer ── */
  "footer.rights": { en: "All rights reserved.", nl: "Alle rechten voorbehouden." },

  /* ── 404 / Not Found ── */
  "notFound.title": { en: "Page not found | DYSIGNS", nl: "Pagina niet gevonden | DYSIGNS" },
  "notFound.description": {
    en: "This page doesn't exist (anymore).",
    nl: "Deze pagina bestaat niet (meer).",
  },
  "notFound.heading": { en: "Page not found", nl: "Pagina niet gevonden" },
  "notFound.goHome": { en: "Go home", nl: "Ga naar home" },
  "notFound.sections": { en: "Main sections", nl: "Hoofdsecties" },

  /* ── Language Toggle ── */
  "lang.switchTo": { en: "Switch to Dutch", nl: "Switch to English" },

  /* ── Testimonial Quotes (i18n) ── */
  "testimonial.t1.quote": {
    en: "Happy partners, clear deadlines and high quality delivery, working with DYSIGNS strengthened our brand STËLZ and accelerated our growth",
    nl: "Tevreden partners, strakke deadlines en hoge kwaliteit, samenwerken met DYSIGNS heeft ons merk STËLZ versterkt en versneld laten groeien",
  },
  "testimonial.t2.quote": {
    en: "In 20 years of running my business, I’ve never had a designer who could visualize my idea that well in just one go.",
    nl: "In 20 jaar ondernemen heb ik nog nooit een designer gehad die mijn idee in een keer zo goed wist te visualiseren.",
  },
  "testimonial.t3.quote": {
    en: "DYSIGNS and Fijne Gasten have built a strong partnership with clear communication, fast delivery and consistent quality.",
    nl: "DYSIGNS en Fijne Gasten werken al langere tijd sterk samen met korte lijnen, snelle opleveringen en consistente kwaliteit.",
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
  "category.App Design": { en: "App Design", nl: "App Design" },
  "category.Branding": { en: "Branding", nl: "Branding" },
  "category.Digital": { en: "Digital", nl: "Digitaal" },
  "category.Social Media Management": {
    en: "Social Media Management",
    nl: "Social media beheer",
  },
  "category.Web": { en: "Web", nl: "Web" },
  "category.Product Design": { en: "Product Design", nl: "Productdesign" },

  /* ── Tag translations ── */
  "tag.Brand Identity": { en: "Brand Identity", nl: "Merkidentiteit" },
  "tag.App Design": { en: "App Design", nl: "App Design" },
  "tag.POS Design": { en: "POS Design", nl: "Kassasysteem" },
  "tag.Kiosk Design": { en: "Kiosk Design", nl: "Kiosk Design" },
  "tag.Email Marketing": { en: "Email Marketing", nl: "E-mailmarketing" },
  "tag.Logo Design": { en: "Logo Design", nl: "Logo-ontwerp" },
  "tag.Co-Creation": { en: "Co-Creation", nl: "Co-creatie" },
  "tag.Web Design": { en: "Web Design", nl: "Webdesign" },
  "tag.Design System": { en: "Design System", nl: "Design System" },
  "tag.Mobile App": { en: "Mobile App", nl: "Mobiele App" },
  "tag.UX Design": { en: "UX Design", nl: "UX-ontwerp" },
  "tag.E-Commerce": { en: "E-Commerce", nl: "E-commerce" },
  "tag.Development": { en: "Development", nl: "Ontwikkeling" },
  "tag.Dashboard": { en: "Dashboard", nl: "Dashboard" },
  "tag.SaaS": { en: "SaaS", nl: "SaaS" },
  "tag.Data Viz": { en: "Data Viz", nl: "Datavisualisatie" },
  "tag.Branding": { en: "Branding", nl: "Branding" },
  "tag.Print": { en: "Print", nl: "Print" },
  "tag.Web": { en: "Web", nl: "Web" },
  "tag.Social Media": { en: "Social Media", nl: "Social media" },
  "tag.Social Media Management": { en: "Social Media Management", nl: "Social media beheer" },
  "tag.Creative Direction": { en: "Creative Direction", nl: "Creatieve Regie" },
  "tag.Photography": { en: "Photography", nl: "Fotografie" },
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
    en: "Design system adopted across 3 internal teams",
    nl: "Design system overgenomen door 3 interne teams",
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

  /* ── Project: STËLZ App ── */
  "project.stelz-app.title": {
    en: "STËLZ App",
    nl: "STËLZ App",
  },
  "project.stelz-app.seoTitle": {
    en: "STËLZ App: iOS & Android App Design & Build | DYSIGNS",
    nl: "STËLZ app: iOS- en Android-app design | DYSIGNS",
  },
  "project.stelz-app.seoDescription": {
    en: "We designed and built the STËLZ app for iOS and Android, from first sketch to the App Store and Google Play, starting with a nationwide flavour vote.",
    nl: "Wij ontwierpen en bouwden de STËLZ app voor iOS en Android, van eerste schets tot App Store en Google Play, met als start een landelijke smaakverkiezing.",
  },
  "project.stelz-app.overview": {
    en: "STËLZ asked us to build their own app, and we designed and developed it from the first sketch to the App Store and Google Play. The first campaign in the app is Strijd voor je smaak 2026: fans pick their favourite from six flavours, and the maker of the winning flavour takes home \u20ac50,000. Every vote has to count exactly once, so each one is confirmed with an email code and checked on the server before it is stored, while the result stays hidden until the campaign closes. Voting should feel like a moment, so motion sits at the heart of the design: cans you swipe through, springy feedback on every tap and a thank-you screen that celebrates your choice. Push notifications keep fans in the loop on new flavours, events and campaigns. One codebase runs on both iOS and Android, built to grow with STËLZ from a campaign app into a full brand app. Design, development and motion under one roof, from the first screen to the store listing.",
    nl: "STËLZ vroeg ons om hun eigen app te bouwen, en wij ontwierpen en ontwikkelden die van de eerste schets tot in de App Store en Google Play. De eerste campagne in de app is Strijd voor je smaak 2026: fans kiezen hun favoriet uit zes smaken, en de maker van de winnende smaak wint \u20ac50.000. Elke stem moet precies één keer tellen, dus wordt iedere stem bevestigd met een e-mailcode en op de server gecontroleerd voordat hij wordt opgeslagen, terwijl de uitslag verborgen blijft tot de campagne sluit. Stemmen moet voelen als een moment, daarom staat beweging centraal in het ontwerp: blikjes waar je doorheen swipet, verende feedback bij elke tik en een bedankscherm dat je keuze viert. Met pushmeldingen blijven fans op de hoogte van nieuwe smaken, events en acties. Eén codebase draait op zowel iOS als Android, gebouwd om met STËLZ mee te groeien van campagne-app naar volwaardige merkapp. Design, development en motion onder één dak, van het eerste scherm tot de store-vermelding.",
  },
  "project.stelz-app.alt.cover": {
    en: "STËLZ app case by DYSIGNS",
    nl: "STËLZ app case door DYSIGNS",
  },
  "project.stelz-app.alt.0": {
    en: "STËLZ app flavour picker designs: six screens for Rum Cola, Watermelon Mint, Cherry, Yuzu, Elderflower and Spicy Pineapple, each with its own colour, can and fruit",
    nl: "Ontwerpen van de smaakkeuze in de STËLZ app: zes schermen voor Rum Cola, Watermelon Mint, Cherry, Yuzu, Elderflower en Spicy Pineapple, elk met eigen kleur, blik en fruit",
  },
  "project.stelz-app.alt.1": {
    en: "STËLZ app onboarding designs: the welcome screen with age check and two Strijd voor je smaak campaign screens, one announcing the €50,000 prize",
    nl: "Ontwerpen van de onboarding in de STËLZ app: het welkomstscherm met leeftijdscheck en twee campagneschermen van Strijd voor je smaak, één met de prijs van €50.000",
  },
  "project.stelz-app.alt.2": {
    en: "STËLZ app voting flow designs: choosing Rum Cola, confirming the single vote with a slider and entering your details to verify it",
    nl: "Ontwerpen van de stemflow in de STËLZ app: Rum Cola kiezen, de ene stem bevestigen met een schuifknop en je gegevens invullen om de stem te verifiëren",
  },
  "project.stelz-app.alt.3": {
    en: "STËLZ app designs after voting: six Jij zit in team screens with two floating cans in the colours of each flavour",
    nl: "Ontwerpen in de STËLZ app na het stemmen: zes Jij zit in team-schermen met twee zwevende blikjes in de kleuren van elke smaak",
  },
  "project.stelz-app.alt.4": {
    en: "STËLZ app result designs: the winner reveal video, the screen telling you your flavour won and the full result with percentages per flavour",
    nl: "Ontwerpen van de uitslag in de STËLZ app: de video met de winnaar, het scherm dat jouw smaak heeft gewonnen en de volledige uitslag met percentages per smaak",
  },
  "project.stelz-app.alt.5": {
    en: "STËLZ app community designs: turning on notifications, choosing your interests and the thank-you screen for your vote",
    nl: "Ontwerpen voor de community in de STËLZ app: notificaties aanzetten, je interesses kiezen en het bedankscherm voor je stem",
  },
  "project.stelz-app.alt.6": {
    en: "The STËLZ app design flow in Figma: every screen from splash to the end of the campaign, connected with arrows on a dark blue board",
    nl: "De designflow van de STËLZ app in Figma: alle schermen van splash tot het einde van de campagne, verbonden met pijlen op een donkerblauw bord",
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
  "project.stelz-web-design.title": {
    en: "STËLZ Web Design",
    nl: "STËLZ Web Design",
  },
  "project.stelz-web-design.overview": {
 en: "STËLZ asked us to redesign their website to improve conversion and simplify daily updates across teams. We created a modular Shopify setup that supports faster collection discovery, a smoother add to cart flow and a clear content structure that allows quick edits without development dependency. Our collaboration evolved into a long term partnership where we continuously refine the experience through design iterations, UX optimisation and campaign driven updates. This ongoing workflow ensures the platform stays aligned with brand growth, supports new campaign launches and maintains strong performance across devices while enabling the STËLZ team to manage content efficiently.",
  nl: "STËLZ vroeg ons om hun website te herontwerpen voor meer conversie en eenvoudiger beheer. We bouwden een modulaire Shopify ervaring met snellere productkeuze, een soepelere add to cart flow en een heldere content structuur voor snelle aanpassingen.",
},

"project.stelz-web-design.outcome.0": {
  en: "€200K+ revenue during the campaign launch weekend",
  nl: "€200K+ omzet tijdens het livegang weekend van de campagne",
},
"project.stelz-web-design.outcome.1": {
  en: "4,000+ orders in three days",
  nl: "4.000+ bestellingen in drie dagen",
},
"project.stelz-web-design.outcome.2": {
  en: "19,000+ visitors and 27,000+ sessions",
  nl: "19.000+ bezoekers en 27.000+ sessies",
},
"project.stelz-web-design.outcome.3": {
  en: "4,200+ unique customers and 19%+ returning",
  nl: "4.200+ unieke klanten en 19%+ terugkerend",
},

  /* ── Project: Verkeersschool Beckers Branding ── */
  "project.verkeersschool-beckers-branding.title": {
    en: "Verkeersschool Beckers Branding",
    nl: "Verkeersschool Beckers Branding",
  },
  "project.verkeersschool-beckers-branding.overview": {
    en: "For Verkeersschool Beckers, we developed a complete new brand identity to modernize and professionalize their presence in the Dutch market. The project included a full logo redesign, visual identity system, and consistent brand application across all touchpoints.\n\nWe translated the new identity into social media assets, vehicle branding, and a fully redesigned website. The result is a cohesive and recognizable brand that builds trust and stands out both online and on the road.",
    nl: "Voor Verkeersschool Beckers ontwikkelden we een compleet nieuwe merkidentiteit om hun uitstraling in de Nederlandse markt te moderniseren en te professionaliseren. Het project bestond uit een volledige logo redesign, een visueel identiteitssysteem en consistente merktoepassing over alle touchpoints.\n\nWe vertaalden de nieuwe identiteit door naar social media assets, voertuigbestickering en een volledig vernieuwde website. Het resultaat is een samenhangend en herkenbaar merk dat vertrouwen opbouwt en zowel online als op de weg opvalt.",
  },
  "project.verkeersschool-beckers-branding.outcome.0": {
    en: "Complete logo redesign and new visual identity delivered",
    nl: "Volledige logo redesign en nieuwe visuele identiteit opgeleverd",
  },
  "project.verkeersschool-beckers-branding.outcome.1": {
    en: "Brand system translated across social media, web, and vehicle branding",
    nl: "Het brandsysteem doorvertaald naar social media, web en voertuigbestickering",
  },
  "project.verkeersschool-beckers-branding.outcome.2": {
    en: "More professional and recognizable market presence",
    nl: "Een professionelere en beter herkenbare marktuitstraling",
  },
  "project.verkeersschool-beckers-branding.outcome.3": {
    en: "A consistent identity ready for long-term growth",
    nl: "Een consistente identiteit klaar voor duurzame groei",
  },

  /* ── Project: PowerMobile ── */
  "project.powermobile.title": {
    en: "PowerMobile",
    nl: "PowerMobile",
  },
  "project.powermobile.overview": {
    en: "The Challenge\n\nFor enforcement officers and other field workers in the VTH sector (Vergunning, Toezicht en Handhaving), the real work happens on the street. Yet these government professionals were using an outdated app that made case management in the field unnecessarily slow and cumbersome. There was an urgent need for a fast, reliable system that supported their work rather than slowing it down.\n\nThe Solution\n\nTo tackle this, I designed and developed PowerMobile entirely from scratch. As lead for both design and technical development, I built a modern, case-oriented system that makes permit and case management directly accessible in the field. The app features an intuitive interface for managing cases, consulting interactive maps, and tracking workflows—fully responsive across all devices.\n\nThe Result\n\nEvery part of PowerMobile was shaped around the day-to-day realities of government professionals. The impact was immediate: user satisfaction rose from 15% with the old system to over 40% with the new app.",
    nl: "De Uitdaging\n\nVoor handhavers en andere buitendienstmedewerkers in de VTH-sector (Vergunning, Toezicht en Handhaving) gebeurt het echte werk op straat. Toch werkten deze overheidsprofessionals met een verouderde app, waardoor het beheren van zaken in de praktijk onnodig traag en omslachtig was. Er was dringend behoefte aan een snel en betrouwbaar systeem dat het werk in het veld ondersteunde in plaats van vertraagde.\n\nDe Oplossing\n\nOm dit probleem aan te pakken, heb ik PowerMobile volledig van scratch af aan ontworpen en ontwikkeld. Als lead voor zowel het design als de technische realisatie, heb ik een modern, zaakgericht systeem neergezet dat vergunningen en zaakbeheer direct toegankelijk maakt in het veld. De app heeft een intuïtieve interface voor het beheren van zaken, het raadplegen van interactieve kaarten en het volgen van workflows. Bovendien is de applicatie volledig responsive gebouwd, zodat deze soepel werkt op ieder apparaat.\n\nHet Resultaat\n\nElk onderdeel van PowerMobile is ontworpen vanuit de dagelijkse praktijk en de specifieke behoeften van medewerkers bij overheidsinstanties. Dit heeft geleid tot een efficiënter werkproces en een veel prettigere gebruikerservaring op straat. Uit de enquête na de lancering bleek de impact direct: de gebruikerstevredenheid steeg van 15% bij het oude systeem naar ruim 40% voor de nieuwe app.",
  },
  "project.powermobile.outcome.0": {
    en: "User satisfaction increased from 15% to 40% post-launch",
    nl: "Gebruikerstevredenheid steeg van 15% naar 40% na lancering",
  },
  "project.powermobile.outcome.1": {
    en: "Full app built from scratch — design through development",
    nl: "Volledige app from scratch gebouwd — van ontwerp tot ontwikkeling",
  },
  "project.powermobile.outcome.2": {
    en: "Interactive map integration for real-time field case management",
    nl: "Interactieve kaartintegratie voor zaakbeheer in de buitendienst",
  },
  "project.powermobile.outcome.3": {
    en: "Adopted across multiple government institutions in the VTH sector",
    nl: "In gebruik bij meerdere overheidsinstellingen in de VTH-sector",
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

  /* \u2500\u2500 Project: A/Caf\u00e9 App Design \u2500\u2500 */
  "project.a-cafe-app-design.title": {
    en: "A/Caf\u00e9 POS & Kiosk Design",
    nl: "A/Caf\u00e9 Kassa & Kiosk Design",
  },
  "project.a-cafe-app-design.overview": {
    en: "What began as an MVP for a single self-ordering kiosk grew into a full ordering system: DYSIGNS designed the kiosk, the POS and the kitchen display as one connected product, all speaking the same visual language. Email marketing was set up end to end alongside it. The system is now running in test phase across A/Caf\u00e9's physical stores worldwide, from Amsterdam and Paris to Dubai and Miami, with guests ordering, staff fulfilling and the brand showing through at every step.",
    nl: "Wat begon als een MVP voor \u00e9\u00e9n self-order kiosk, groeide uit tot een volledig bestelsysteem: DYSIGNS ontwierp de kiosk, de kassa en het keukendisplay als \u00e9\u00e9n samenhangend product, allemaal in dezelfde visuele taal. E-mailmarketing werd er end-to-end bij ingericht. Het systeem draait nu in testfase in A/Caf\u00e9's fysieke vestigingen wereldwijd, van Amsterdam en Parijs tot Dubai en Miami, waarbij gasten bestellen, personeel uitserveert en het merk in elke stap doorklinkt.",
  },
  "project.a-cafe-app-design.outcome.0": {
    en: "One visual system spans kiosk, POS and kitchen display end to end",
    nl: "\u00c9\u00e9n visueel systeem loopt door van kiosk tot kassa tot keukendisplay",
  },
  "project.a-cafe-app-design.outcome.1": {
    en: "Now running in test phase across A/Caf\u00e9 stores in Amsterdam, Paris, Dubai and Miami",
    nl: "Draait nu in testfase in A/Caf\u00e9-vestigingen in Amsterdam, Parijs, Dubai en Miami",
  },
  "project.a-cafe-app-design.outcome.2": {
    en: "Built from an MVP concept through to a real in-store pilot",
    nl: "Ontwikkeld van MVP-concept tot een echte pilot in de winkel",
  },
  "project.a-cafe-app-design.outcome.3": {
    en: "Guest, staff and brand all speak the same visual language",
    nl: "Gast, personeel en merk spreken allemaal dezelfde visuele taal",
  },

  /* \u2500\u2500 Project: Studio75 Branding \u2500\u2500 */
  "project.studio75-branding.title": {
    en: "Studio75 Branding",
    nl: "Studio75 Branding",
  },
  "project.studio75-branding.seoTitle": {
    en: "Studio75 Brand Identity & Logo Design | DYSIGNS",
    nl: "Studio75 merkidentiteit & logo-ontwerp | DYSIGNS",
  },
  "project.studio75-branding.seoDescription": {
    en: "We created the brand identity for Studio75: moodboard, logo, colours, typography and business cards. Branding by DYSIGNS, creative partner in NL.",
    nl: "Wij creëerden de merkidentiteit van Studio75: moodboard, logo, kleuren, typografie en visitekaartjes. Branding door DYSIGNS, creative partner.",
  },
  "project.studio75-branding.overview": {
    en: "We created the brand identity for Studio75, from the first moodboard to the logo, colours, typography and business cards. Every identity we make starts the same way: by listening. Together with the founder we collected references, from nightlife and movement to typographic posters and texture, until a taste emerged that was unmistakably Studio75. From there our team worked fast and with focus, exploring three logo directions around a bold asterisk symbol, from expressive and handmade to clean and textured, and turning the chosen one into a complete system: palette, type and print assets, all documented in a brandbook. The result is a premium foundation that feels as sharp on a business card as it does on a screen. At DYSIGNS we bring your idea and your passion to life, and because the base is right from day one, everything built on top of it holds together.",
    nl: "Wij creëerden de merkidentiteit van Studio75, van het eerste moodboard tot het logo, de kleuren, de typografie en de visitekaartjes. Elke identiteit begint bij ons hetzelfde: met luisteren. Samen met de oprichter verzamelden we referenties, van nachtleven en beweging tot typografische posters en textuur, tot er een smaak ontstond die onmiskenbaar Studio75 was. Vanaf daar werkte ons team snel en gefocust: we verkenden drie logorichtingen rond een gedurfd sterretjessymbool, van expressief en handgemaakt tot strak en getextureerd, en werkten de gekozen richting uit tot een compleet systeem van kleurpalet, typografie en drukwerk, vastgelegd in een brandbook. Het resultaat is een luxe, stevige basis die op een visitekaartje net zo scherp oogt als op een scherm. Bij DYSIGNS brengen we jouw idee en jouw passie tot leven, en doordat de basis vanaf dag één klopt, houdt alles wat erop gebouwd wordt samen.",
  },
  "project.studio75-branding.alt.cover": {
    en: "Studio75 logo in bold white lettering with a registered mark, over a dark, red-lit silhouette of a person",
    nl: "Studio75-logo in vette witte letters met ®-teken, over een donker, rood verlicht silhouet van een persoon",
  },
  "project.studio75-branding.alt.0": {
    en: "Studio75 brand identity moodboard: a dense collage of posters, portraits and photography in orange, black and blue, with taped labels such as crowd energy, movement, texture and typographic posters",
    nl: "Studio75 merkidentiteit, moodboard: een dichte collage van posters, portretten en fotografie in oranje, zwart en blauw, met labels als crowd energy, movement, texture en typographic posters",
  },
  "project.studio75-branding.alt.1": {
    en: "Studio75 logo design, three variants: three versions of the asterisk symbol with a bold wordmark in black on an off-white background",
    nl: "Studio75 logo-ontwerp, drie varianten: drie versies van het sterretjessymbool met vet woordmerk in zwart op een gebroken witte achtergrond",
  },
  "project.studio75-branding.alt.2": {
    en: "Studio75 brand identity on print, business cards with a black front and an off-white back with orange edges, showing the asterisk logo, contact details and the line More impact, less friction",
    nl: "Studio75 huisstijl op drukwerk, visitekaartjes met een zwarte voorkant en een gebroken witte achterkant met oranje randen, met het sterretjeslogo, contactgegevens en de tekst More impact, less friction",
  },
  "project.studio75-branding.alt.3": {
    en: "Studio75 brand typography page showing the typeface in Book, Medium, Bold and Extra Bold with the alphabet and numerals in white and orange on dark grey",
    nl: "Typografiepagina van de Studio75-huisstijl met het lettertype in Book, Medium, Bold en Extra Bold, met alfabet en cijfers in wit en oranje op donkergrijs",
  },
  /* \u2500\u2500 Project: Merely Made Webshop \u2500\u2500 */
  "project.merely-made-webshop.title": {
    en: "Merely Made Webshop",
    nl: "Merely Made Webshop",
  },
  "project.merely-made-webshop.seoTitle": {
    en: "Merely Made Webshop: Fashion E-commerce Design | DYSIGNS",
    nl: "Merely Made webshop: mode e-commerce design | DYSIGNS",
  },
  "project.merely-made-webshop.seoDescription": {
    en: "We designed, developed and built the webshop for Merely Made, the Korean fashion brand from Seoul, sold in 32 stores from Paris to Tokyo.",
    nl: "Wij ontwierpen, ontwikkelden en bouwden de webshop van Merely Made, het Koreaanse modemerk uit Seoul dat in 32 winkels ligt, van Parijs tot Tokio.",
  },
  "project.merely-made-webshop.overview": {
    en: "We designed, developed and built the webshop for Merely Made, the Korean fashion brand from Seoul, sold in 32 stores from Paris to Tokyo. The brand already had a strong identity, so we started by understanding it: the calm tone, the quiet confidence and the room around every garment. We then translated that identity into web design, with negative space as the main design tool, so the clothes and photography can breathe and the interface stays out of the way. With a fast, focused team we built the store from scratch, from home page and lookbook to shop, product pages and stockists, designed and built for desktop and mobile together. Design and development under one roof means no handoff delays, just a webshop that goes live fast and fits a brand that sells worldwide.",
    nl: "Wij ontwierpen, ontwikkelden en bouwden de webshop van Merely Made, het Koreaanse modemerk uit Seoul dat in 32 winkels ligt, van Parijs tot Tokio. Het merk had al een sterke identiteit, dus begonnen we met begrijpen wat er al stond: de rustige toon, het zelfverzekerde understatement en de ruimte rondom elk kledingstuk. Die identiteit vertaalden we naar webdesign, met negatieve ruimte als belangrijkste ontwerpmiddel, zodat de kleding en fotografie kunnen ademen en de interface op de achtergrond blijft. Met een snel en gefocust team bouwden we de webshop helemaal vanaf nul, van homepage en lookbook tot shop, productpagina’s en verkooppunten, ontworpen en gebouwd voor desktop en mobiel tegelijk. Design en development onder één dak betekent geen overdrachtsvertraging, maar een webshop die snel live staat en past bij een merk dat wereldwijd verkoopt.",
  },
  "project.merely-made-webshop.alt.cover": {
    en: "Merely Made fashion webshop, lookbook photograph: a model in relaxed, layered clothing sits in soft, natural daylight",
    nl: "Merely Made modewebshop, lookbookfoto: een model in relaxte, gelaagde kleding zit in zacht daglicht",
  },
  "project.merely-made-webshop.alt.0": {
    en: "Merely Made webshop design, home page hero: close-up of a grey wool jacket with a zip collar and the collection introduction text over the photo",
    nl: "Merely Made webshop-ontwerp, hero van de homepage: close-up van een grijze wollen jas met ritskraag en de collectie-intro over de foto",
  },
  "project.merely-made-webshop.alt.1": {
    en: "Merely Made webshop design, shop page with a category filter for outerwear, knitwear, tops and bottoms next to a two-column grid of product photos",
    nl: "Merely Made webshop-ontwerp, shoppagina met een categoriefilter voor outerwear, knitwear, tops en bottoms naast een raster van twee kolommen productfoto's",
  },
  "project.merely-made-webshop.alt.2": {
    en: "Merely Made webshop design, lookbook page: a four-column grid of editorial photos of models wearing layered outerwear and knitwear",
    nl: "Merely Made webshop-ontwerp, lookbookpagina: een raster van vier kolommen met redactionele foto's van modellen in gelaagde outerwear en knitwear",
  },
  "project.merely-made-webshop.alt.3": {
    en: "Merely Made webshop design, product page with size and colour options, an add to cart button and two product photos of a beige cropped jacket",
    nl: "Merely Made webshop-ontwerp, productpagina met maat- en kleuropties, een knop voor in winkelmand en twee productfoto's van een beige cropped jack",
  },
  "project.merely-made-webshop.alt.4": {
    en: "Merely Made webshop design, new arrivals row with three product cards showing price, size selector and an add to cart button on hover",
    nl: "Merely Made webshop-ontwerp, nieuwe-collectierij met drie productkaarten met prijs, maatkeuze en een knop voor in winkelmand bij hover",
  },
  "project.merely-made-webshop.alt.5": {
    en: "Merely Made mobile webshop design: the home page, shop page and product page shown as three phone screens side by side",
    nl: "Merely Made mobiele webshop-ontwerp: de homepage, shoppagina en productpagina als drie telefoonschermen naast elkaar",
  },
};

// A page's language is a property of its URL, not a remembered client
// preference — /nl/... is the Dutch tree, everything else is English.
// This is what makes prerendering, hreflang, and sitemap entries actually
// correct per language: the same component tree renders differently
// depending on where the router mounted it, no client-only state that a
// crawler (or a fresh prerender pass) would never see.
export function pathIsDutch(pathname: string): boolean {
  return pathname === "/nl" || pathname.startsWith("/nl/");
}

export function toLangPath(pathname: string, lang: Lang): string {
  const isNl = pathIsDutch(pathname);
  if (lang === "nl") {
    if (isNl) return pathname;
    return pathname === "/" ? "/nl" : `/nl${pathname}`;
  }
  if (!isNl) return pathname;
  const stripped = pathname.slice(3); // remove leading "/nl"
  return stripped === "" ? "/" : stripped;
}

/* ─── PROVIDER ─── */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const lang: Lang = pathIsDutch(location.pathname) ? "nl" : "en";

  // Prerendered HTML sets the correct lang per route at build time (see
  // scripts/prerender.mjs); this keeps it in sync on client-side
  // navigation between the English and Dutch trees within a session.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      const target = toLangPath(location.pathname, l);
      if (target !== location.pathname) navigate(target + location.search);
    },
    [location.pathname, location.search, navigate],
  );

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

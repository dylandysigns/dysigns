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
  "cursor.email": { en: "SEND AN EMAIL", nl: "STUUR EEN E-MAIL" },
  "cursor.whatsapp": { en: "SEND A WHATSAPP", nl: "STUUR EEN WHATSAPP" },
  // Shown in the other language on purpose: it speaks to the visitor who wants to switch.
  "cursor.translate": { en: "VERTAAL NAAR NEDERLANDS", nl: "TRANSLATE TO ENGLISH" },
  "cursor.drag": { en: "DRAG ME", nl: "SLEEP MIJ" },
  "cursor.play": { en: "PLAY", nl: "AFSPELEN" },
  "cursor.contact": { en: "CONTACT", nl: "CONTACT" },
  "cursor.previous": { en: "PREVIOUS", nl: "VORIGE" },
  "cursor.next": { en: "NEXT", nl: "VOLGENDE" },

  /* ── Hero ── */
  "hero.title": {
    en: "Designed to grow.",
    nl: "Design om te groeien.",
  },
  "hero.headline.A": {
    en: "DYSIGNS is your creative partner for scaling brands and digital products, from startup to scale-up.",
    nl: "DYSIGNS is jouw creatieve partner voor merken en digitale producten die willen opschalen, van startup tot scale-up.",
  },
  "hero.cta1": { en: "See work", nl: "Bekijk ons werk" },
  "hero.cta2": { en: "Let’s connect", nl: "Laten we kennismaken" },
  "hero.available": { en: "Available for projects, Almere", nl: "Beschikbaar voor projecten, Almere" },
  "menu.workIn": { en: "Check where we work", nl: "Check waar we werken" },
  "hero.availableIn": { en: "We are available in", nl: "Wij zijn beschikbaar in" },
  "hero.availableCity": { en: "Amsterdam", nl: "Amsterdam" },
  "hero.workingFrom": { en: "We work from the Netherlands", nl: "We werken vanuit Nederland" },
  "globe.title": { en: "Projects done here", nl: "Hier deden we projecten" },
  "globe.hint": { en: "Drag the globe to turn it", nl: "Sleep de aardbol om hem te draaien" },
  "globe.back": { en: "Back", nl: "Terug" },
  "globe.reset": { en: "Back to the Netherlands", nl: "Terug naar Nederland" },
  "globe.mapLabel": { en: "Map of the Netherlands with Amsterdam and Almere", nl: "Kaart van Nederland met Amsterdam en Almere" },
  "globe.cta": { en: "Start a project", nl: "Start een project" },
  "globe.ctaLine": { en: "Got something in mind?", nl: "Iets in gedachten?" },
  "globe.mapNote": { en: "We mainly work from here", nl: "Hier werken we vooral vandaan" },
  "globe.mapTitle": { en: "The Netherlands", nl: "Nederland" },
  "hero.globeLabel": { en: "Show where we work", nl: "Bekijk waar we werken" },
  "hero.fallbackLocation": { en: "the Netherlands", nl: "Nederland" },
  "hero.scroll": { en: "Scroll", nl: "Scroll" },
  "hero.scrollDown": { en: "Scroll down", nl: "Scroll naar beneden" },
  "hero.scrollHint": { en: "Scroll to enter the experience", nl: "Scroll en stap de ervaring in" },
  "hero.keepScrolling": { en: "Keep scrolling", nl: "Blijf scrollen" },
  "hero.watchVideo": { en: "See us in 19 sec", nl: "Zie ons in 19 sec" },
  "hero.closeVideo": { en: "Close video", nl: "Sluit video" },
  "hero.quote": {
    en: "We help the digital side of your brand grow and scale, with smart design and AI implementation.",
    nl: "Wij laten de digitale kant van je merk groeien en schalen, met slim design en AI-implementatie.",
  },
  "hero.chip.strategy": { en: "Strategy", nl: "Strategie" },
  "hero.chip.ux": { en: "UX / UI", nl: "UX / UI" },
  "hero.chip.brand": { en: "Brand Identity", nl: "Brand identity" },
  "hero.chip.web": { en: "Web Design", nl: "Web Design" },
  "hero.chip.product": { en: "Social Media", nl: "Social media" },
  "hero.chip.ai": { en: "AI Implementation", nl: "AI-implementatie" },

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
  "services.useCasesHeading": { en: "Examples of what we build", nl: "Voorbeelden van wat we bouwen" },
  "services.useCasesIntro": { en: "Typical applications, each tailored to how your business works.", nl: "Typische toepassingen, telkens afgestemd op hoe jouw bedrijf werkt." },
  "services.whoHeading": { en: "Who it is for", nl: "Voor wie is dit" },
  "services.alsoFrom": { en: "Also from DYSIGNS", nl: "Ook van DYSIGNS" },
  "services.faqHeading": { en: "Frequently asked questions", nl: "Veelgestelde vragen" },
  "faq.intro": { en: "The questions we get most. Can't find yours? Ask our AI.", nl: "De vragen die we het vaakst krijgen. Staat die van jou er niet tussen? Vraag het aan onze AI." },
  "faq.group.workingTogether": { en: "Working together", nl: "Samenwerken" },
  "faq.group.servicesPlatforms": { en: "Services and platforms", nl: "Diensten en platforms" },
  "faq.group.about": { en: "About DYSIGNS", nl: "Over DYSIGNS" },
  "faq.group.agreements": { en: "Agreements", nl: "Afspraken" },
  "faq.group.practical": { en: "Practical", nl: "Praktisch" },
  "faq.chat.aiTitle": { en: "Try it: ask our AI assistant", nl: "Probeer het: vraag het onze AI-assistent" },
  "faq.chat.aiSubtitle": { en: "A live example of what we build for clients, answering from this site's own content.", nl: "Een live voorbeeld van wat we voor klanten bouwen, met antwoorden uit de eigen content van deze site." },
  "agent.name": { en: "DYSIGNS agent", nl: "DYSIGNS agent" },
  "agent.ask": { en: "Ask us anything", nl: "Stel gerust je vraag" },
  "agent.morning": { en: "Good morning", nl: "Goedemorgen" },
  "agent.afternoon": { en: "Good afternoon", nl: "Goedemiddag" },
  "agent.evening": { en: "Good evening", nl: "Goedenavond" },
  "agent.askAnything": { en: "ASK ME ANYTHING", nl: "VRAAG ME ALLES" },
  "agent.question": { en: "Got a question?", nl: "Heb je een vraag?" },
  "agent.sceneHint": { en: "Ask about our services, pricing, way of working or a project of your own.", nl: "Vraag naar onze diensten, prijzen, werkwijze of je eigen project." },
  "agent.open": { en: "Open the DYSIGNS agent and ask a question", nl: "Open de DYSIGNS agent en stel een vraag" },
  "faq.chat.spaceTitle": { en: "Space agent", nl: "Space agent" },
  "faq.chat.spaceSubtitle": { en: "Ask me anything about DYSIGNS, our work and pricing.", nl: "Vraag me alles over DYSIGNS, ons werk en onze prijzen." },
  "faq.chat.label": { en: "Your question", nl: "Je vraag" },
  "faq.chat.placeholderShort": { en: "Ask our AI", nl: "Vraag het aan onze AI" },
  "faq.chat.placeholderCompact": { en: "Rather not read it all? Ask our AI", nl: "Geen zin om te lezen? Vraag het aan onze AI" },
  "faq.chat.placeholder": { en: "Type your question...", nl: "Typ je vraag..." },
  "faq.chat.send": { en: "Send question", nl: "Vraag versturen" },
  "faq.chat.thinking": { en: "Thinking...", nl: "Even nadenken..." },
  "faq.chat.helpful": { en: "This answer helped", nl: "Dit antwoord hielp" },
  "faq.chat.notHelpful": { en: "This answer did not help", nl: "Dit antwoord hielp niet" },
  "faq.chat.thanks": { en: "Thanks for the feedback", nl: "Bedankt voor je feedback" },
  "faq.chat.readMore": { en: "Read more:", nl: "Lees meer:" },
  "faq.chat.limit": { en: "Want to know more? We are happy to talk it through.", nl: "Meer weten? We bespreken het graag persoonlijk." },
  "faq.chat.contact": { en: "Get in touch", nl: "Neem contact op" },
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
  "zoom.start": { en: "Selected work", nl: "Geselecteerd werk" },
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
  "lead.nameLabel": { en: "Your name", nl: "Jouw naam" },
  "lead.emailLabel": { en: "Your email address", nl: "Jouw e-mailadres" },
  "lead.ideaLabel": { en: "Describe your project in a few words", nl: "Beschrijf je project in een paar woorden" },
  "lead.sending": { en: "On its way...", nl: "Onderweg..." },
  "lead.sendError": {
    en: "That did not work. Try again, or send us a WhatsApp.",
    nl: "Dat lukte niet. Probeer het nog een keer, of stuur ons een appje.",
  },
  "lead.next": { en: "Okay, next", nl: "Oké, volgende" },
  "lead.back": { en: "Back", nl: "Terug" },
  "contact.sendWhatsapp": { en: "Send me a WhatsApp!", nl: "Stuur een WhatsApp!" },
  "contact.nap.emailLabel": { en: "Email", nl: "E-mail" },
  "contact.nap.phoneLabel": { en: "Phone / WhatsApp", nl: "Telefoon / WhatsApp" },
  "contact.nap.location": {
    en: "Almere, Netherlands",
    nl: "Almere, Nederland",
  },

  /* ── Thank You Page ── */
  "thankyou.label": { en: "Message sent", nl: "Bericht verstuurd" },
  "thankyou.headline": { en: "Thanks, got it.", nl: "Bedankt, binnen." },
  "thankyou.sub": {
    en: "Your message is on its way to us. We reply within one business day (usually faster).",
    nl: "Je bericht is onderweg naar ons. We reageren binnen één werkdag (meestal sneller).",
  },
  "thankyou.backHome": { en: "Back to home", nl: "Terug naar home" },
  "thankyou.seeWork": { en: "See our work", nl: "Bekijk ons werk" },

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
  "work.title": { en: "Selected work", nl: "Geselecteerd werk" },
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
  "case.can360": { en: "Drag or scroll to turn the can, or use the arrow keys", nl: "Sleep of scroll om het blik te draaien, of gebruik de pijltjestoetsen" },
  "case.can360Flavour": { en: "Choose a flavour", nl: "Kies een smaak" },
  "case.can360Hint": { en: "Drag or scroll", nl: "Sleep of scroll" },
  "case.can360Label": { en: "Flavour", nl: "Smaak" },
  "case.galleryLink": { en: "Opens the download page in a new tab", nl: "Opent de downloadpagina in een nieuw tabblad" },
  "case.previous": { en: "Previous", nl: "Vorige" },
  "case.next": { en: "Next", nl: "Volgende" },
  "case.notFound": { en: "Project not found", nl: "Project niet gevonden" },
  "case.visit": { en: "VISIT", nl: "BEZOEK" },
  "case.download": { en: "DOWNLOAD", nl: "DOWNLOAD" },
  "case.downloadApp": { en: "Download the app", nl: "Download de app" },
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
    en: "The website they designed didn\u2019t just look incredible. It transformed how our customers experience our brand.",
    nl: "De website die zij ontwierpen zag er niet alleen ongelooflijk uit. Het transformeerde hoe onze klanten ons merk ervaren.",
  },
  "testimonial.t5.quote": {
    en: "A refreshing and imaginative team that consistently delivers exceptional results. Highly recommended for any project.",
    nl: "Een verfrissend en creatief team dat consequent uitzonderlijke resultaten levert. Sterk aanbevolen voor elk project.",
  },
  "testimonial.t6.quote": {
    en: "Their artistic flair and strategic approach resulted in remarkable outcomes: a reliable creative partner we trust completely.",
    nl: "Hun artistieke flair en strategische aanpak resulteerden in opmerkelijke resultaten: een betrouwbare creatieve partner die we volledig vertrouwen.",
  },
  "testimonial.t7.quote": {
    en: "From concept to execution, their creativity knows no bounds. A game-changer for our brand\u2019s digital presence.",
    nl: "Van concept tot uitvoering kent hun creativiteit geen grenzen. Een gamechanger voor de digitale aanwezigheid van ons merk.",
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





  /* ── Project: Sfumato Agency ── */
  "project.sfumato-agency.title": {
    en: "Sfumato Agency",
    nl: "Sfumato Agency",
  },
  "project.sfumato-agency.seoTitle": {
    en: "Sfumato Agency: Content Vision & Web Design | DYSIGNS",
    nl: "Sfumato Agency: contentvisie en webdesign | DYSIGNS",
  },
  "project.sfumato-agency.seoDescription": {
    en: "Together with Sfumato Agency we defined their content vision for video and photography and turned their Leonardo-inspired style into a web design.",
    nl: "Samen met Sfumato Agency bepaalden we hun contentvisie voor video en fotografie en maakten we van hun Leonardo-stijl een webdesign.",
  },
  "project.sfumato-agency.overview": {
    en: "Together with Sfumato Agency we defined their content vision for video and photography, and turned their own Italian style, inspired by Leonardo da Vinci, into a web design. Sfumato comes from the Italian fumo, smoke: Leonardo's way of letting tones melt into one another without a hard line. That idea became the rulebook for everything they make, from light graded towards amber to slow reveals, long takes and frames with room to breathe. We captured it in a moodboard with its own palette, from pergamena to inchiostro, a type system of Bodoni and handwriting, and three principles: no hard lines, golden light and con calma. The website follows the same rules. Their work lies on parchment like sepia prints with a cream edge, every case opens on the film or photo first, and small details from Leonardo's notebooks, such as mirror writing and hand-drawn rulers, give it a signature without getting in the way. The result is a portfolio that feels like Sfumato's own work: calm, warm and a little mysterious.",
    nl: "Samen met Sfumato Agency bepaalden we hun contentvisie voor video en fotografie, en vertaalden we hun eigen Italiaanse stijl, geïnspireerd op Leonardo da Vinci, naar een webdesign. Sfumato komt van het Italiaanse fumo, rook: Leonardo's manier om tonen in elkaar te laten overlopen zonder harde lijn. Dat idee werd het uitgangspunt voor alles wat ze maken, van licht dat naar amber is gegradeerd tot rustige onthullingen, lange shots en beelden met ruimte om te ademen. We legden het vast in een moodboard met een eigen kleurenpalet, van pergamena tot inchiostro, een typografisch systeem met Bodoni en handschrift, en drie principes: geen harde lijnen, gouden licht en con calma. De website volgt dezelfde regels. Hun werk ligt op perkament als sepia afdrukken met een crème rand, elke case opent eerst op de film of foto, en kleine details uit Leonardo's notitieboeken, zoals spiegelschrift en getekende meetlatten, geven het een signatuur zonder in de weg te zitten. Het resultaat is een portfolio dat voelt als het werk van Sfumato zelf: rustig, warm en een tikje mysterieus.",
  },
  "project.sfumato-agency.alt.cover": {
    en: "Sfumato Agency website home page: SFUMATO AGENCY in Bodoni with a handwritten tagline, surrounded by sepia photo prints on parchment",
    nl: "Homepage van de Sfumato Agency-website: SFUMATO AGENCY in Bodoni met een handgeschreven tagline, omringd door sepia fotoafdrukken op perkament",
  },
  "project.sfumato-agency.alt.0": {
    en: "Sfumato Agency moodboard Leonardo and the soft edge, with the colour palette from pergamena to inchiostro, the type system and a Leonardo quote, laid out as sheets on a dark desk",
    nl: "Moodboard van Sfumato Agency, Leonardo and the soft edge, met het kleurenpalet van pergamena tot inchiostro, het typografisch systeem en een citaat van Leonardo, als vellen op een donkere tafel",
  },
  "project.sfumato-agency.alt.1": {
    en: "Sfumato Agency moodboard section Atmosfera with photo prints from their shoots next to Leonardo studies of the Vitruvian man, smoke and golden proportion",
    nl: "Moodboardsectie Atmosfera van Sfumato Agency met fotoafdrukken van hun shoots naast Leonardo-studies van de Vitruviusman, rook en de gulden snede",
  },
  "project.sfumato-agency.alt.2": {
    en: "Sfumato Agency principles no hard lines, golden light and con calma, above the website menu with the agency introduction",
    nl: "De principes van Sfumato Agency, geen harde lijnen, gouden licht en con calma, boven het websitemenu met de introductie van het bureau",
  },
  "project.sfumato-agency.alt.3": {
    en: "Sfumato Agency web design on two desktop screens: the home page with scattered prints and a case page opening on a photo",
    nl: "Webdesign van Sfumato Agency op twee desktopschermen: de homepage met verspreide afdrukken en een casepagina die opent op een foto",
  },
  "project.sfumato-agency.alt.4": {
    en: "Sfumato Agency Selected work page with six cases shown as numbered sepia prints in Roman numerals",
    nl: "De pagina Selected work van Sfumato Agency met zes cases als genummerde sepia afdrukken met Romeinse cijfers",
  },
  "project.sfumato-agency.alt.5": {
    en: "Sfumato Agency case page with title, client details and a large photo, next to a Cartier print",
    nl: "Casepagina van Sfumato Agency met titel, klantgegevens en een grote foto, naast een Cartier-afdruk",
  },
  "project.sfumato-agency.alt.6": {
    en: "Sfumato Agency website on three phones: the menu, the home page with prints and a case page with mirror writing",
    nl: "De Sfumato Agency-website op drie telefoons: het menu, de homepage met afdrukken en een casepagina met spiegelschrift",
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
    en: "We designed and built the STËLZ app for iOS and Android, from first sketch to #1 in the App Store, starting with a nationwide flavour vote.",
    nl: "Wij ontwierpen en bouwden de STËLZ app voor iOS en Android, van eerste schets tot nummer 1 in de App Store, met als start een landelijke smaakverkiezing.",
  },
  "project.stelz-app.overview": {
    en: "STËLZ asked us to design and build their own app for Strijd voor je smaak 2026, a campaign in three phases.\n\nPhase 1 started on Instagram: through a voting flow, 125,000 people cast their vote, and six flavours came out of it.\n\nPhase 2: those six flavours were sold exclusively at Albert Heijn, the Dutch supermarket, and in the STËLZ app, which we designed and built from the first sketch to the App Store and Google Play.\n\nPhase 3: in the app, fans pick their favourite, and the maker of the winning flavour takes home \u20ac50,000. Every vote counts exactly once: it is confirmed with an email code and checked on the server, and the result stays hidden until the campaign closes.\n\nVoting should feel like a moment, so motion sits at the heart of the design: cans you swipe through, springy feedback on every tap and a thank-you screen that celebrates your choice. One codebase runs on both iOS and Android.\n\nThroughout the campaign we supported STËLZ with design, development and motion under one roof, with a milestone along the way: #1 in the App Store.",
    nl: "STËLZ vroeg ons om hun eigen app te ontwerpen en te bouwen voor Strijd voor je smaak 2026, een campagne in drie fases.\n\nFase 1 begon op Instagram: via een stemflow brachten 125.000 mensen hun stem uit, en daaruit kwamen zes smaken.\n\nFase 2: die zes smaken waren exclusief te koop bij Albert Heijn en in de STËLZ app, die wij ontwierpen en bouwden van de eerste schets tot in de App Store en Google Play.\n\nFase 3: in de app kiezen fans hun favoriet, en de maker van de winnende smaak wint \u20ac50.000. Elke stem telt precies één keer: hij wordt bevestigd met een e-mailcode en op de server gecontroleerd, en de uitslag blijft verborgen tot de campagne sluit.\n\nStemmen moet voelen als een moment, daarom staat beweging centraal in het ontwerp: blikjes waar je doorheen swipet, verende feedback bij elke tik en een bedankscherm dat je keuze viert. Eén codebase draait op zowel iOS als Android.\n\nTijdens de hele campagne ondersteunden we STËLZ met design, development en motion onder één dak, met onderweg een mijlpaal: nummer 1 in de App Store.",
  },
  "project.stelz-app.alt.cover": {
    en: "STËLZ app case by DYSIGNS",
    nl: "STËLZ app case door DYSIGNS",
  },
  "project.stelz-app.alt.0": {
    en: "The 3D STËLZ can to turn yourself: drag or scroll to spin it and pick one of the six flavours, from Rum Cola to Spicy Pineapple, with its name and drink style",
    nl: "Het 3D-blik van STËLZ om zelf rond te draaien: sleep of scroll om het te draaien en kies een van de zes smaken, van Rum Cola tot Spicy Pineapple, met naam en soort drank",
  },
  "project.stelz-app.alt.1": {
    en: "The six flavour screens of the STËLZ app as they look today: Rum Cola, Watermelon Mint, Cherry, Yuzu, Elderflower and Spicy Pineapple, each with its own gradient, 3D can and fruit",
    nl: "De zes smaakschermen van de STËLZ app zoals ze nu zijn: Rum Cola, Watermelon Mint, Cherry, Yuzu, Elderflower en Spicy Pineapple, elk met eigen kleurverloop, 3D-blik en fruit",
  },
  "project.stelz-app.alt.2": {
    en: "The STËLZ app design system: a gradient per flavour with hex codes, the brand colours, Plantin and Helsinki type and the real components such as the vote button and swipe to confirm",
    nl: "Het design system van de STËLZ app: een kleurverloop per smaak met hexcodes, de merkkleuren, de letters Plantin en Helsinki en de echte componenten zoals de stemknop en swipe om te bevestigen",
  },
  "project.stelz-app.alt.3": {
    en: "The STËLZ app voting flow in three steps: choose Cherry, swipe to confirm your single vote and confirm it with your email",
    nl: "De stemflow van de STËLZ app in drie stappen: Cherry kiezen, je ene stem bevestigen met een swipe en bevestigen met je e-mail",
  },
  "project.stelz-app.alt.4": {
    en: "The STËLZ app process from design to code to store release: frames in Figma, the flavour code in the editor and the App Store listing at #1",
    nl: "Het proces van de STËLZ app van design naar code naar store release: frames in Figma, de smaakcode in de editor en de App Store-vermelding op nummer 1",
  },
  "project.stelz-app.alt.5": {
    en: "STËLZ app screens after voting: the Jij zit in team Cherry countdown, the share card for your story and the screen to tell what you thought of the flavour",
    nl: "Schermen in de STËLZ app na het stemmen: het aftellen in Jij zit in team Cherry, de deelkaart voor je story en het scherm om te vertellen wat je van de smaak vond",
  },
  "project.stelz-app.alt.6": {
    en: "The STËLZ app reached #1 in the App Store: the app icon, App Store and Google Play badges and the five store screenshots",
    nl: "De STËLZ app werd nummer 1 in de App Store: het app-icoon, de badges van de App Store en Google Play en de vijf store-screenshots",
  },
  "project.stelz-app.outcome.0": {
    en: "Reached #1 in the App Store",
    nl: "Nummer 1 in de App Store",
  },
  "project.stelz-app.outcome.1": {
    en: "Live on iOS and Android from one codebase",
    nl: "Live op iOS en Android vanuit één codebase",
  },



  /* ── Project: STËLZ Web Design ── */
  "project.stelz-web-design.title": {
    en: "STËLZ Web Design",
    nl: "STËLZ Web Design",
  },
  "project.stelz-web-design.seoTitle": {
    en: "STËLZ Webshop & Website Design on Shopify | DYSIGNS",
    nl: "STËLZ webshop en website design op Shopify | DYSIGNS",
  },
  "project.stelz-web-design.seoDescription": {
    en: "How we rebuilt the STËLZ Shopify store so the team runs its own campaigns, with in-house apps, a better mobile flow and revenue almost five times higher.",
    nl: "Hoe we de Shopify-webshop van STËLZ herbouwden: het team beheert zelf campagnes, met eigen apps, een betere mobiele flow en bijna vijf keer zoveel omzet.",
  },
  "project.stelz-web-design.overview": {
    en: "The challenge\n\nSTËLZ already sold on Shopify at drinkstelz.com, but every change to the store needed a developer. For a brand that runs campaigns all the time, that was the bottleneck: new heroes, promotions and products could not go live as fast as the team needed. And on mobile, where 80% of visitors shop, the store was not built to convert.\n\nOur approach\n\nWe rebuilt the theme so the STËLZ team runs it themselves. Campaign pages and heroes are built in Instant, the visual page builder they asked for, so a new promotion goes live in minutes. Shopify covers a lot out of the box, but every growing store runs into its limits sooner or later. Rather than stacking paid third-party apps to work around them, we build that functionality ourselves, so the store does exactly what STËLZ needs, and STËLZ owns it without extra subscriptions.\n\nWhat we built\n\nA category page built from scratch, with filters and a quick add-to-cart button. A mobile experience with a sticky add-to-cart button and upsells. In-house apps for free gifts with a purchase, upsells and bundles, and the deposit on every can. Minimum and maximum order quantities, checked on the server at checkout, so they always hold. And the Belgian market, launched through Shopify Markets on its own domain, drinkstelz.be, in line with EU rules and accessibility requirements.\n\nThe redesign went live in the middle of a campaign and took €300,000 in revenue right away. We still maintain and develop the store together with the STËLZ team, and support every campaign they run, from Strijd voor jouw smaak 2026 and a carnival collab to Amsterdam Dance Event and new and exclusive flavour launches.",
    nl: "De uitdaging\n\nSTËLZ verkocht al via Shopify op drinkstelz.com, maar voor elke aanpassing aan de webshop was een developer nodig. Voor een merk dat continu campagnes draait was dat de rem: nieuwe heroes, acties en producten konden niet zo snel live als het team wilde. En op mobiel, waar 80% van de bezoekers winkelt, was de shop niet gebouwd om te converteren.\n\nOnze aanpak\n\nWe bouwden het thema zo om dat het STËLZ-team de webshop zelf beheert. Campagnepagina’s en heroes maken ze in Instant, de visuele pagebuilder waar ze om vroegen, zodat een nieuwe actie binnen een paar minuten live staat. Shopify kan veel standaard, maar elke groeiende webshop loopt vroeg of laat tegen grenzen aan. In plaats van betaalde apps van derden op elkaar te stapelen om daaromheen te werken, bouwen wij die functies zelf. Zo doet de webshop precies wat STËLZ nodig heeft, en is het van STËLZ zelf, zonder extra abonnementen.\n\nWat we bouwden\n\nEen categoriepagina vanaf nul gebouwd, met filters en een snelle add-to-cart-knop. Een mobiele ervaring met een sticky add-to-cart-knop en upsells. Eigen apps voor een gratis cadeau bij aankoop, upsells en bundels, en het statiegeld op elk blikje. Een minimaal en maximaal bestelaantal, gecontroleerd op de server bij het afrekenen, zodat het altijd klopt. En de Belgische markt, gelanceerd via Shopify Markets op een eigen domein, drinkstelz.be, volgens de Europese regels en eisen voor toegankelijkheid.\n\nDe redesign ging live midden in een campagne en haalde direct €300.000 omzet. We onderhouden en ontwikkelen de webshop nog steeds samen met het STËLZ-team, en ondersteunen elke campagne die ze draaien, van Strijd voor jouw smaak 2026 en een carnavalscollab tot Amsterdam Dance Event en nieuwe en exclusieve smaaklanceringen.",
  },
  "project.stelz-web-design.outcome.0": {
    en: "Revenue almost five times higher than last year",
    nl: "Bijna vijf keer zoveel omzet als vorig jaar",
  },
  "project.stelz-web-design.outcome.1": {
    en: "€300,000 in revenue during the launch campaign",
    nl: "€300.000 omzet tijdens de campagne waarin we live gingen",
  },
  "project.stelz-web-design.outcome.2": {
    en: "4,000+ orders in three days",
    nl: "4.000+ bestellingen in drie dagen",
  },
  "project.stelz-web-design.outcome.3": {
    en: "19,000+ visitors and 27,000+ sessions",
    nl: "19.000+ bezoekers en 27.000+ sessies",
  },
  "project.stelz-web-design.outcome.4": {
    en: "4,200+ unique customers and 19%+ returning",
    nl: "4.200+ unieke klanten en 19%+ terugkerend",
  },
  "project.stelz-web-design.outcome.5": {
    en: "Higher mobile conversion, where 80% of visitors shop",
    nl: "Hogere mobiele conversie, waar 80% van de bezoekers winkelt",
  },
  "project.stelz-web-design.outcome.6": {
    en: "Campaigns and heroes live in minutes, edited by the STËLZ team itself",
    nl: "Campagnes en heroes binnen minuten live, door het STËLZ-team zelf",
  },
  "project.stelz-web-design.outcome.7": {
    en: "In-house apps instead of paid app subscriptions",
    nl: "Eigen apps in plaats van betaalde app-abonnementen",
  },
  "project.stelz-web-design.outcome.8": {
    en: "Belgian market live on drinkstelz.be through Shopify Markets",
    nl: "Belgische markt live op drinkstelz.be via Shopify Markets",
  },
  "project.stelz-web-design.alt.cover": {
    en: "Two phones showing the STËLZ Shopify webshop on mobile",
    nl: "Twee telefoons met de STËLZ Shopify-webshop op mobiel",
  },
  "project.stelz-web-design.alt.0": {
    en: "Before and after: the old STËLZ Mix Pack product page next to the new Hard Seltzer Apple page, with flavour icons, a 12 or 24 pack choice and one add-to-cart button",
    nl: "Voor en na: de oude Mix Pack-productpagina van STËLZ naast de nieuwe pagina van Hard Seltzer Apple, met smaakiconen, keuze tussen 12-pack en 24-pack en één toevoegknop",
  },
  "project.stelz-web-design.alt.1": {
    en: "A MacBook and an iPhone showing the drinkstelz.com home page with the ADE campaign hero for Hard Iced Tea Peach Mate, on a blurred photo; next to it two hands toasting with STËLZ iced tea cans against a blue sky, with the STËLZ logo and floating cans",
    nl: "Een MacBook en een iPhone met de homepage van drinkstelz.com en de ADE-campagnehero voor Hard Iced Tea Peach Mate, op een onscherpe foto; ernaast twee handen die proosten met STËLZ iced tea-blikjes tegen een blauwe lucht, met het STËLZ-logo en zwevende blikjes",
  },
  "project.stelz-web-design.alt.3": {
    en: "The STËLZ shop page in a browser: category tiles, filter buttons and the first row of products with reviews, prices and add-to-cart buttons",
    nl: "De shoppagina van STËLZ in een browser: categorietegels, filterknoppen en de eerste rij producten met reviews, prijzen en toevoegknoppen",
  },
  "project.stelz-web-design.alt.2": {
    en: "Three STËLZ mobile screens next to the line Built for the thumb: the carnival campaign home page, the Hard Seltzer Apple product page and the collection with filters",
    nl: "Drie mobiele schermen van STËLZ naast de zin Built for the thumb: de homepage met de carnavalscampagne, de productpagina van Hard Seltzer Apple en de collectie met filters",
  },
  "project.stelz-web-design.alt.4": {
    en: "The STËLZ cart drawer with three trays, a progress bar towards free shipping, a new product to try and a checkout button",
    nl: "De cart drawer van STËLZ met drie trays, een voortgangsbalk naar gratis verzending, een nieuw product om te proberen en een afrekenknop",
  },
  "project.stelz-web-design.alt.5": {
    en: "A MacBook and an iPhone showing the STËLZ shop on desktop and mobile in a dark blue studio, with Raspberry, Apple and Lemon cans on a glossy floor and the STËLZ logo",
    nl: "Een MacBook en een iPhone met de STËLZ-shop op desktop en mobiel in een donkerblauwe studio, met blikjes Raspberry, Apple en Lemon op een glanzende vloer en het STËLZ-logo",
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
    en: "The Challenge\n\nFor enforcement officers and other field workers in the VTH sector (Vergunning, Toezicht en Handhaving), the real work happens on the street. Yet these government professionals were using an outdated app that made case management in the field unnecessarily slow and cumbersome. There was an urgent need for a fast, reliable system that supported their work rather than slowing it down.\n\nThe Solution\n\nTo tackle this, I designed and developed PowerMobile entirely from scratch. As lead for both design and technical development, I built a modern, case-oriented system that makes permit and case management directly accessible in the field. The app features an intuitive interface for managing cases, consulting interactive maps, and tracking workflows, fully responsive across all devices.\n\nThe Result\n\nEvery part of PowerMobile was shaped around the day-to-day realities of government professionals. The impact was immediate: user satisfaction rose from 15% with the old system to over 40% with the new app.",
    nl: "De Uitdaging\n\nVoor handhavers en andere buitendienstmedewerkers in de VTH-sector (Vergunning, Toezicht en Handhaving) gebeurt het echte werk op straat. Toch werkten deze overheidsprofessionals met een verouderde app, waardoor het beheren van zaken in de praktijk onnodig traag en omslachtig was. Er was dringend behoefte aan een snel en betrouwbaar systeem dat het werk in het veld ondersteunde in plaats van vertraagde.\n\nDe Oplossing\n\nOm dit probleem aan te pakken, heb ik PowerMobile volledig van scratch af aan ontworpen en ontwikkeld. Als lead voor zowel het design als de technische realisatie, heb ik een modern, zaakgericht systeem neergezet dat vergunningen en zaakbeheer direct toegankelijk maakt in het veld. De app heeft een intuïtieve interface voor het beheren van zaken, het raadplegen van interactieve kaarten en het volgen van workflows. Bovendien is de applicatie volledig responsive gebouwd, zodat deze soepel werkt op ieder apparaat.\n\nHet Resultaat\n\nElk onderdeel van PowerMobile is ontworpen vanuit de dagelijkse praktijk en de specifieke behoeften van medewerkers bij overheidsinstanties. Dit heeft geleid tot een efficiënter werkproces en een veel prettigere gebruikerservaring op straat. Uit de enquête na de lancering bleek de impact direct: de gebruikerstevredenheid steeg van 15% bij het oude systeem naar ruim 40% voor de nieuwe app.",
  },
  "project.powermobile.outcome.0": {
    en: "User satisfaction increased from 15% to 40% post-launch",
    nl: "Gebruikerstevredenheid steeg van 15% naar 40% na lancering",
  },
  "project.powermobile.outcome.1": {
    en: "Full app built from scratch, from design through development",
    nl: "Volledige app from scratch gebouwd, van ontwerp tot ontwikkeling",
  },
  "project.powermobile.outcome.2": {
    en: "Interactive map integration for real-time field case management",
    nl: "Interactieve kaartintegratie voor zaakbeheer in de buitendienst",
  },
  "project.powermobile.outcome.3": {
    en: "Adopted across multiple government institutions in the VTH sector",
    nl: "In gebruik bij meerdere overheidsinstellingen in de VTH-sector",
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
    en: "Studio75 poster: the white asterisk logo and wordmark over streaks of orange liquid glass and blue light flowing from a woman's profile, between the lines More impact, and Less friction.",
    nl: "Studio75-poster: het witte sterretjeslogo en woordmerk over strepen oranje vloeibaar glas en blauw licht die uit het profiel van een vrouw stromen, tussen de regels More impact, en Less friction.",
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
    en: "Studio75 logo in white behind fluted glass, with a blurred figure in soft grey and warm orange light",
    nl: "Studio75-logo in wit achter geribbeld glas, met een wazige figuur in zacht grijs en warm oranje licht",
  },
  "project.studio75-branding.alt.3": {
    en: "Studio75 brand identity on print, business cards with a black front and an off-white back with orange edges, showing the asterisk logo, contact details and the line More impact, less friction",
    nl: "Studio75 huisstijl op drukwerk, visitekaartjes met een zwarte voorkant en een gebroken witte achterkant met oranje randen, met het sterretjeslogo, contactgegevens en de tekst More impact, less friction",
  },
  "project.studio75-branding.alt.4": {
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
    en: "We migrated Merely Made, the Seoul fashion brand sold in 32 stores worldwide, from SixShop to Shopify, and designed and built the new webshop.",
    nl: "Wij migreerden Merely Made, het modemerk uit Seoul in 32 winkels wereldwijd, van SixShop naar Shopify en ontwierpen en bouwden de nieuwe webshop.",
  },
  "project.merely-made-webshop.overview": {
    en: "The challenge\n\nMerely Made is a fashion brand from Seoul, sold in 32 stores worldwide, from Printemps in Paris and End Clothing in London to Tokyo and California. Its webshop ran on SixShop, a Korean platform that left little room to grow: changes were hard to make, and the store was hard to edit without technical help. Merely Made needed a store with the same calm feeling as the clothes, one its own team could run.\n\nOur approach\n\nWe migrated the complete store, back office included, from SixShop to Shopify, and designed and developed the new storefront together with Merely Made's own teams in France and in Seoul. We started from the identity that was already there and made negative space the main design tool, so the clothes and photography lead and the interface stays out of the way.\n\nWhat we built\n\nA custom Shopify store with a home page, lookbook, shop, product pages and a stockist page that lists all 32 stores by region. Every part is built as sections with settings, so people without a technical background can change images, text and collections themselves. Prices show in US dollars or Korean won, and the store ships worldwide from Seoul. The old site stayed online until the switch, and old URLs still lead to the right pages.",
    nl: "De uitdaging\n\nMerely Made is een modemerk uit Seoul dat in 32 winkels wereldwijd ligt, van Printemps in Parijs en End Clothing in Londen tot Tokio en Californië. De webshop draaide op SixShop, een Koreaans platform met weinig ruimte om te groeien: aanpassingen waren lastig, en zonder technische hulp kon het team de shop nauwelijks bewerken. Merely Made zocht een webshop met hetzelfde rustige gevoel als de kleding, die het eigen team zelf kan beheren.\n\nOnze aanpak\n\nWe migreerden de complete webshop, inclusief de back-office, van SixShop naar Shopify, en ontwierpen en ontwikkelden de nieuwe webshop samen met de eigen teams van Merely Made in Frankrijk en Seoul. We begonnen bij de identiteit die er al stond en maakten negatieve ruimte het belangrijkste ontwerpmiddel, zodat de kleding en fotografie voorop staan en de interface op de achtergrond blijft.\n\nWat we bouwden\n\nEen maatwerk Shopify-webshop met homepage, lookbook, shop, productpagina’s en een stockist-pagina met alle 32 winkels per regio. Alles is opgebouwd uit secties met instellingen, zodat mensen zonder technische achtergrond zelf afbeeldingen, teksten en collecties kunnen aanpassen. Prijzen staan in Amerikaanse dollars of Koreaanse won, en de shop verzendt wereldwijd vanuit Seoul. De oude site bleef online tot de overstap, en oude URL’s leiden nog steeds naar de juiste pagina’s.",
  },
  "project.merely-made-webshop.outcome.0": {
    en: "Complete store and back office migrated from SixShop to Shopify",
    nl: "Complete webshop en back-office gemigreerd van SixShop naar Shopify",
  },
  "project.merely-made-webshop.outcome.1": {
    en: "Designed, built and live in one month",
    nl: "Ontworpen, gebouwd en live in één maand",
  },
  "project.merely-made-webshop.outcome.2": {
    en: "No downtime: the old store stayed online until the switch",
    nl: "Geen downtime: de oude shop bleef online tot de overstap",
  },
  "project.merely-made-webshop.outcome.3": {
    en: "Old URLs still work, so existing links keep leading to the right page",
    nl: "Oude URL’s werken nog, dus bestaande links leiden naar de juiste pagina",
  },
  "project.merely-made-webshop.outcome.4": {
    en: "The team edits the store itself, without a developer, through sections and settings",
    nl: "Het team past de shop zelf aan, zonder developer, via secties en instellingen",
  },
  "project.merely-made-webshop.outcome.5": {
    en: "One store selling worldwide, in US dollars and Korean won",
    nl: "Eén webshop die wereldwijd verkoopt, in dollars en won",
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
  /* ── Project: BIYU ── */
  "project.biyu.title": {
    en: "BIYU",
    nl: "BIYU",
  },
  "project.biyu.seoTitle": {
    en: "BIYU Rental Platform: App, Website & Dashboard | DYSIGNS",
    nl: "BIYU verhuurplatform: app, website & dashboard | DYSIGNS",
  },
  "project.biyu.seoDescription": {
    en: "How I helped build the app, website and dashboard for BIYU, the Amsterdam rental platform where you rent a drill instead of buying one.",
    nl: "Hoe ik bij BIYU in Amsterdam meebouwde aan de app, website en het dashboard van een verhuurplatform: een boormachine huren in plaats van kopen.",
  },
  "project.biyu.overview": {
    en: "In 2022 BIYU had an office on the Overtoom in Amsterdam, and that's where you'd find me most days. The idea was refreshingly down to earth: why buy a drill you use twice a year? At BIYU you just rented one, along with carpet cleaners, DJ sets or a poffertjes maker, often delivered to your door the same day. Do more. Own less.\n\nI mostly worked on the digital side. On the app, where you find a product, pick your rental period and see when it arrives. On the website, with every category from DIY to kitchen. And on the dashboard behind the scenes, where the team kept track of orders, stock and deliveries. The partner portal, where other businesses could rent out their own gear through BIYU, got the same purple and hexagons as the rest of the brand.\n\nA rental company in the city leaves little room for hassle: if someone booked a pressure washer for Saturday, it had better be there. That's what the screens were for.\n\nAnd look where they are now. After five years of running their own rentals, with their own warehouses and delivery, BIYU now builds the software other brands use to run rental, subscriptions and resale. Homie and Reflower are among those running on it. From an office on the Overtoom to the engine behind other brands. Nice to see.",
    nl: "In 2022 had BIYU een kantoor aan de Overtoom in Amsterdam, en daar zat ik de meeste dagen. Het idee was lekker nuchter: waarom koop je een boormachine die je twee keer per jaar gebruikt? Bij BIYU huurde je ’m gewoon, net als een tapijtreiniger, een DJ-set of een poffertjesmachine, en vaak stond hij dezelfde dag nog bij je voor de deur. Do more. Own less.\n\nIk hielp vooral aan de digitale kant. Aan de app, waarin je een product vindt, je huurperiode kiest en ziet wanneer het komt. Aan de website, met alle categorieën van doe-het-zelf tot keuken. En aan het dashboard achter de schermen, waar het team bestellingen, voorraad en bezorgingen bijhield. Ook de partnerportal, waar andere bedrijven hun eigen spullen via BIYU konden verhuren, kreeg het paars en de zeshoeken van het merk.\n\nEen verhuurbedrijf in de stad laat weinig ruimte voor gedoe: als iemand voor zaterdag een hogedrukreiniger heeft geboekt, moet die er ook echt zijn. Daar waren de schermen voor.\n\nEn kijk waar ze nu staan. Na vijf jaar zelf verhuren, met eigen magazijnen en bezorging, maakt BIYU nu de software waarmee andere merken verhuur, abonnementen en tweedehands regelen. Onder meer Homie en Reflower draaien erop. Van een kantoor aan de Overtoom naar het systeem achter andere merken. Mooi om te zien.",
  },
  "project.biyu.alt.cover": {
    en: "BIYU rental website on an iPad: the home page with the headline Rent the best products from the best brands, a search bar and categories such as drills, DJ sets and kitchen machines on a purple background",
    nl: "BIYU-verhuurwebsite op een iPad: de homepage met de kop Huur de beste producten van de beste merken, een zoekbalk en categorieën als boormachines, DJ-sets en keukenmachines op een paarse achtergrond",
  },
  "project.biyu.alt.0": {
    en: "BIYU rental app on an iPhone: product page for a Festool cordless plunge saw with rental prices per day, three days and a week, and a note that delivery is possible today",
    nl: "BIYU-verhuurapp op een iPhone: productpagina van een Festool accu-invalcirkelzaag met huurprijzen per dag, drie dagen en een week, en de melding dat bezorging vandaag mogelijk is",
  },
  "project.biyu.alt.1": {
    en: "BIYU partner portal welcome screen with register and log in buttons, surrounded by hexagons holding tools such as a pressure washer, a vacuum cleaner and a drill",
    nl: "Welkomstscherm van de BIYU-partnerportal met knoppen om te registreren en in te loggen, omringd door zeshoeken met gereedschap zoals een hogedrukreiniger, een stofzuiger en een boormachine",
  },
  "project.biyu.alt.2": {
    en: "BIYU campaign poster in an Amsterdam bus shelter, Jouw balkon borrelklaar, with a woman holding a pressure washer that rents for 9 euros",
    nl: "BIYU-campagneposter in een Amsterdamse abri, Jouw balkon borrelklaar, met een vrouw die een hogedrukreiniger vasthoudt die je voor 9 euro huurt",
  },
  /* ── Shared alt text, aria-labels and small UI strings ── */
  "alt.logo": { en: "DYSIGNS, digital design agency Almere", nl: "DYSIGNS, digitaal designbureau Almere" },
  "alt.logoNl": { en: "DYSIGNS, digital design agency Almere Netherlands", nl: "DYSIGNS, digitaal designbureau in Almere" },
  "alt.logoHeader": { en: "DYSIGNS, UX/UI and web design agency, Almere Netherlands", nl: "DYSIGNS, UX/UI- en webdesignbureau in Almere" },
  "alt.clientReview": { en: "DYSIGNS client review", nl: "klantreview DYSIGNS" },
  "alt.caseImage": { en: "case study, image", nl: "case, afbeelding" },
  "a11y.skipIntro": { en: "Skip intro", nl: "Intro overslaan" },
  "a11y.openMenu": { en: "Open menu", nl: "Menu openen" },
  "a11y.breadcrumb": { en: "Breadcrumb", nl: "Kruimelpad" },
  "a11y.prevTestimonial": { en: "Previous testimonial", nl: "Vorige review" },
  "a11y.nextTestimonial": { en: "Next testimonial", nl: "Volgende review" },
  "a11y.goToTestimonial": { en: "Go to testimonial", nl: "Ga naar review" },
  "a11y.next": { en: "Next", nl: "Volgende" },
  "footer.about": {
    en: "DYSIGNS is a full-service digital agency based in Almere, Netherlands. Services include UX/UI design, web design, Shopify development, branding, and social media marketing.",
    nl: "DYSIGNS is een full-service digital agency uit Almere. We doen UX/UI-design, webdesign, Shopify development, branding en social media marketing.",
  },
  "about.teamSignature": { en: "The DYSIGNS Team", nl: "Het DYSIGNS-team" },
  "form.honeypot": { en: "Don't fill this out:", nl: "Vul dit niet in:" },
  "afterLaunch.cta": { en: "See how we grow it", nl: "Zo laten we het groeien" },
  "case.service": { en: "Service", nl: "Dienst" },
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

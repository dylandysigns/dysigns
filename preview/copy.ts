/* Texts for the hero concept, taken from the site's own copy
   (src/app/hooks/useLanguage.tsx). The matching key is noted per line.
   When this hero moves into the site, these become t("...") calls. */

export type Lang = "en" | "nl";

export const COPY = {
  en: {
    title: ["Designed", "to grow."], // hero.title
    sub: "DYSIGNS is your creative partner for scaling brands and digital products, from startup to scale-up.", // hero.headline.A
    ticker: [
      "We are available in the Netherlands.", // hero.availableIn + hero.fallbackLocation
      "Your creative partner, from startup to scale-up.", // hero.headline.A
      "No fluff, no filler, just digital work that moves the needle.", // vision.text
    ],
    nav: { work: "Work", about: "About", contact: "Contact" }, // nav.*
    budget: "your budget",
    email: "your email", // contact.form.emailLabel
    budgetLabel: "Your budget in euros",
    emailLabel: "Your email address",
    budgetHint: "Common budgets",
    next: "Okay, next",
    submit: "Send it over", // contact.form.submit
    chat: "Let’s connect", // hero.cta2
    done: ["Thanks,", "got it."], // thankyou.headline
    doneSub: "We reply within one business day.", // thankyou.sub
    sumBudget: "budget",
    sumEmail: "email",
    trusted: "Trusted by", // partners.label
    step1: "Step 1 of 2: your budget.",
    step2: "Step 2 of 2: your email address.",
  },
  nl: {
    title: ["Design dat", "meegroeit."],
    sub: "DYSIGNS is jouw creatieve partner voor merken en digitale producten die willen opschalen, van startup tot scale-up.",
    ticker: [
      "Wij zijn beschikbaar in Nederland.",
      "Jouw creatieve partner, van startup tot scale-up.",
      "Geen poespas, alleen digitaal werk dat het verschil maakt.",
    ],
    nav: { work: "Werk", about: "Over ons", contact: "Contact" },
    budget: "jouw budget",
    email: "jouw e-mail",
    budgetLabel: "Jouw budget in euro's",
    emailLabel: "Jouw e-mailadres",
    budgetHint: "Veelgekozen budgetten",
    next: "Oké, volgende",
    submit: "Verstuur maar",
    chat: "Laten we kennismaken",
    done: ["Bedankt,", "binnen."],
    doneSub: "We reageren binnen één werkdag.",
    sumBudget: "budget",
    sumEmail: "e-mail",
    trusted: "Vertrouwd door",
    step1: "Stap 1 van 2: jouw budget.",
    step2: "Stap 2 van 2: jouw e-mailadres.",
  },
} as const;

/* Common budgets, in line with the ranges in content/insights/website-cost.md
   (brochure site from 2.500, business site 7.000 to 20.000, custom 20.000 and up). */
export const BUDGETS = [
  { value: "2.500", label: "€ 2.500" },
  { value: "5.000", label: "€ 5.000" },
  { value: "7.500", label: "€ 7.500" },
  { value: "10.000", label: "€ 10.000" },
  { value: "20.000", label: "€ 20.000+" },
];

/* Same list as src/app/components/home/Partners.tsx */
export const PARTNERS = [
  { name: "STËLZ", url: "https://drinkstelz.com/", src: "/logos/STELZ1.svg" },
  { name: "BIYU", url: "https://www.biyu.world/", src: "/logos/BIYU.svg" },
  { name: "KULT AND ACE", url: "http://kultandace.com/", src: "/logos/KultAndAce.svg" },
  { name: "FIJNE GASTEN", url: "http://www.fijnegasten.nl/", src: "/logos/Fijne-gasten.svg" },
  { name: "JD", url: "https://www.jdsports.nl/", src: "/logos/JD.svg" },
  { name: "PACT", url: "https://pact-worldwide.com/en/corporates/", src: "/logos/PACT.svg" },
  { name: "A/CAFE", url: "https://acafegroup.com/", src: "/logos/ACAFE.svg" },
  { name: "XPRNZ", url: "https://xprnz.nl/", src: "/logos/XPRNZ.svg" },
  { name: "PUREANDCURE", url: "https://pureandcure.com/", src: "/logos/pureandcure.svg" },
];

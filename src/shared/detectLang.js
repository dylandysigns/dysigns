// Which language a visitor writes in, shared by the chat on the page (src/app/hooks/useFaqChat.ts)
// and the AI endpoint (functions/api/faq-chat.js), so both always switch the same way.
//
// The site language is only the default. Someone on the English site who writes Dutch gets Dutch
// back, and the other way round:
//   1. The latest message that says something about language decides: an explicit request
//      ("praat Nederlands", "can we speak English?", "in het Engels graag") or, without one,
//      the words it is written in. Messages like "ok" or "website?" say nothing, so the one
//      before them decides, which keeps a switch in place for the rest of the conversation.
//   2. Otherwise the site language.

const NL_WORDS = new Set(
  "ik je jij u wij we jullie wat hoe waar wie wanneer waarom welke welk hoeveel kost kosten prijs prijzen een het de niet geen wel voor van met naar op bij ook maar als dan nog nu hebben hebt heb kan kunnen kun willen wil graag moet moeten zijn ben bent mijn jouw uw ons onze bedrijf offerte maken laten bouwen dat ongeveer deze die dit er om aan uit over wordt worden helpen helpt maak doen dank bedankt hallo hoi goedemorgen goedemiddag goedenavond spreek spreekt praat praten alsjeblieft alstublieft misschien eigenlijk gewoon even toch zou zouden doet werken werkt lang duurt jullie zitten zit welke kunt ga gaat gaan heeft had waren vraag vragen antwoord beter mooi leuk zoek zoeken nodig klant klanten winkel verkopen verkoop ontwerp huisstijl nederlands engels".split(" "),
);
const EN_WORDS = new Set(
  "i you your we our what how where who when why which much many cost costs price prices the an are was be do does did not no for of with to on at also but if then still now have has can could will would should want need please my us company quote build make thanks thank hello hi hey speak speaks talk maybe actually just really about any some get work works take takes store sell selling they them their this that these those there here it its english dutch".split(
    " ",
  ),
);

// "nederlands", "dutch", "in het nederlands", "NL" asked for explicitly
const ASK_NL =
  /\b(?:(?:in\s+het\s+|op\s+)?nederlands|dutch|in\s+het\s+nl|nl\s+(?:graag|aub|pls|please)|vlaams)\b/i;
const ASK_EN = /\b(?:(?:in\s+het\s+)?engels|english|in\s+english|en\s+(?:graag|aub|pls|please))\b/i;
// A request, not just a mention ("we sell Dutch cheese" is not a request)
const REQUEST =
  /\b(?:spreek|spreekt|praat|praten|antwoord|antwoorden|schrijf|schrijven|kan\s+het|graag|alsjeblieft|aub|speak|talk|answer|reply|write|respond|switch|can\s+we|could\s+you|please|pls|in)\b/i;

/** "nl" or "en" when this one message explicitly asks for a language, else null. */
export function requestedLang(text) {
  const t = String(text ?? "");
  if (t.split(/\s+/).length > 12) return null;
  const nl = ASK_NL.test(t);
  const en = ASK_EN.test(t);
  if (nl === en) return null;
  // a bare "Nederlands?" or "English please" counts too
  if (!REQUEST.test(t) && t.split(/\s+/).length > 2) return null;
  return nl ? "nl" : "en";
}

/** "nl" or "en" when the words of this one message clearly lean one way, else null. */
export function leanLang(text) {
  const words = String(text ?? "").toLowerCase().match(/[a-zà-ÿ']+/g) ?? [];
  let nl = 0;
  let en = 0;
  for (const w of words) {
    // words that exist in both languages (is, me, website, ...) say nothing
    const inNl = NL_WORDS.has(w);
    const inEn = EN_WORDS.has(w);
    if (inNl && !inEn) nl++;
    else if (inEn && !inNl) en++;
  }
  if (nl > en) return "nl";
  if (en > nl) return "en";
  return null;
}

/** The language to answer in, from the visitor's messages (oldest first) and the site language. */
export function detectLang(userTurns, fallback) {
  for (let i = userTurns.length - 1; i >= 0; i--) {
    const lang = requestedLang(userTurns[i]) ?? leanLang(userTurns[i]);
    if (lang) return lang;
  }
  return fallback;
}

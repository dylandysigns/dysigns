import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Restaurant data ───────────────────────────────────────────────────── */
const RESTAURANTS = {
  zusje: {
    name: "'T Zusje",
    full: "'T Zusje Roermond",
    time: "19:00",
    description:
      "All-you-can-eat met rondes bestellen in een cozy, warme setting. Perfect voor wanneer je echt honger hebt én gewoon lekker wil genieten.",
    sub: "Je wil eten, genieten en geen rem op hoeveel. 't Zusje is precies dat.",
  },
  ichi: {
    name: "Ichi Sushi",
    full: "Ichi Sushi Roermond",
    time: "17:30",
    description:
      "Japans eten in een stijlvolle setting — luxe, maar zonder dat het zwaar aanvoelt. Elk gerecht is een statement op zich.",
    sub: "Je hebt zin in iets verfijnds en Japans. Ichi Sushi past precies bij die mood.",
  },
  seafood: {
    name: "Seafood Club",
    full: "Seafood Club Roermond",
    time: "19:00",
    description:
      "Verse vis en zeevruchten recht uit de pan. Geen poespas — gewoon goed en eerlijk eten, alsof er niets speciaals hoeft.",
    sub: "Jij wil gewoon lekker eten, zonder gedoe. Seafood Club is exact dat.",
  },
  terra: {
    name: "Terra Nova",
    full: "Terra Nova",
    time: "20:00",
    description:
      "Italiaans eten in een rustige, bijna sprookjesachtige sfeer. Een avond waarbij je echt even wegbent van alles.",
    sub: "Je zoekt rust, sfeer en een avond die aanvoelt als even weg zijn. Terra Nova geeft je dat.",
  },
} as const;

type RestaurantKey = keyof typeof RESTAURANTS;

/* ─── Quiz questions ────────────────────────────────────────────────────── */
interface Option {
  emoji: string;
  label: string;
  scores: Partial<Record<RestaurantKey, number>>;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: "keuken",
    question: "Waar heb je vanavond zin in?",
    options: [
      { emoji: "🍣", label: "Japans — sushi, sashimi, noedels", scores: { ichi: 3 } },
      { emoji: "🍝", label: "Italiaans — pasta, risotto", scores: { terra: 3 } },
      { emoji: "🦐", label: "Vis en zeevruchten uit de pan", scores: { seafood: 3 } },
      { emoji: "🍽️", label: "Alles — ik wil gewoon veel eten", scores: { zusje: 3 } },
    ],
  },
  {
    id: "trek",
    question: "Hoeveel trek heb je?",
    options: [
      { emoji: "🐦", label: "Niet zo veel — één goed gerecht", scores: { terra: 2, ichi: 1 } },
      { emoji: "😋", label: "Gewone honger — normaal uiteten", scores: { seafood: 2, ichi: 1 } },
      { emoji: "🍴", label: "Behoorlijk trek — meerdere gangen", scores: { zusje: 2, seafood: 1 } },
      { emoji: "🐷", label: "Superhonger — ik wil blijven bestellen", scores: { zusje: 3 } },
    ],
  },
  {
    id: "sfeer",
    question: "Welke sfeer past vanavond bij jou?",
    options: [
      { emoji: "✨", label: "Luxe en stijlvol", scores: { ichi: 3 } },
      { emoji: "🌿", label: "Rustig en sprookjesachtig", scores: { terra: 3 } },
      { emoji: "🛋️", label: "Cozy en huiselijk", scores: { zusje: 3 } },
      { emoji: "😎", label: "Casual — gewoon lekker eten", scores: { seafood: 3 } },
    ],
  },
  {
    id: "avond",
    question: "Vanavond is het...",
    options: [
      { emoji: "🎉", label: "Een echt speciaal moment", scores: { terra: 2, ichi: 2 } },
      { emoji: "🫶", label: "Gezellig en intiem — voor ons", scores: { zusje: 2, terra: 1 } },
      { emoji: "😌", label: "Gewoon uiteten — relaxed", scores: { seafood: 2, zusje: 1 } },
      { emoji: "🌟", label: "Stijlvol maar niet overdreven", scores: { ichi: 2, seafood: 1 } },
    ],
  },
  {
    id: "timing",
    question: "Hoe laat wil je eten?",
    options: [
      { emoji: "🕔", label: "Vroeg — nu meteen eigenlijk (17:30)", scores: { ichi: 3 } },
      { emoji: "🕖", label: "Rond 19:00", scores: { seafood: 2, zusje: 2 } },
      { emoji: "🕗", label: "Later op de avond (20:00+)", scores: { terra: 3 } },
      { emoji: "🤷", label: "Maakt me niet uit", scores: { ichi: 1, seafood: 1, zusje: 1, terra: 1 } },
    ],
  },
  {
    id: "beleving",
    question: "Wat maakt een avond eten écht goed?",
    options: [
      { emoji: "🍣", label: "Dat elk hapje perfect bereid is", scores: { ichi: 3 } },
      { emoji: "🫕", label: "Samen veel eten en lachen", scores: { zusje: 3 } },
      { emoji: "🌊", label: "Vers en puur — recht uit zee", scores: { seafood: 3 } },
      { emoji: "🕯️", label: "De sfeer — het totaalplaatje", scores: { terra: 3 } },
    ],
  },
];

/* ─── Scoring ───────────────────────────────────────────────────────────── */
function computeResult(answers: (number | null)[]): {
  winner: RestaurantKey;
  runnerUp: RestaurantKey;
  scores: Record<RestaurantKey, number>;
} {
  const scores: Record<RestaurantKey, number> = { zusje: 0, ichi: 0, seafood: 0, terra: 0 };

  answers.forEach((answerIdx, qIdx) => {
    if (answerIdx === null) return;
    const opts = QUESTIONS[qIdx].options[answerIdx].scores;
    (Object.entries(opts) as [RestaurantKey, number][]).forEach(([key, val]) => {
      scores[key] += val;
    });
  });

  // Tie-break by earliest opening time: ichi(17:30), zusje/seafood(19:00), terra(20:00)
  const tieOrder: RestaurantKey[] = ["ichi", "zusje", "seafood", "terra"];
  const sorted = (Object.keys(scores) as RestaurantKey[]).sort((a, b) => {
    if (scores[b] !== scores[a]) return scores[b] - scores[a];
    return tieOrder.indexOf(a) - tieOrder.indexOf(b);
  });

  return { winner: sorted[0], runnerUp: sorted[1], scores };
}

/* ─── Animation hook ────────────────────────────────────────────────────── */
function useSlideIn(key: string | number) {
  const ref = useRef<HTMLDivElement>(null);
  const prevKey = useRef(key);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const dir = key > prevKey.current ? 1 : -1;
    prevKey.current = key;

    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = `translateY(${dir * 18}px)`;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "opacity 0.38s ease, transform 0.38s ease";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [key]);

  return ref;
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function FatinsBirthdayPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1–6 = questions, 7 = result
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [selecting, setSelecting] = useState(false);
  const contentRef = useSlideIn(step);

  // Inject noindex so crawlers skip this page
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prev = meta?.getAttribute("content") ?? "";
    meta?.setAttribute("content", "noindex, nofollow");
    return () => {
      meta?.setAttribute("content", prev);
    };
  }, []);

  const totalSteps = QUESTIONS.length;
  const isQuestion = step >= 1 && step <= totalSteps;
  const qIndex = step - 1;
  const progress = isQuestion ? qIndex / totalSteps : step === 0 ? 0 : 1;

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (selecting) return;
      setSelecting(true);

      const next = [...answers];
      next[qIndex] = optionIdx;
      setAnswers(next);

      setTimeout(() => {
        setStep((s) => s + 1);
        setSelecting(false);
      }, 260);
    },
    [answers, qIndex, selecting],
  );

  const handleBack = useCallback(() => {
    if (step === 0) return;
    setStep((s) => s - 1);
  }, [step]);

  const handleRestart = useCallback(() => {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setStep(0);
  }, []);

  const result = step > totalSteps ? computeResult(answers) : null;

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--page-bg)",
        color: "var(--page-fg)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
        cursor: "auto",
        WebkitTapHighlightColor: "transparent",
        overflowX: "hidden",
      }}
    >
      {/* Progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(255,255,255,0.06)",
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "rgba(255,255,255,0.5)",
            transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      {/* Back button */}
      {step > 0 && step <= totalSteps && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 101,
          }}
        >
          <button
            onClick={handleBack}
            aria-label="Vorige vraag"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100,
              padding: "8px 14px",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              lineHeight: 1,
              letterSpacing: "0.01em",
              transition: "background 0.2s, color 0.2s",
            }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(255,255,255,0.3)";
              (e.currentTarget as HTMLElement).style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              (e.currentTarget as HTMLElement).style.outline = "none";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Terug
          </button>
        </div>
      )}

      {/* Step counter */}
      {isQuestion && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            top: 22,
            right: 20,
            zIndex: 101,
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}
        >
          {step}/{totalSteps}
        </div>
      )}

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px 40px",
          maxWidth: 520,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div ref={contentRef} style={{ width: "100%" }}>
          {/* INTRO */}
          {step === 0 && (
            <IntroScreen onStart={() => setStep(1)} />
          )}

          {/* QUESTION */}
          {isQuestion && (
            <QuestionScreen
              question={QUESTIONS[qIndex]}
              selectedIndex={answers[qIndex]}
              onSelect={handleAnswer}
              selecting={selecting}
            />
          )}

          {/* RESULT */}
          {result && (
            <ResultScreen
              winner={result.winner}
              runnerUp={result.runnerUp}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Intro screen ──────────────────────────────────────────────────────── */
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          marginBottom: 24,
          fontFamily: "Inter, sans-serif",
        }}
      >
        Vanavond
      </p>

      <h1
        style={{
          fontSize: "clamp(28px, 8vw, 48px)",
          fontWeight: 500,
          lineHeight: 1.15,
          marginBottom: 20,
          background: "var(--hero-headline-gradient)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.02em",
        }}
      >
        Waar gaan
        <br />
        we eten?
      </h1>

      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.65,
          marginBottom: 48,
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          maxWidth: 320,
          margin: "0 auto 48px",
        }}
      >
        6 korte vragen. Geen twijfel meer.
        <br />
        Één perfecte keuze.
      </p>

      <QuizButton onClick={onStart} primary>
        Start de quiz
      </QuizButton>

      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.2)",
          marginTop: 20,
          fontFamily: "Inter, sans-serif",
        }}
      >
        4 restaurants · Roermond
      </p>
    </div>
  );
}

/* ─── Question screen ───────────────────────────────────────────────────── */
function QuestionScreen({
  question,
  selectedIndex,
  onSelect,
  selecting,
}: {
  question: Question;
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
  selecting: boolean;
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: "clamp(20px, 5.5vw, 32px)",
          fontWeight: 500,
          lineHeight: 1.25,
          marginBottom: 32,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "-0.015em",
          textAlign: "center",
          color: "var(--page-fg)",
        }}
      >
        {question.question}
      </h2>

      <div
        role="radiogroup"
        aria-label={question.question}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {question.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <OptionButton
              key={idx}
              emoji={opt.emoji}
              label={opt.label}
              selected={isSelected}
              disabled={selecting}
              onClick={() => onSelect(idx)}
              index={idx}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─── Option button ─────────────────────────────────────────────────────── */
function OptionButton({
  emoji,
  label,
  selected,
  disabled,
  onClick,
  index,
}: {
  emoji: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  index: number;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(255,255,255,0.3)";
        (e.currentTarget as HTMLElement).style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "none";
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        padding: "16px 18px",
        borderRadius: 14,
        border: selected
          ? "1px solid rgba(255,255,255,0.35)"
          : "1px solid rgba(255,255,255,0.09)",
        background: selected
          ? "rgba(255,255,255,0.07)"
          : pressed
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.025)",
        color: selected ? "var(--page-fg)" : "rgba(255,255,255,0.65)",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        fontWeight: selected ? 500 : 400,
        lineHeight: 1.4,
        textAlign: "left",
        cursor: disabled ? "default" : "pointer",
        transition: "background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
        transform: pressed && !disabled ? "scale(0.985)" : "scale(1)",
        WebkitTapHighlightColor: "transparent",
        minHeight: 56,
        animationDelay: `${index * 0.04}s`,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: 20,
          lineHeight: 1,
          flexShrink: 0,
          width: 28,
          textAlign: "center",
        }}
      >
        {emoji}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {selected && (
        <span aria-hidden="true" style={{ flexShrink: 0, opacity: 0.7 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity="0.5" />
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

/* ─── Result screen ─────────────────────────────────────────────────────── */
function ResultScreen({
  winner,
  runnerUp,
  onRestart,
}: {
  winner: RestaurantKey;
  runnerUp: RestaurantKey;
  onRestart: () => void;
}) {
  const restaurant = RESTAURANTS[winner];
  const runner = RESTAURANTS[runnerUp];

  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontSize: 15,
          fontWeight: 400,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 16,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.01em",
        }}
      >
        Happy Birthday Bebe! We gaan eten bij:
      </p>

      {/* Winner card */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          padding: "36px 28px",
          marginBottom: 16,
          background: "rgba(255,255,255,0.03)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 200,
            background: "radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            fontSize: "clamp(28px, 7vw, 42px)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: 10,
            fontFamily: "Inter, sans-serif",
            background: "var(--hero-headline-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {restaurant.name}
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.07)",
            borderRadius: 100,
            padding: "5px 12px",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            marginBottom: 20,
            letterSpacing: "0.02em",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx="5" cy="5" r="3" fill="rgba(255,255,255,0.5)" />
          </svg>
          {restaurant.time}
        </div>

        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.55)",
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            marginBottom: 14,
          }}
        >
          {restaurant.description}
        </p>

        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "Inter, sans-serif",
            fontStyle: "italic",
          }}
        >
          {restaurant.sub}
        </p>
      </div>

      {/* Runner-up */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.25)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Runner-up
          </p>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            {runner.name}
          </p>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.25)",
            fontFamily: "Inter, sans-serif",
            flexShrink: 0,
          }}
        >
          {runner.time}
        </p>
      </div>

      <QuizButton onClick={onRestart}>Opnieuw doen</QuizButton>
    </div>
  );
}

/* ─── Reusable button ───────────────────────────────────────────────────── */
function QuizButton({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(255,255,255,0.3)";
        (e.currentTarget as HTMLElement).style.outlineOffset = "3px";
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).style.outline = "none";
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 32px",
        borderRadius: 100,
        border: primary ? "none" : "1px solid rgba(255,255,255,0.12)",
        background: primary ? "var(--page-fg)" : "transparent",
        color: primary ? "var(--page-bg)" : "rgba(255,255,255,0.55)",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        cursor: "pointer",
        letterSpacing: "0.01em",
        lineHeight: 1,
        transform: pressed ? "scale(0.97)" : "scale(1)",
        transition: "transform 0.12s ease, background 0.2s ease, color 0.2s ease",
        minHeight: 52,
        minWidth: 160,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children}
    </button>
  );
}

import { useState, useEffect, useRef } from "react";

/* ─── Confetti canvas ───────────────────────────────────────────────────── */
function Confetti({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fire) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const COLORS = ["#ffffff", "#F0A8C4", "#D9799F", "#E8E0FF", "#FFE0F0", "#f7c6dc"];

    const burst = (cx: number, cy: number, n: number) =>
      Array.from({ length: n }, () => {
        const angle = (Math.random() * 2 - 1) * Math.PI;
        const speed = 3 + Math.random() * 8;
        return {
          x: cx, y: cy,
          vx: Math.cos(angle) * speed * 0.45,
          vy: -3 - Math.random() * 7,
          w: 5 + Math.random() * 7,
          h: 3 + Math.random() * 4,
          rot: Math.random() * 360,
          rv: (Math.random() - 0.5) * 7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: 1,
        };
      });

    const particles = [
      ...burst(W * 0.2,  H * 0.42, 22),
      ...burst(W * 0.8,  H * 0.42, 22),
      ...burst(W * 0.5,  H * 0.32, 22),
    ];

    const t0 = Date.now();

    const frame = () => {
      const dt = Date.now() - t0;
      ctx.clearRect(0, 0, W, H);
      let alive = false;

      for (const p of particles) {
        p.vy += 0.16;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rv;
        if (dt > 2200) p.alpha = Math.max(0, p.alpha - 0.016);

        if (p.alpha > 0.01 && p.y < H + 40) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }

      if (alive) rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function GiftFatinsBirthdayPage() {
  const [phase, setPhase] = useState<"intro" | "revealed">("intro");
  const [cardIn, setCardIn] = useState(false);

  // Inject noindex so crawlers skip this page
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prev = meta?.getAttribute("content") ?? "";
    meta?.setAttribute("content", "noindex, nofollow");
    return () => { meta?.setAttribute("content", prev); };
  }, []);

  const handleReveal = () => {
    setPhase("revealed");
    requestAnimationFrame(() => requestAnimationFrame(() => setCardIn(true)));
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        cursor: "auto",
        padding: "48px 24px 56px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Keyframes */}
      <style>{`
        @keyframes giftFadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes giftSlideUp  { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes giftPulse    { 0%,100% { opacity:.55 } 50% { opacity:1 } }
        @keyframes giftFloat    { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
        @media (prefers-reduced-motion:reduce) {
          [data-gift-anim] { animation:none !important; transition:none !important; }
        }
      `}</style>

      <Confetti fire={phase === "revealed"} />

      {/* Ambient gold glow — grows when revealed */}
      <div
        aria-hidden="true"
        data-gift-anim
        style={{
          position: "absolute",
          top: "38%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(700px, 140vw)",
          height: "min(700px, 140vw)",
          background: "radial-gradient(ellipse, rgba(217,121,159,0.13) 0%, transparent 65%)",
          pointerEvents: "none",
          transition: "opacity 1.2s ease",
          opacity: phase === "revealed" ? 1 : 0.4,
          animation: phase === "revealed" ? "giftPulse 3s ease-in-out 0.8s infinite" : "none",
        }}
      />

      {/* Content */}
      <main
        style={{
          textAlign: "center",
          maxWidth: 480,
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* "Voor jou" eyebrow */}
        <p
          data-gift-anim
          style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
            marginBottom: 20,
            animation: "giftFadeIn 1s ease 0.1s both",
          }}
        >
          Voor jou
        </p>

        {/* Happy Birthday — Instrument Serif italic */}
        <p
          data-gift-anim
          style={{
            fontSize: "clamp(16px, 4.5vw, 22px)",
            fontFamily: "Instrument Serif, serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: "rgba(255,255,255,0.42)",
            marginBottom: 6,
            animation: "giftSlideUp 0.9s ease 0.25s both",
          }}
        >
          Happy Birthday,
        </p>

        {/* Fatin — big gradient */}
        <h1
          data-gift-anim
          style={{
            fontSize: "clamp(58px, 18vw, 96px)",
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginBottom: 28,
            background: "var(--hero-headline-gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "giftSlideUp 0.9s ease 0.35s both",
          }}
        >
          Fatin.
        </h1>

        {/* Warm sub copy — changes based on phase */}
        <p
          data-gift-anim
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.38)",
            lineHeight: 1.65,
            marginBottom: 44,
            fontFamily: "Inter, sans-serif",
            animation: "giftSlideUp 0.9s ease 0.5s both",
            transition: "opacity 0.5s ease",
            opacity: phase === "revealed" ? 0.55 : 1,
          }}
        >
          {phase === "intro"
            ? "Goedzo bebe dat je de hele mystery box hebt open gemaakt anders had je misschien wel een cadeau gemist."
            : "We gaan er een leuke dag van maken"}
        </p>

        {/* CTA button → gift card */}
        {phase === "intro" ? (
          <button
            onClick={handleReveal}
            data-gift-anim
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "15px 36px",
              borderRadius: 100,
              background: "#fff",
              color: "#000",
              border: "none",
              fontFamily: "Inter, sans-serif",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              minHeight: 54,
              minWidth: 200,
              letterSpacing: "0.01em",
              animation: "giftSlideUp 0.9s ease 0.7s both",
              WebkitTapHighlightColor: "transparent",
              transition: "transform 0.12s ease",
            }}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onFocus={(e) => {
              (e.currentTarget as HTMLElement).style.outline = "2px solid rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLElement).style.outlineOffset = "3px";
            }}
            onBlur={(e) => { (e.currentTarget as HTMLElement).style.outline = "none"; }}
            aria-label="Open je verjaardagscadeau"
          >
            <span aria-hidden="true">🎁</span>
            Open je cadeau
          </button>
        ) : (
          <GiftCard visible={cardIn} />
        )}
      </main>
    </div>
  );
}

/* ─── Gift reveal card ──────────────────────────────────────────────────── */
function GiftCard({ visible }: { visible: boolean }) {
  return (
    <div
      role="region"
      aria-label="Jouw verjaardagscadeau"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.97)",
        transition: "opacity 0.65s cubic-bezier(0.16,1,0.3,1), transform 0.65s cubic-bezier(0.16,1,0.3,1)",
        border: "1px solid rgba(217,121,159,0.24)",
        borderRadius: 22,
        padding: "40px 28px 36px",
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top glow inside card */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -50,
          left: "50%",
          transform: "translateX(-50%)",
          width: 260,
          height: 260,
          background: "radial-gradient(ellipse, rgba(217,121,159,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Gift visual */}
      <div
        data-gift-anim
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "center",
          animation: visible ? "giftFloat 3s ease-in-out 0.8s infinite" : "none",
        }}
      >
        <img
          src="/images/gift-bebe.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 128,
            height: 128,
            objectFit: "contain",
            filter: "drop-shadow(0 8px 24px rgba(217,121,159,0.25))",
          }}
        />
      </div>

      {/* "Jouw cadeau" label */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(217,121,159,0.7)",
          marginBottom: 22,
        }}
      >
        Jouw cadeau
      </p>

      {/* Main message */}
      <h2
        style={{
          fontSize: "clamp(19px, 5.2vw, 27px)",
          fontWeight: 500,
          lineHeight: 1.4,
          letterSpacing: "-0.01em",
          color: "#fff",
          marginBottom: 22,
        }}
      >
        300 euro spend-te-goed Roermond
      </h2>

      {/* Warm sub copy */}
      <p
        style={{
          fontSize: 15,
          fontFamily: "Instrument Serif, serif",
          fontStyle: "italic",
          color: "rgba(255,255,255,0.42)",
          lineHeight: 1.65,
          marginBottom: 28,
        }}
      >
        Dit hoort bij de mystery cadeaubox, je hoeft niet alles uit te geven en mag je ook inruilen voor cash voor op vakantie.
      </p>

      {/* Signature */}
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.22)",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        ♡ Dylan
      </p>

      {/* Gold border shimmer — subtle bottom line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          right: "20%",
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(217,121,159,0.45), transparent)",
        }}
      />
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import "../src/styles/effra.css";
import "./hero-concept.css";
import logoFlat from "../src/assets/dysigns_white.png";
import { createChrome, type Chrome } from "./chrome3d";
import { BUDGETS, COPY, PARTNERS, type Lang } from "./copy";

/* Preview only. Conversational lead hero concept for DYSIGNS: budget, then
   email, in one huge inline field, above a curved 3D carousel. Not wired
   into the site and it sends nothing anywhere. */

type Step = "budget" | "email" | "done";
type Kind = "shot" | "logo" | "cursor" | "envelope" | "sparkle";
type Item = { kind: Kind; w: number; src?: string; alt?: string };

const shot = (file: string, alt: string): Item => ({ kind: "shot", w: 264, src: `/images/${file}`, alt });
const icon = (kind: Kind): Item => ({ kind, w: kind === "logo" ? 210 : 150 });

// Only work cases, with the same covers as the work page (src/app/data/projects.ts).
const ITEMS: Item[] = [
  icon("logo"),
  shot("sfumato-cover.avif", "Sfumato Agency"),
  icon("cursor"),
  shot("stelz-app-work-cover.avif", "STËLZ App"),
  icon("envelope"),
  shot("merelymade-cover.avif", "Merely Made Webshop"),
  icon("sparkle"),
  shot("powermobile-hero.avif", "PowerMobile"),
  icon("logo"),
  shot("beckers-cover-laptop-v3.avif", "Verkeersschool Beckers Branding"),
  icon("cursor"),
  shot("biyu-cover.avif", "BIYU"),
  icon("envelope"),
  shot("studio75-cover-v2.avif", "Studio75 Branding"),
  icon("sparkle"),
  shot("a-cafe/kiosk-after.avif", "A/Café POS & Kiosk Design"),
];

const GAP = 60;
const AUTO_SPEED = 30; // px per second, to the left
const TICKER_SPEED = 40;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export default function HeroConcept() {
  const [step, setStep] = useState<Step>("budget");
  const [value, setValue] = useState("");
  const [budget, setBudget] = useState("");
  const [email, setEmail] = useState("");
  const [swapping, setSwapping] = useState(false);
  const [lang, setLang] = useState<Lang>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "nl" ? "nl" : "en",
  );
  const [suggest, setSuggest] = useState(false);
  const c = COPY[lang];
  const base = lang === "nl" ? "/nl" : "";
  const [chrome, setChrome] = useState<Chrome | null>(null);
  const [field, setField] = useState({ width: 0, scale: 1 });

  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chromeRef = useRef<Chrome | null>(null);

  const typing = value !== "";
  const placeholder = step === "budget" ? c.budget : c.email;
  const valid = step === "budget" ? value !== "" : EMAIL_RE.test(value);

  /* ─── 3D chrome assets ─── */
  useEffect(() => {
    let alive = true;
    createChrome()
      .then((made) => {
        if (!alive) return;
        chromeRef.current = made;
        setChrome(made);
      })
      .catch(() => {
        /* no WebGL or no network: the flat logo stays in place */
      });
    return () => {
      alive = false;
    };
  }, []);

  /* ─── Field width follows the content, and shrinks to fit the viewport ─── */
  useLayoutEffect(() => {
    const fit = () => {
      const span = measureRef.current;
      if (!span) return;
      span.textContent = value || placeholder;
      const w = span.offsetWidth + 6;
      const max = window.innerWidth * 0.8;
      const scale = Math.min(1, max / w);
      setField({ width: w * scale, scale });
    };
    fit();
    window.addEventListener("resize", fit);
    document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [value, placeholder]);

  useEffect(() => {
    if (step !== "done") inputRef.current?.focus({ preventScroll: true });
  }, [step]);

  /* ─── Success screen resets after 4 seconds ─── */
  useEffect(() => {
    if (step !== "done") return;
    const id = window.setTimeout(reset, 4000);
    return () => window.clearTimeout(id);
  }, [step]);

  function reset() {
    setValue("");
    setBudget("");
    setEmail("");
    setSuggest(false);
    setStep("budget");
  }

  function onChange(raw: string) {
    if (step === "budget") {
      const digits = raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
      setValue(digits.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    } else {
      setValue(raw.replace(/\s/g, ""));
    }
  }

  function pickBudget(v: string) {
    setValue(v);
    setSuggest(false);
    inputRef.current?.focus({ preventScroll: true });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid || swapping) return;
    if (step === "budget") {
      setBudget(value);
      setSwapping(true);
      window.setTimeout(() => {
        setStep("email");
        setValue("");
        setSwapping(false);
      }, 175);
    } else {
      setEmail(value);
      setStep("done");
    }
  }

  /* ─── One animation loop: ticker, carousel, live 3D logo ─── */
  useEffect(() => {
    const stage = stageRef.current;
    const ticker = tickerRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = itemRefs.current;
    const logoCanvases = els.map((el) => el?.querySelector<HTMLCanvasElement>("canvas[data-logo]") ?? null);

    let vw = window.innerWidth;
    let radius = 1400;
    let centers: number[] = [];
    let loop = 1;
    let scroll = 0;
    let started = false;

    const measure = () => {
      vw = window.innerWidth;
      const s = Math.min(vw < 768 ? 0.7 : 1, stage.clientHeight / 230);
      radius = vw < 768 ? 900 : 1400;
      let x = 0;
      centers = ITEMS.map((it, i) => {
        const w = it.w * s;
        const el = els[i];
        if (el) el.style.width = `${w}px`;
        const c = x + w / 2;
        x += w + GAP * s;
        return c;
      });
      loop = x;
      if (!started) {
        scroll = centers[0]; // open with the 3D logo in the middle
        started = true;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    /* drag with momentum */
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;
    let momentum = 0;
    let ramp = 1;
    const down = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      momentum = 0;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("is-dragging");
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      scroll -= dx;
      const dt = Math.max(1, now - lastT) / 1000;
      velocity = velocity * 0.6 + (-dx / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      momentum = performance.now() - lastT > 120 ? 0 : velocity;
      ramp = 0;
      stage.classList.remove("is-dragging");
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    /* pointer position steers the logo a little */
    let mx = 0;
    let my = 0;
    let tx = 0;
    let ty = 0;
    const mouse = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", mouse, { passive: true });

    /* ticker */
    const track = ticker?.firstElementChild as HTMLElement | null;
    const phrases = track ? Array.from(track.children) as HTMLElement[] : [];
    let tickerOff = 0;

    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (track && ticker && phrases.length) {
        const setWidth = track.scrollWidth / 2;
        if (!reduce) tickerOff = (tickerOff + TICKER_SPEED * dt) % setWidth;
        track.style.transform = `translate3d(${-tickerOff}px,0,0)`;
        const mid = ticker.clientWidth / 2;
        let best = 0;
        let bestD = Infinity;
        phrases.forEach((p, i) => {
          const d = Math.abs(p.offsetLeft + p.offsetWidth / 2 - tickerOff - mid);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        });
        phrases.forEach((p, i) => p.classList.toggle("is-near", i === best));
      }

      if (!dragging) {
        momentum *= Math.pow(0.95, dt * 60);
        if (Math.abs(momentum) < 4) momentum = 0;
        ramp += (1 - ramp) * Math.min(1, dt * 1.4);
        scroll += ((reduce ? 0 : AUTO_SPEED * ramp) + momentum) * dt;
      }

      let logoVisible = false;
      const half = vw / 2;
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        let x = centers[i] - scroll;
        x = ((((x + loop / 2) % loop) + loop) % loop) - loop / 2;
        const t = Math.abs(x) / half;
        // Phones are too narrow for the desktop falloff: keep more in focus.
        const from = vw < 768 ? 0.75 : 0.35;
        const to = vw < 768 ? 1.6 : 1;
        if (t > to + 0.3) {
          el.style.visibility = "hidden";
          continue;
        }
        const th = x / radius;
        const k = clamp01((t - from) / (to - from));
        el.style.visibility = "visible";
        el.style.transform = `translate(-50%,-50%) translate3d(${radius * Math.sin(th)}px,0,${radius * (1 - Math.cos(th)) * 0.6}px) rotateY(${-th}rad)`;
        el.style.opacity = String(1 - k * k);
        el.style.filter = reduce || k < 0.02 ? "none" : `blur(${(8 * k).toFixed(2)}px)`;
        if (logoCanvases[i] && k < 1) logoVisible = true;
      }

      const gl = chromeRef.current;
      if (gl && logoVisible) {
        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;
        gl.renderLogo((now - t0) / 1000, mx, my, reduce);
        for (const cv of logoCanvases) {
          if (!cv || cv.closest<HTMLElement>("[data-item]")?.style.visibility === "hidden") continue;
          const ctx = cv.getContext("2d");
          if (!ctx) continue;
          ctx.clearRect(0, 0, cv.width, cv.height);
          ctx.drawImage(gl.canvas, 0, 0, cv.width, cv.height);
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", mouse);
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, [chrome]);

  const done = step === "done";

  return (
    <main className={`hc ${typing ? "is-typing" : ""} ${done ? "is-done" : ""}`}>
      {/* ─── Top bar ─── */}
      <header className="hc-top">
        <div className="hc-top__left">
          <a className="hc-handle" href="/">
            <span className="hc-handle__avatar">
              <img src={logoFlat} alt="" />
            </span>
            DYSIGNS
          </a>
          <div className="hc-ticker" ref={tickerRef} aria-hidden="true">
            <div className="hc-ticker__track">
              {[...c.ticker, ...c.ticker, ...c.ticker, ...c.ticker].map((p, i) => (
                <span key={i}>{p}</span>
              ))}
            </div>
          </div>
        </div>
        <nav className="hc-nav" aria-label="Main">
          <a href={`${base}/work`}>{c.nav.work}</a>
          <a href={`${base}/about`}>{c.nav.about}</a>
          <a href={`${base}/contact`}>{c.nav.contact}</a>
          <button type="button" className="hc-lang" onClick={() => setLang(lang === "en" ? "nl" : "en")}>
            {lang === "en" ? "NL" : "EN"}
          </button>
        </nav>
      </header>

      {/* ─── Heading ─── */}
      <h1 className="hc-head">
        <span>{c.title[0]}</span>
        <em>{c.title[1]}</em>
        <small>{c.sub}</small>
      </h1>

      {/* ─── The field ─── */}
      <form className="hc-form" onSubmit={onSubmit} noValidate>
        <div
          className={`hc-row ${typing ? "is-filled" : ""} ${swapping ? "is-swapping" : ""}`}
          style={{ ["--hc-scale" as string]: field.scale }}
          onClick={() => step === "budget" && setSuggest(true)}
        >
          <span className="hc-icon" aria-hidden="true">
            {step === "budget" ? (
              <svg viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="23" fill="currentColor" />
                <path d="M32 16.8a10.2 10.2 0 1 0 0 14.4M12.5 21.4h13M12.5 26.6h11" fill="none" stroke="#000" strokeWidth="3.4" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 48 48">
                <rect x="2" y="8" width="44" height="32" rx="7" fill="currentColor" />
                <path d="M9 16.5 24 27.5l15-11" fill="none" stroke="#000" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <label className="hc-sr" htmlFor="hc-input">
            {step === "budget" ? c.budgetLabel : c.emailLabel}
          </label>
          <input
            id="hc-input"
            ref={inputRef}
            className="hc-input"
            style={{ width: field.width }}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={step === "budget" ? "numeric" : "email"}
            type={step === "budget" ? "text" : "email"}
            autoComplete={step === "budget" ? "off" : "email"}
            autoCapitalize="off"
            spellCheck={false}
            disabled={done}
          />
        </div>
        <div className="hc-below">
          <button className={`hc-next ${valid && !swapping ? "is-visible" : ""}`} type="submit" tabIndex={valid ? 0 : -1}>
            {step === "budget" ? c.next : c.submit}
          </button>
          {/* Common budgets: open after a click on the budget field, one tap fills it in. */}
          <div
            className={`hc-chips ${step === "budget" && suggest && !typing ? "is-visible" : ""}`}
            role="group"
            aria-label={c.budgetHint}
          >
            {BUDGETS.map((b) => (
              <button key={b.value} type="button" tabIndex={suggest && !typing ? 0 : -1} onClick={() => pickBudget(b.value)}>
                {b.label}
              </button>
            ))}
          </div>
          <a className={`hc-chat ${!typing && !(step === "budget" && suggest) ? "is-visible" : ""}`} href={`${base}/contact`}>
            {c.chat}
          </a>
        </div>
        <span className="hc-measure" ref={measureRef} aria-hidden="true" />
      </form>

      <p className="hc-sr" aria-live="polite">
        {step === "budget" && c.step1}
        {step === "email" && c.step2}
        {done && `${c.done.join(" ")} ${c.doneSub}`}
      </p>

      {/* ─── Success ─── */}
      {done && (
        <section className="hc-done" onClick={reset}>
          <span className="hc-done__check hc-stagger" style={{ ["--i" as string]: 0 }}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.5 12.5l3.6 3.6L17.5 8.6" />
            </svg>
          </span>
          <p className="hc-done__title hc-stagger" style={{ ["--i" as string]: 1 }}>
            {c.done[0]}
          </p>
          <p className="hc-done__title hc-done__serif" aria-label={c.done[1]}>
            {Array.from(c.done[1] as string).map((ch, i) => (
              <span key={i} aria-hidden="true" style={{ animationDelay: `${160 + i * 40}ms` }}>
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </p>
          <p className="hc-done__sub hc-stagger" style={{ ["--i" as string]: 3 }}>
            {c.doneSub}
          </p>
          <dl className="hc-done__summary hc-stagger" style={{ ["--i" as string]: 4 }}>
            <dt>{c.sumBudget}</dt>
            <dd>€ {budget}</dd>
            <dt>{c.sumEmail}</dt>
            <dd>{email}</dd>
          </dl>
        </section>
      )}

      {/* ─── Curved 3D carousel ─── */}
      <div className="hc-stage" ref={stageRef}>
        {ITEMS.map((it, i) => (
          <div
            key={i}
            data-item
            className={`hc-item hc-item--${it.kind === "shot" ? "shot" : "icon"}`}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            {it.kind === "shot" && <img src={it.src} alt={it.alt} draggable={false} loading="eager" />}
            {it.kind === "logo" && (
              <div className="hc-float" style={{ animationDuration: "5.4s", animationDelay: `${-i * 0.7}s` }}>
                {chrome ? (
                  <canvas data-logo width={480} height={480} role="img" aria-label="DYSIGNS logo in 3D chrome" />
                ) : (
                  <img className="hc-logo-fallback" src={logoFlat} alt="DYSIGNS" draggable={false} />
                )}
              </div>
            )}
            {it.kind !== "shot" && it.kind !== "logo" && chrome && (
              <div className="hc-float" style={{ animationDuration: `${4 + ((i * 7) % 5) * 0.5}s`, animationDelay: `${-i * 0.9}s` }}>
                <img src={chrome.icons[it.kind]} alt="" draggable={false} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Trusted by ─── */}
      <aside className="hc-trust" aria-label={c.trusted}>
        <span className="hc-trust__label">{c.trusted}</span>
        <div className="hc-trust__mask">
          <div className="hc-trust__track">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-hidden={i >= PARTNERS.length ? true : undefined}
                tabIndex={i >= PARTNERS.length ? -1 : undefined}
                className={i >= PARTNERS.length ? "is-copy" : undefined}
              >
                <img src={p.src} alt={p.name} draggable={false} />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

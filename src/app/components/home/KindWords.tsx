import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type SwiperType from "swiper";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "../../data/content";
import { useCursor } from "../../hooks/useCursor";
import { useLanguage } from "../../hooks/useLanguage";

gsap.registerPlugin(ScrollTrigger);

/* ─── Source data (unique testimonials) ─── */
const SOURCE = siteContent.testimonials; // 8 items

/* ─── Reduced-motion guard ─── */
const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Quote icon ─── */
function QuoteIcon() {
  return (
    <svg
      width="32"
      height="26"
      viewBox="0 0 28 22"
      fill="none"
      aria-hidden
      className="shrink-0 mb-4"
    >
      <path
        d="M0 22V13.2C0 10.7333 0.4 8.5 1.2 6.5C2.04 4.46 3.18 2.76 4.62 1.4L8.4 3.8C7.24 5 6.36 6.34 5.76 7.82C5.2 9.26 4.92 10.76 4.92 12.32H8.4V22H0ZM15.6 22V13.2C15.6 10.7333 16 8.5 16.8 6.5C17.64 4.46 18.78 2.76 20.22 1.4L24 3.8C22.84 5 21.96 6.34 21.36 7.82C20.8 9.26 20.52 10.76 20.52 12.32H24V22H15.6Z"
        fill="rgba(255,255,255,0.18)"
      />
    </svg>
  );
}

/* ─── Arrow button ─── */
function ArrowBtn({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  const cursor = useCursor();
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() =>
        cursor.set("view", direction === "prev" ? "PREV" : "NEXT")
      }
      onMouseLeave={() => cursor.reset()}
      className="group flex items-center justify-center shrink-0"
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "#fff",
        cursor: "pointer",
        transition:
          "background .3s, border-color .3s, transform .3s cubic-bezier(.22,1,.36,1)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{
          transform: direction === "prev" ? "rotate(180deg)" : "none",
        }}
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   KindWords — MasterClass-style testimonial slider
   ════════════════════════════════════════════════════════════════════════ */

export function KindWords() {
  const [active, setActive] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [touchHintVisible, setTouchHintVisible] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const touchHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursor = useCursor();
  const { t } = useLanguage();

  /* Map realIndex back to source data (handles duplicated slides) */
  const total = SOURCE.length || 1;
  const sourceIndex = ((active % total) + total) % total; // safe modulo, handles NaN/negative
  const current = SOURCE[sourceIndex] ?? SOURCE[0];
  const quote = current ? t(`testimonial.${current.id}.quote`) : "";

  /* Slide change handler */
  const onSlideChange = useCallback((s: SwiperType) => {
    const raw = s.activeIndex;
    const safe = typeof raw === "number" && !Number.isNaN(raw) ? raw : 0;
    setActive(safe);
    setFadeKey((k) => k + 1);
  }, []);

  /* Hide touch hint after first interaction or after 4 s */
  const dismissHint = useCallback(() => {
    setTouchHintVisible(false);
    if (touchHintTimerRef.current) {
      clearTimeout(touchHintTimerRef.current);
      touchHintTimerRef.current = null;
    }
  }, []);

  const onTouchStart = useCallback(() => {
    dismissHint();
  }, [dismissHint]);

  /* Auto-dismiss hint after 4 s */
  useEffect(() => {
    if (!touchHintVisible) return;
    touchHintTimerRef.current = setTimeout(dismissHint, 4000);
    return () => {
      if (touchHintTimerRef.current) clearTimeout(touchHintTimerRef.current);
    };
  }, [touchHintVisible, dismissHint]);

  /* GSAP entrance animation for heading */
  useEffect(() => {
    if (prefersReduced) return;
    const head = headRef.current;
    const section = sectionRef.current;
    if (!head || !section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        head,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: { trigger: head, start: "top 85%", once: true },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  /* Navigation helpers */
  const goPrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const goNext = useCallback(() => swiperRef.current?.slideNext(), []);
  const goTo = useCallback(
    (i: number) => {
      swiperRef.current?.slideTo(i);
    },
    [],
  );

  /* Autoplay config */
  const autoplayConfig = useMemo(
    () =>
      prefersReduced
        ? false
        : ({
            enabled: true,
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false, // we manage pause/resume manually via wrapper events
          } as const),
    [],
  );

  /* Pointer handlers — cursor + autoplay pause/resume */
  const onSliderPointerEnter = useCallback(() => {
    cursor.set("drag", t("cursor.drag"));
    swiperRef.current?.autoplay?.stop();
  }, [cursor, t]);

  const onSliderPointerLeave = useCallback(() => {
    cursor.reset();
    if (!prefersReduced) swiperRef.current?.autoplay?.start();
  }, [cursor]);

  /* Swiper init — kick-start autoplay explicitly */
  const onSwiperInit = useCallback((s: SwiperType) => {
    swiperRef.current = s;
    if (!prefersReduced && s.autoplay) {
      // Defer start to next frame so DOM is fully mounted
      requestAnimationFrame(() => {
        if (!s.destroyed) s.autoplay.start();
      });
    }
  }, []);

  /* Restart autoplay after drag/touch release */
  const onSliderTouchEnd = useCallback(() => {
    if (!prefersReduced && swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start();
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-36"
      style={{ background: "#000", overflow: "hidden" }}
    >
      {/* Faint background watermark */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Inter',sans-serif",
          fontSize: "clamp(8rem,22vw,20rem)",
          fontWeight: 900,
          letterSpacing: "-.05em",
          lineHeight: 1,
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,.025)",
          whiteSpace: "nowrap",
          zIndex: 0,
          textTransform: "lowercase",
        }}
        aria-hidden
      >
        {t("testimonials.heading2")}
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
        {/* ── Desktop: two-column  |  Mobile: stacked ── */}
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-0 items-start">
          {/* ── Left column — heading ── */}
          <div
            ref={headRef}
            className="relative z-10 lg:pr-12 lg:pt-4"
            style={{ opacity: prefersReduced ? 1 : 0 }}
          >
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,.45)",
              }}
            >
              {t("testimonials.label")}
            </span>

            <h2
              className="mt-3"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(1.5rem,3.5vw,2.8rem)",
                fontWeight: 700,
                letterSpacing: "-.03em",
                color: "#fff",
                lineHeight: 1.15,
              }}
            >
              {t("testimonials.heading1")}{" "}
              <span
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px rgba(255,255,255,.35)",
                }}
              >
                {t("testimonials.heading2")}
              </span>
            </h2>

            <p
              className="mt-4 max-w-sm"
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(.9rem, 1.2vw, 1.05rem)",
                fontStyle: "italic",
                color: "rgba(255,255,255,.5)",
                lineHeight: 1.6,
              }}
            >
              {t("testimonials.sub")}
            </p>

            {/* Desktop-only arrows + counter */}
            <div
              className="hidden lg:flex items-center gap-4 mt-12"
              style={{ position: "relative", zIndex: 20 }}
            >
              <ArrowBtn
                direction="prev"
                onClick={goPrev}
                label="Previous testimonial"
              />
              <ArrowBtn
                direction="next"
                onClick={goNext}
                label="Next testimonial"
              />
              <span
                className="ml-3"
                style={{
                  fontFamily: "'Inter',sans-serif",
                  fontSize: ".8rem",
                  fontVariantNumeric: "tabular-nums",
                  color: "rgba(255,255,255,.4)",
                  letterSpacing: ".04em",
                }}
              >
                {String(sourceIndex + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* ── Right column — portrait slider + quote overlay ── */}
          <div
            className="relative"
            style={{ overflow: "visible", zIndex: 2 }}
          >
            {/* Swiper — portrait images */}
            <div
              onMouseEnter={onSliderPointerEnter}
              onMouseLeave={onSliderPointerLeave}
              onTouchStart={onTouchStart}
              style={{ position: "relative", zIndex: 1 }}
            >
              <Swiper
                modules={[Autoplay]}
                rewind
                slidesPerView={1}
                autoplay={autoplayConfig}
                allowTouchMove
                simulateTouch
                grabCursor
                speed={prefersReduced ? 400 : 900}
                onSwiper={onSwiperInit}
                onSlideChange={onSlideChange}
                onTouchEnd={onSliderTouchEnd}
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  aspectRatio: "3 / 4",
                  maxHeight: "min(70vh, 600px)",
                }}
              >
                {SOURCE.map((item, i) => (
                  <SwiperSlide key={item.id}>
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover select-none"
                      style={{
                        pointerEvents: "none",
                        filter: "brightness(.82) contrast(1.1) saturate(1.05)",
                      }}
                      loading={i === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Mobile-only inline drag hint — centred, auto-dismisses */}
              {touchHintVisible && (
                <div
                  className="lg:hidden absolute z-30 pointer-events-none flex items-center justify-center"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    animation: "kw-hint-in .5s ease-out both",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 24,
                      padding: "8px 18px",
                      fontSize: ".7rem",
                      fontWeight: 600,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,.85)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* Drag arrows icon */}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M18 8l4 4-4 4" />
                      <path d="M6 8l-4 4 4 4" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                    {t("cursor.drag")}
                  </span>
                </div>
              )}
            </div>

            {/* ── Quote overlay card ── */}
            <div
              className="absolute z-20 kw-quote-extend"
              style={{
                /* Mobile: inset at bottom of portrait */
                bottom: "clamp(16px, 4%, 32px)",
                left: "clamp(12px, 3%, 24px)",
                right: "clamp(12px, 3%, 24px)",
                /* Glass card */
                background: "rgba(12,12,12,0.72)",
                backdropFilter: "blur(24px) saturate(1.3)",
                WebkitBackdropFilter: "blur(24px) saturate(1.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "1rem",
                padding: "clamp(20px, 3vw, 32px)",
                pointerEvents: "auto",
              }}
            >
              <div
                key={fadeKey}
                style={{
                  animation: prefersReduced
                    ? "none"
                    : "kw-fade-in .45s ease-out both",
                }}
              >
                <QuoteIcon />
                <p
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: "clamp(.88rem, 1.1vw, 1.02rem)",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.82)",
                  }}
                >
                  {quote}
                </p>
                <div
                  className="mt-4 flex items-center gap-3"
                  style={{ flexWrap: "wrap" }}
                >
                  {/* Avatar thumbnail */}
                  <div
                    className="rounded-full overflow-hidden shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <img
                      src={current.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        filter: "grayscale(.7) brightness(.75) contrast(1.15)",
                      }}
                    />
                  </div>
                  <div>
                    <span
                      style={{
                        fontSize: ".82rem",
                        fontWeight: 600,
                        color: "#fff",
                        letterSpacing: "-.01em",
                      }}
                    >
                      {current.name}
                    </span>
                    <span
                      style={{
                        fontSize: ".78rem",
                        color: "rgba(255,255,255,.5)",
                        marginLeft: 8,
                      }}
                    >
                      {current.role}, {current.company}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress dots — one per unique source testimonial */}
              <div className="flex items-center gap-1.5 mt-5">
                {SOURCE.map((item, i) => (
                  <button
                    key={item.id}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => goTo(i)}
                    style={{
                      width: i === sourceIndex ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background:
                        i === sourceIndex
                          ? "#fff"
                          : "rgba(255,255,255,0.2)",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      transition:
                        "width .35s cubic-bezier(.22,1,.36,1), background .35s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: extend quote card to the left (overlay heading column) */}
            <style>{`
              @media (min-width: 1024px) {
                .kw-quote-extend {
                  left: -45% !important;
                  right: 12% !important;
                  bottom: 8% !important;
                }
              }
              @keyframes kw-fade-in {
                from { opacity: 0; transform: translateY(6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
              @keyframes kw-hint-in {
                0%   { opacity: 0; transform: translate(-50%, -50%) scale(.92); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
              }
            `}</style>
          </div>
        </div>

        {/* ── Mobile arrows ── */}
        <div
          className="flex lg:hidden items-center justify-center gap-4 mt-8"
          style={{ position: "relative", zIndex: 20 }}
        >
          <ArrowBtn
            direction="prev"
            onClick={goPrev}
            label="Previous testimonial"
          />
          <span
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: ".8rem",
              fontVariantNumeric: "tabular-nums",
              color: "rgba(255,255,255,.4)",
              letterSpacing: ".04em",
            }}
          >
            {String(sourceIndex + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
          <ArrowBtn
            direction="next"
            onClick={goNext}
            label="Next testimonial"
          />
        </div>
      </div>

      {/* Subtle noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </section>
  );
}
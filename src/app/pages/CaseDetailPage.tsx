import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useCursor } from "../hooks/useCursor";
import { TransitionLink } from "../components/TransitionLink";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslatedProject } from "../hooks/useTranslatedProjects";
import {
  clearTransitionFrom,
  consumeCaseTransitionOverlay,
  readTransitionFrom,
  unlockTransitionScroll,
} from "../utils/caseZoomTransition";

gsap.registerPlugin(ScrollTrigger);

function getDisplayUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

const CASE_HEADER_VAR_KEYS = [
  "--header-fg",
  "--header-fg-rgb",
  "--header-nav-bg",
  "--header-nav-border",
  "--header-nav-shadow",
  "--header-pill-bg",
  "--header-pill-border",
  "--header-pill-border-hover",
  "--header-pill-shadow-hover",
  "--header-mobile-bg",
  "--header-logo-filter",
] as const;

function clearCaseHeaderTheme() {
  const root = document.documentElement;
  CASE_HEADER_VAR_KEYS.forEach((key) => root.style.removeProperty(key));
}

function applyCaseHeaderTheme(theme: "light" | "dark", solid: boolean) {
  const root = document.documentElement;

  if (solid) {
    root.style.setProperty("--header-fg", "#fff");
    root.style.setProperty("--header-fg-rgb", "255, 255, 255");
    root.style.setProperty("--header-nav-bg", "rgba(10,10,10,.92)");
    root.style.setProperty("--header-nav-border", "1px solid rgba(255,255,255,.08)");
    root.style.setProperty(
      "--header-nav-shadow",
      "0 4px 24px rgba(0,0,0,.35), inset 0 .5px 0 rgba(255,255,255,.06)",
    );
    root.style.setProperty("--header-pill-bg", "rgba(10,10,10,.92)");
    root.style.setProperty("--header-pill-border", "1px solid rgba(255,255,255,.12)");
    root.style.setProperty(
      "--header-pill-border-hover",
      "1px solid rgba(255,255,255,.24)",
    );
    root.style.setProperty(
      "--header-pill-shadow-hover",
      "0 0 20px rgba(255,255,255,.12)",
    );
    root.style.setProperty("--header-mobile-bg", "rgba(10,10,10,.92)");
    root.style.setProperty("--header-logo-filter", "none");
    return;
  }

  if (theme === "dark") {
    root.style.setProperty("--header-fg", "#000");
    root.style.setProperty("--header-fg-rgb", "0, 0, 0");
    root.style.setProperty("--header-nav-bg", "rgba(255,255,255,.85)");
    root.style.setProperty("--header-nav-border", "1px solid rgba(0,0,0,.08)");
    root.style.setProperty(
      "--header-nav-shadow",
      "0 4px 24px rgba(0,0,0,.12), inset 0 .5px 0 rgba(255,255,255,.45)",
    );
    root.style.setProperty("--header-pill-bg", "rgba(255,255,255,.72)");
    root.style.setProperty("--header-pill-border", "1px solid rgba(0,0,0,.1)");
    root.style.setProperty(
      "--header-pill-border-hover",
      "1px solid rgba(0,0,0,.2)",
    );
    root.style.setProperty(
      "--header-pill-shadow-hover",
      "0 0 20px rgba(0,0,0,.08)",
    );
    root.style.setProperty("--header-mobile-bg", "rgba(255,255,255,.85)");
    root.style.setProperty("--header-logo-filter", "brightness(0) saturate(100%)");
    return;
  }

  clearCaseHeaderTheme();
}

export default function CaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const galleryRef = useRef<(HTMLDivElement | null)[]>([]);
  const outcomesRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { t } = useLanguage();
  const initialTransitionFrom = useMemo(() => readTransitionFrom(), []);
  const [pageCoverImage, setPageCoverImage] = useState<string | null>(
    initialTransitionFrom?.imageUrl ?? null,
  );

  const { project, projects, currentIdx } = useTranslatedProject(slug);
  const nextProject = projects[(currentIdx + 1) % projects.length];
  const prevProject = projects[(currentIdx - 1 + projects.length) % projects.length];
  const backTarget =
    (location.state as { fromPath?: string } | null)?.fromPath ?? "/work";

  useLayoutEffect(() => {
    const transitionFrom = readTransitionFrom();

    unlockTransitionScroll();
    consumeCaseTransitionOverlay();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    clearTransitionFrom();

    if (!transitionFrom?.imageUrl) {
      setPageCoverImage(null);
      return;
    }

    setPageCoverImage(transitionFrom.imageUrl);

    const timeout = window.setTimeout(() => {
      const cover = document.getElementById("pageCover");
      if (!cover) return;

      cover.style.opacity = "0";
      cover.addEventListener(
        "transitionend",
        () => {
          setPageCoverImage(null);
        },
        { once: true },
      );
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [slug]);

  useEffect(() => {
    unlockTransitionScroll();
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [slug]);

  useEffect(() => {
    if (!project) return;

    const heroSection = heroSectionRef.current;
    let headerTheme: "light" | "dark" = "light";
    let isLightImage = false;

    const updateHeaderTheme = () => {
      const threshold = (heroSection?.offsetHeight ?? 0) - 80;
      const solid = threshold > 0 && window.scrollY > threshold;
      applyCaseHeaderTheme(solid ? "light" : isLightImage ? "dark" : "light", solid);
    };

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    applyCaseHeaderTheme(headerTheme, false);

    img.onload = () => {
      if (!ctx) {
        isLightImage = false;
        headerTheme = "light";
        updateHeaderTheme();
        return;
      }

      try {
        const width = Math.max(1, img.naturalWidth || img.width || 1);
        const height = Math.max(1, Math.min(150, img.naturalHeight || img.height || 150));
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          totalR += data[i] ?? 0;
          totalG += data[i + 1] ?? 0;
          totalB += data[i + 2] ?? 0;
        }

        const averageR = totalR / pixelCount;
        const averageG = totalG / pixelCount;
        const averageB = totalB / pixelCount;
        const yiq =
          (averageR * 299 + averageG * 587 + averageB * 114) / 1000;

        isLightImage = yiq >= 128;
        headerTheme = isLightImage ? "dark" : "light";
        updateHeaderTheme();
      } catch {
        isLightImage = false;
        headerTheme = "light";
        updateHeaderTheme();
      }
    };

    img.onerror = () => {
      isLightImage = false;
      headerTheme = "light";
      updateHeaderTheme();
    };

    img.src = project.thumbnail;
    window.addEventListener("scroll", updateHeaderTheme, { passive: true });
    window.addEventListener("resize", updateHeaderTheme);
    updateHeaderTheme();

    return () => {
      window.removeEventListener("scroll", updateHeaderTheme);
      window.removeEventListener("resize", updateHeaderTheme);
      clearCaseHeaderTheme();
    };
  }, [project]);

  useEffect(() => {
    if (!project) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: titleRef.current, start: "top 85%", once: true },
          },
        );
      }

      if (overviewRef.current) {
        gsap.fromTo(
          overviewRef.current,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: overviewRef.current, start: "top 88%", once: true },
          },
        );
      }

      galleryRef.current.forEach((item, i) => {
        if (!item) return;
        gsap.fromTo(
          item,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 90%", once: true },
          },
        );
      });

      if (outcomesRef.current) {
        gsap.fromTo(
          outcomesRef.current,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: outcomesRef.current, start: "top 85%", once: true },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [project, slug]);

  const handleBackNavigation = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      navigate(backTarget);
    },
    [backTarget, navigate],
  );

  if (!project) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--page-fg)",
            }}
          >
            {t("case.notFound")}
          </h1>
          <TransitionLink
            to="/work"
            className="mt-6 inline-block px-6 py-2 rounded-full"
            style={{
              fontSize: ".78rem",
              fontWeight: 500,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .5)",
              border: "1px solid rgba(var(--page-fg-rgb), .2)",
            }}
          >
            {t("case.back")}
          </TransitionLink>
        </div>
      </section>
    );
  }

  const detailServices = project.tags.join(", ");

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      {pageCoverImage ? (
        <div
          id="pageCover"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundImage: `url(${pageCoverImage})`,
            zIndex: 9998,
            opacity: 1,
            transition: "opacity 0.5s ease",
            pointerEvents: "none",
          }}
        />
      ) : null}

      <section
        ref={heroSectionRef}
        className="relative w-full overflow-hidden"
        style={{ position: "relative", width: "100%", height: "100vh", minHeight: "100vh", maxHeight: "none", overflow: "hidden", margin: 0, padding: 0 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${project.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              transform: "none",
              willChange: "auto",
            }}
          />
        </div>
      </section>

      <section style={{ padding: "40px 6vw 24px", maxWidth: 900 }}>
        <div className="mx-auto flex max-w-[900px] flex-col gap-4">
          <a
            href={backTarget}
            className="inline-flex w-fit items-center gap-2 group"
            style={{
              fontSize: ".68rem",
              fontWeight: 500,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .4)",
              transition: "color .3s",
            }}
            onClick={handleBackNavigation}
            onMouseEnter={() => cursor.set("link", t("cursor.back"))}
            onMouseLeave={() => cursor.reset()}
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
            {t("case.back")}
          </a>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full px-3.5 py-1.5"
                style={{
                  fontSize: ".68rem",
                  fontWeight: 500,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .8)",
                  background: "rgba(var(--page-fg-rgb), .06)",
                  border: "1px solid rgba(var(--page-fg-rgb), .14)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            ref={titleRef}
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "clamp(2rem,6vw,4.5rem)",
              fontWeight: 700,
              letterSpacing: "-.05em",
              color: "var(--page-fg)",
              lineHeight: 1.04,
            }}
          >
            {project.title}
          </h1>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full transition-colors duration-300"
              style={{
                padding: "12px 24px",
                background: "rgba(var(--page-fg-rgb), .07)",
                border: "1px solid rgba(var(--page-fg-rgb), .2)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                fontFamily: "'Inter',sans-serif",
                fontSize: ".8rem",
                fontWeight: 500,
                letterSpacing: ".06em",
                color: "var(--page-fg)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .15)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .35)";
                cursor.set("link", t("case.visit"));
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(var(--page-fg-rgb), .07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .2)";
                cursor.reset();
              }}
            >
              <span style={{ textTransform: "uppercase" }}>{t("case.visit")}</span>
              <span style={{ textTransform: "none" }}>{getDisplayUrl(project.url)}</span>
              <ExternalLink size={14} style={{ opacity: 0.7 }} />
            </a>
          )}

          <p
            style={{
              fontSize: ".78rem",
              color: "rgba(var(--page-fg-rgb), .42)",
              margin: 0,
            }}
          >
            {project.category} &middot; {project.year}
          </p>
        </div>
      </section>

      <section style={{ padding: "40px 6vw 100px", maxWidth: 860, margin: "0 auto" }}>
        <div className="mx-auto max-w-[860px]">
          <div>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              {t("case.overview")}
            </p>
            <p
              ref={overviewRef}
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(1.05rem,2vw,1.4rem)",
                fontStyle: "italic",
                lineHeight: 1.75,
                color: "rgba(var(--page-fg-rgb), .72)",
                marginBottom: 64,
              }}
            >
              {project.overview}
            </p>
          </div>

          <div
            className="grid grid-cols-1 gap-8 sm:grid-cols-3"
            style={{ borderTop: "1px solid rgba(var(--page-fg-rgb), .08)", paddingTop: 24 }}
          >
            <div className="flex flex-col gap-1.5">
              <span
                style={{
                  fontSize: ".62rem",
                  letterSpacing: ".12em",
                  color: "rgba(var(--page-fg-rgb), .35)",
                  textTransform: "uppercase",
                }}
              >
                {t("case.client")}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--page-fg)",
                }}
              >
                {project.title}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span
                style={{
                  fontSize: ".62rem",
                  letterSpacing: ".12em",
                  color: "rgba(var(--page-fg-rgb), .35)",
                  textTransform: "uppercase",
                }}
              >
                {t("case.services")}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--page-fg)",
                }}
              >
                {detailServices}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span
                style={{
                  fontSize: ".62rem",
                  letterSpacing: ".12em",
                  color: "rgba(var(--page-fg-rgb), .35)",
                  textTransform: "uppercase",
                }}
              >
                {t("case.year")}
              </span>
              <span
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--page-fg)",
                }}
              >
                {project.year}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.gallery.map((img, i) => (
            <div
              key={i}
              ref={(el) => {
                galleryRef.current[i] = el;
              }}
              className="relative overflow-hidden rounded-xl"
              style={{
                opacity: 0,
                border: "1px solid rgba(var(--page-fg-rgb), .06)",
              }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={img}
                  alt={`${project.title} gallery ${i + 1}`}
                  className="w-full h-full object-cover"
                  style={{
                    filter: "grayscale(.7) brightness(.6) contrast(1.05)",
                  }}
                  loading="lazy"
                />
              </div>
              <svg
                className="absolute top-3 left-3 w-6 h-6 pointer-events-none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M0 10 L0 0 L10 0"
                  stroke="rgba(var(--page-fg-rgb), .12)"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
              <svg
                className="absolute bottom-3 right-3 w-6 h-6 pointer-events-none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M24 14 L24 24 L14 24"
                  stroke="rgba(var(--page-fg-rgb), .12)"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 md:px-12 pb-16 md:pb-24">
        <div
          ref={outcomesRef}
          className="p-8 md:p-12 rounded-xl"
          style={{
            background: "rgba(var(--page-fg-rgb), .02)",
            border: "1px solid rgba(var(--page-fg-rgb), .06)",
            opacity: 0,
          }}
        >
          <span
            style={{
              fontSize: ".7rem",
              fontWeight: 500,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .45)",
            }}
          >
            {t("case.outcomes")}
          </span>
          <ul className="mt-6 space-y-4">
            {project.outcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(var(--page-fg-rgb), .25)" }}
                />
                <span
                  style={{
                    fontSize: ".88rem",
                    lineHeight: 1.6,
                    color: "rgba(var(--page-fg-rgb), .6)",
                  }}
                >
                  {outcome}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="border-t"
        style={{ borderColor: "rgba(var(--page-fg-rgb), .04)" }}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-2 gap-4">
          <TransitionLink
            to={`/work/${prevProject.slug}`}
            className="group flex flex-col items-start"
            onMouseEnter={() => cursor.set("link", t("cursor.previous"))}
            onMouseLeave={() => cursor.reset()}
          >
            <span
              className="flex items-center gap-2 mb-2"
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform duration-300" />
              {t("case.previous")}
            </span>
            <span
              className="transition-colors duration-300"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(.9rem,1.5vw,1.1rem)",
                fontWeight: 600,
                color: "rgba(var(--page-fg-rgb), .5)",
                letterSpacing: "-.02em",
              }}
            >
              {prevProject.title}
            </span>
          </TransitionLink>

          <TransitionLink
            to={`/work/${nextProject.slug}`}
            className="group flex flex-col items-end text-right"
            onMouseEnter={() => cursor.set("link", t("cursor.next"))}
            onMouseLeave={() => cursor.reset()}
          >
            <span
              className="flex items-center gap-2 mb-2"
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              {t("case.next")}
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <span
              className="transition-colors duration-300"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(.9rem,1.5vw,1.1rem)",
                fontWeight: 600,
                color: "rgba(var(--page-fg-rgb), .5)",
                letterSpacing: "-.02em",
              }}
            >
              {nextProject.title}
            </span>
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}

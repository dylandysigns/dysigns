import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useCursor } from "../hooks/useCursor";
import { TransitionLink } from "../components/TransitionLink";
import { useLanguage } from "../hooks/useLanguage";
import { useTranslatedProject } from "../hooks/useTranslatedProjects";

gsap.registerPlugin(ScrollTrigger);

export default function CaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const sectionRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const overviewRef = useRef<HTMLParagraphElement>(null);
  const galleryRef = useRef<(HTMLDivElement | null)[]>([]);
  const outcomesRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { t } = useLanguage();

  const { project, projects, currentIdx } = useTranslatedProject(slug);
  const nextProject = projects[(currentIdx + 1) % projects.length];
  const prevProject = projects[(currentIdx - 1 + projects.length) % projects.length];

  useEffect(() => {
    if (!project) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (heroImgRef.current) {
        gsap.fromTo(
          heroImgRef.current,
          { y: 0, scale: 1.05 },
          {
            y: -40,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: heroImgRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      }

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

  if (!project) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {t("case.notFound")}
          </h1>
          <TransitionLink
            to="/work"
            className="mt-6 inline-block px-6 py-2 rounded-full border border-white/20"
            style={{
              fontSize: ".78rem",
              fontWeight: 500,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.5)",
            }}
          >
            {t("case.back")}
          </TransitionLink>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ background: "#000", minHeight: "100vh" }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "70vh", minHeight: 400 }}
      >
        <div ref={heroImgRef} className="absolute inset-[-5%]">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{
              filter: "grayscale(.85) brightness(.55) contrast(1.1)",
            }}
            loading="eager"
          />
        </div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #000 0%, rgba(0,0,0,.4) 40%, rgba(0,0,0,.2) 100%)",
          }}
        />
        <TransitionLink
          to="/work"
          className="absolute top-24 left-6 md:left-12 z-10 flex items-center gap-2 group"
          style={{
            fontSize: ".68rem",
            fontWeight: 500,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.4)",
            transition: "color .3s",
          }}
          onMouseEnter={() => cursor.set("link", t("cursor.back"))}
          onMouseLeave={() => cursor.reset()}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
          {t("case.back")}
        </TransitionLink>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16 z-10">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: ".58rem",
                    fontWeight: 500,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.5)",
                    background: "rgba(255,255,255,.08)",
                    border: "1px solid rgba(255,255,255,.08)",
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
                fontSize: "clamp(2rem,5vw,3.5rem)",
                fontWeight: 700,
                letterSpacing: "-.04em",
                color: "#fff",
                lineHeight: 1.1,
              }}
            >
              {project.title}
            </h1>
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 rounded-full transition-colors duration-300 group/visit"
                style={{
                  padding: "10px 20px",
                  background: "rgba(255,255,255,.08)",
                  border: "2px solid rgba(255,255,255,.08)",
                  fontFamily: "'Inter',sans-serif",
                  fontSize: ".82rem",
                  fontWeight: 500,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.5)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.14)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.16)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.8)";
                  cursor.set("link", t("case.visit"));
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.08)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.5)";
                  cursor.reset();
                }}
              >
                {t("case.visit")}
                <ExternalLink size={13} style={{ opacity: 0.6 }} />
              </a>
            )}
            <p
              className="mt-2"
              style={{
                fontSize: ".72rem",
                color: "rgba(255,255,255,.3)",
              }}
            >
              {project.category} &middot; {project.year}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <span
          style={{
            fontSize: ".7rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.45)",
          }}
        >
          {t("case.overview")}
        </span>
        <p
          ref={overviewRef}
          className="mt-4"
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: "clamp(1rem,1.5vw,1.2rem)",
            fontStyle: "italic",
            lineHeight: 1.75,
            color: "rgba(255,255,255,.6)",
          }}
        >
          {project.overview}
        </p>
        <div
          className="mt-8"
          style={{ width: 40, height: 1, background: "rgba(255,255,255,.08)" }}
        />
      </div>

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
                border: "1px solid rgba(255,255,255,.06)",
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
                  stroke="rgba(255,255,255,.12)"
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
                  stroke="rgba(255,255,255,.12)"
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
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.06)",
            opacity: 0,
          }}
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
            {t("case.outcomes")}
          </span>
          <ul className="mt-6 space-y-4">
            {project.outcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,.25)" }}
                />
                <span
                  style={{
                    fontSize: ".88rem",
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,.6)",
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
        style={{ borderColor: "rgba(255,255,255,.04)" }}
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
                color: "rgba(255,255,255,.45)",
              }}
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform duration-300" />
              {t("case.previous")}
            </span>
            <span
              className="group-hover:text-white transition-colors duration-300"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(.9rem,1.5vw,1.1rem)",
                fontWeight: 600,
                color: "rgba(255,255,255,.5)",
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
                color: "rgba(255,255,255,.45)",
              }}
            >
              {t("case.next")}
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <span
              className="group-hover:text-white transition-colors duration-300"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(.9rem,1.5vw,1.1rem)",
                fontWeight: 600,
                color: "rgba(255,255,255,.5)",
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
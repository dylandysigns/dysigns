import { useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useParams } from "react-router";
import { TransitionLink } from "../components/TransitionLink";
import {
  getServiceDefinitionBySlug,
  projectMatchesService,
} from "../data/serviceTaxonomy";
import { projects as rawProjects } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { useLanguage } from "../hooks/useLanguage";
import { useSiteContent } from "../hooks/useSiteContent";
import { useTranslatedProjects } from "../hooks/useTranslatedProjects";

function getProjectYear(value: string): number {
  const match = value.match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[1]) : 0;
}

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const cursor = useCursor();
  const { t } = useLanguage();
  const content = useSiteContent();
  const translatedProjects = useTranslatedProjects();

  const service = getServiceDefinitionBySlug(slug);

  const serviceContent = service
    ? content.services[service.contentIndex]
    : undefined;

  const relatedProjects = useMemo(() => {
    if (!service) return [];

    return translatedProjects
      .map((project, index) => ({
        project,
        year: getProjectYear(rawProjects[index].year),
      }))
      .filter(({ project }, index) =>
        projectMatchesService(rawProjects[index], service.slug),
      )
      .sort((a, b) => b.year - a.year)
      .map(({ project }) => project);
  }, [service, translatedProjects]);

  if (!service || !serviceContent) {
    return (
      <section className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Inter',sans-serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--page-fg)",
            }}
          >
            {t("services.notFound")}
          </h1>
          <TransitionLink
            to="/services"
            className="mt-6 inline-block px-6 py-2 rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
            style={{
              fontSize: ".78rem",
              fontWeight: 500,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "rgba(var(--page-fg-rgb), .5)",
              border: "1px solid rgba(var(--page-fg-rgb), .2)",
            }}
          >
            {t("services.back")}
          </TransitionLink>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative pt-32 pb-24 md:pb-32 px-6 md:px-12 lg:px-16"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <TransitionLink
          to="/services"
          className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35 rounded-full px-3 py-2"
          style={{
            fontSize: ".68rem",
            fontWeight: 600,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
          onMouseEnter={() => cursor.set("link", t("services.back"))}
          onMouseLeave={() => cursor.reset()}
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
          {t("services.back")}
        </TransitionLink>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-10 lg:gap-14 items-start">
          <div>
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              {t("services.label")}
            </span>
            <h1
              className="mt-3"
              style={{
                fontFamily: "'Inter',sans-serif",
                fontSize: "clamp(2.1rem,5vw,3.7rem)",
                fontWeight: 700,
                letterSpacing: "-.04em",
                color: "var(--page-fg)",
                lineHeight: 1.06,
              }}
            >
              {serviceContent.title}
            </h1>
            <p
              className="mt-6"
              style={{
                maxWidth: "42rem",
                fontSize: "1rem",
                lineHeight: 1.85,
                color: "rgba(var(--page-fg-rgb), .62)",
              }}
            >
              {serviceContent.description}
            </p>

          </div>

          <div
            className="rounded-2xl p-6 md:p-7"
            style={{
              border: "1px solid rgba(var(--page-fg-rgb), .08)",
              background: "rgba(var(--page-fg-rgb), .025)",
            }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span
                style={{
                  fontSize: ".66rem",
                  fontWeight: 600,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(var(--page-fg-rgb), .38)",
                }}
              >
                {t("services.related")}
              </span>
              <span
                style={{
                  fontSize: ".72rem",
                  color: "rgba(var(--page-fg-rgb), .38)",
                }}
              >
                {relatedProjects.length}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {relatedProjects.length > 0 ? (
                relatedProjects.slice(0, 3).map((project) => (
                  <TransitionLink
                    key={project.slug}
                    to={`/work/${project.slug}`}
                    className="group rounded-xl p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                    style={{
                      border: "1px solid rgba(var(--page-fg-rgb), .07)",
                      background: "rgba(var(--page-fg-rgb), .02)",
                    }}
                    onMouseEnter={() => cursor.set("view", t("cursor.viewProject"))}
                    onMouseLeave={() => cursor.reset()}
                  >
                    <p
                      style={{
                        fontSize: ".8rem",
                        fontWeight: 700,
                        color: "var(--page-fg)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {project.title}
                    </p>
                    <p
                      className="mt-1"
                      style={{
                        fontSize: ".72rem",
                        lineHeight: 1.6,
                        color: "rgba(var(--page-fg-rgb), .5)",
                      }}
                    >
                      {project.category} · {project.year}
                    </p>
                  </TransitionLink>
                ))
              ) : (
                <p
                  style={{
                    fontSize: ".85rem",
                    lineHeight: 1.7,
                    color: "rgba(var(--page-fg-rgb), .54)",
                  }}
                >
                  {t("services.emptyRelated")}
                </p>
              )}
            </div>

            <TransitionLink
              to="/work"
              className="group mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
              style={{
                fontSize: ".72rem",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--page-fg)",
                border: "1px solid rgba(var(--page-fg-rgb), .16)",
                background: "rgba(var(--page-fg-rgb), .04)",
              }}
              onMouseEnter={() => cursor.set("link", t("services.viewRelatedWork"))}
              onMouseLeave={() => cursor.reset()}
            >
              {t("services.viewRelatedWork")}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </TransitionLink>
          </div>
        </div>

        <div className="mt-16 md:mt-20">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <span
              style={{
                fontSize: ".7rem",
                fontWeight: 500,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              {t("services.related")}
            </span>
            <TransitionLink
              to="/services"
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35 rounded-full px-3 py-2"
              style={{
                fontSize: ".66rem",
                fontWeight: 600,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "rgba(var(--page-fg-rgb), .45)",
              }}
            >
              {t("services.allServices")}
            </TransitionLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedProjects.length > 0 ? (
              relatedProjects.slice(0, 3).map((project) => (
                <TransitionLink
                  key={project.slug}
                  to={`/work/${project.slug}`}
                  className="group block rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/35"
                  style={{
                    border: "1px solid rgba(var(--page-fg-rgb), .06)",
                    background: "rgba(var(--page-fg-rgb), .02)",
                  }}
                  onMouseEnter={() => cursor.set("view", t("cursor.viewProject"))}
                  onMouseLeave={() => cursor.reset()}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: "grayscale(.75) brightness(.7) contrast(1.05)" }}
                    />
                  </div>
                  <div className="p-4">
                    <p
                      style={{
                        fontSize: ".82rem",
                        fontWeight: 700,
                        color: "var(--page-fg)",
                        letterSpacing: "-.02em",
                      }}
                    >
                      {project.title}
                    </p>
                    <p
                      className="mt-1"
                      style={{
                        fontSize: ".72rem",
                        color: "rgba(var(--page-fg-rgb), .5)",
                      }}
                    >
                      {project.category} · {project.year}
                    </p>
                  </div>
                </TransitionLink>
              ))
            ) : (
              <div
                className="rounded-xl p-6 md:col-span-3"
                style={{
                  border: "1px solid rgba(var(--page-fg-rgb), .07)",
                  background: "rgba(var(--page-fg-rgb), .02)",
                }}
              >
                <p
                  style={{
                    fontSize: ".9rem",
                    lineHeight: 1.7,
                    color: "rgba(var(--page-fg-rgb), .54)",
                  }}
                >
                  {t("services.emptyRelated")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

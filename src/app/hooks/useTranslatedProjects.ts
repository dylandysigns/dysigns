import { useMemo } from "react";
import { useLanguage } from "./useLanguage";
import { projects as rawProjects, type Project } from "../data/projects";

/**
 * Returns the projects array with all text fields translated to the active language.
 *
 * Translates: title, category, tags[], overview, outcomes[].
 * Static fields (slug, year, thumbnail, gallery) stay untouched.
 *
 * Translation keys follow this pattern:
 *   project.<slug>.title
 *   project.<slug>.overview
 *   project.<slug>.outcome.<index>
 *   category.<rawCategory>
 *   tag.<rawTag>
 */
export function useTranslatedProjects(): Project[] {
  const { t } = useLanguage();

  return useMemo(
    () =>
      rawProjects.map((p) => ({
        ...p,
        title: t(`project.${p.slug}.title`),
        category: t(`category.${p.category}`),
        tags: p.tags.map((tag) => t(`tag.${tag}`)),
        overview: t(`project.${p.slug}.overview`),
        outcomes: p.outcomes.map((_, i) => t(`project.${p.slug}.outcome.${i}`)),
      })),
    [t],
  );
}

/**
 * Helper: find a translated project by slug.
 * Uses the raw slug (never translated) for lookup.
 */
export function useTranslatedProject(slug: string | undefined): {
  project: Project | undefined;
  projects: Project[];
  currentIdx: number;
} {
  const projects = useTranslatedProjects();
  const currentIdx = projects.findIndex((p) => p.slug === slug);
  const project = currentIdx >= 0 ? projects[currentIdx] : undefined;
  return { project, projects, currentIdx };
}

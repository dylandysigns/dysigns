import { useMemo } from "react";
import { useLanguage } from "./useLanguage";
import { siteContent as baseContent } from "../data/content";
import { projects as rawProjects } from "../data/projects";

/**
 * Returns siteContent with all user-facing text translated to the active language.
 * Static data (images, URLs, emails) stays the same.
 * Components can swap `import { siteContent }` → `const siteContent = useSiteContent()`.
 */

/* Map content.ts project titles to projects.ts slugs for i18n key lookup */
const titleToSlug: Record<string, string> = {};
rawProjects.forEach((p) => {
  titleToSlug[p.title] = p.slug;
});

export function useSiteContent() {
  const { t } = useLanguage();

  return useMemo(
    () => ({
      hero: {
        ...baseContent.hero,
        headline: t("hero.headline.A"),
        sub: t("hero.sub"),
        cta1: t("hero.cta1"),
        cta2: t("hero.cta2"),
      },
      trustedBy: baseContent.trustedBy,
      projects: baseContent.projects.map((p) => {
        const slug = titleToSlug[p.title];
        return {
          ...p,
          title: slug ? t(`project.${slug}.title`) : p.title,
          category: t(`category.${p.category}`),
          tags: p.tags.map((tag) => t(`tag.${tag}`)),
        };
      }),
      vision: {
        ...baseContent.vision,
        title: t("vision.title"),
        text: t("vision.text"),
      },
      designProcess: baseContent.designProcess.map((step, i) => ({
        ...step,
        title: t(`timeline.${i}.title`),
        description: t(`timeline.${i}.desc`),
      })),
      services: baseContent.services.map((s, i) => ({
        ...s,
        title: t(`services.${i}.title`),
        description: t(`services.${i}.desc`),
      })),
      testimonials: baseContent.testimonials,
      contact: {
        ...baseContent.contact,
        headline: t("contact.headline"),
        sub: t("contact.sub"),
      },
      socials: baseContent.socials,
    }),
    [t],
  );
}

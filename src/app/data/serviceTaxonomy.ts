import { type Project } from "./projects";

export type ServiceSlug =
  | "brand-identity"
  | "ux-ui-web-design"
  | "product-design"
  | "creative-thinking";

export interface ServiceDefinition {
  slug: ServiceSlug;
  contentIndex: number;
  rawCategories: string[];
  rawTags: string[];
}

export const serviceDefinitions: ServiceDefinition[] = [
  {
    slug: "brand-identity",
    contentIndex: 0,
    rawCategories: ["Branding"],
    rawTags: ["Brand Identity", "Print"],
  },
  {
    slug: "ux-ui-web-design",
    contentIndex: 1,
    rawCategories: ["Web"],
    rawTags: ["Web Design", "UX Design", "E-Commerce", "Development"],
  },
  {
    slug: "product-design",
    contentIndex: 2,
    rawCategories: ["Product"],
    rawTags: ["Product Design", "Mobile App", "Dashboard", "SaaS", "Data Viz", "Design System"],
  },
  {
    slug: "creative-thinking",
    contentIndex: 3,
    rawCategories: [],
    rawTags: ["Creative Direction", "Photography", "Motion Design"],
  },
];

const serviceBySlug = new Map(serviceDefinitions.map((service) => [service.slug, service]));
const tagToServiceSlug = new Map<string, ServiceSlug>();

serviceDefinitions.forEach((service) => {
  service.rawTags.forEach((tag) => {
    tagToServiceSlug.set(tag, service.slug);
  });
});

export function getServiceDefinitionBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return serviceBySlug.get(slug as ServiceSlug);
}

export function getServiceSlugForTag(tag: string) {
  return tagToServiceSlug.get(tag);
}

export function getServiceSlugsForProject(project: Pick<Project, "category" | "tags">) {
  const matches = new Set<ServiceSlug>();

  project.tags.forEach((tag) => {
    const mapped = getServiceSlugForTag(tag);
    if (mapped) matches.add(mapped);
  });

  if (matches.size === 0) {
    serviceDefinitions.forEach((service) => {
      if (service.rawCategories.includes(project.category)) {
        matches.add(service.slug);
      }
    });
  }

  return Array.from(matches);
}

export function projectMatchesService(
  project: Pick<Project, "category" | "tags">,
  serviceSlug: ServiceSlug,
) {
  return getServiceSlugsForProject(project).includes(serviceSlug);
}

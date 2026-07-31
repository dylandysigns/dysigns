// Loads content/**/*.md at build time via Vite's native `?raw` import
// (no bundler plugin needed) and parses frontmatter + markdown body once.
// Works identically in the browser bundle and under Node during
// scripts/prerender.mjs, since both go through Vite's module graph.

import { marked } from "marked";
import { parseFrontmatter, type Frontmatter } from "./frontmatter";

export interface ContentEntry {
  frontmatter: Frontmatter;
  bodyHtml: string;
}

const rawModules = import.meta.glob("/content/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const entriesByPath = new Map<string, ContentEntry>();

for (const [path, raw] of Object.entries(rawModules)) {
  const { frontmatter, body } = parseFrontmatter(raw);
  entriesByPath.set(path, {
    frontmatter,
    bodyHtml: marked.parse(body, { async: false }) as string,
  });
}

function findByPathSuffix(suffix: string): ContentEntry | undefined {
  for (const [path, entry] of entriesByPath) {
    if (path.endsWith(suffix)) return entry;
  }
  return undefined;
}

export function getContent(relativePath: string): ContentEntry {
  const entry = findByPathSuffix(`/content/${relativePath}`);
  if (!entry) {
    throw new Error(`Content file not found: content/${relativePath}`);
  }
  return entry;
}

export function getCaseSlugs(): string[] {
  return Array.from(entriesByPath.keys())
    .filter((path) => path.includes("/content/cases/"))
    .map((path) => path.split("/").pop()!.replace(/\.md$/, ""));
}

export function getAllCases(): ContentEntry[] {
  return getCaseSlugs()
    .map((slug) => getContent(`cases/${slug}.md`))
    .sort((a, b) => a.frontmatter.title.localeCompare(b.frontmatter.title));
}

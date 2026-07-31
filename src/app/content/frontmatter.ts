// Minimal frontmatter parser — no dependency needed for this: the format
// used across content/*.md is a flat `key: value` block between two `---`
// lines, which a tiny parser handles reliably. (Markdown body parsing is a
// different, much harder problem — that's what `marked` is for, see
// loadContent.ts.)

export interface Frontmatter {
  title: string;
  description: string;
  slug: string;
  answerBlock: string;
  lastUpdated: string;
  [key: string]: string;
}

export interface ParsedContent {
  frontmatter: Frontmatter;
  body: string;
}

export function parseFrontmatter(raw: string): ParsedContent {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Content file is missing a --- frontmatter block.");
  }

  const [, frontmatterBlock, body] = match;
  const frontmatter = {} as Frontmatter;

  // Supports simple `key: value` lines and multi-line values written as
  // `key: |` followed by indented lines (used for answerBlock, which is a
  // full paragraph).
  const lines = frontmatterBlock.split(/\r?\n/);
  let currentKey: string | null = null;
  let multilineBuffer: string[] = [];

  const flush = () => {
    if (currentKey) {
      frontmatter[currentKey] = multilineBuffer.join(" ").trim();
    }
    currentKey = null;
    multilineBuffer = [];
  };

  for (const line of lines) {
    const blockStart = line.match(/^([a-zA-Z0-9_]+):\s*\|\s*$/);
    if (blockStart) {
      flush();
      currentKey = blockStart[1];
      continue;
    }

    if (currentKey && /^\s+\S/.test(line)) {
      multilineBuffer.push(line.trim());
      continue;
    }

    const kv = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (kv) {
      flush();
      const [, key, value] = kv;
      frontmatter[key] = value.trim().replace(/^["']|["']$/g, "");
      continue;
    }
  }
  flush();

  return { frontmatter, body: body.trim() };
}

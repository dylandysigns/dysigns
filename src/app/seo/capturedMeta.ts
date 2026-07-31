import type { PageMeta } from "./meta";

// Module-level capture slot. The <Seo> component writes to this during
// render (not in an effect, so it also runs under renderToStaticMarkup,
// which never fires effects). scripts/prerender.mjs resets this before
// rendering each route and reads it right after — safe because
// prerendering is single-threaded and strictly one route at a time.
let captured: PageMeta | null = null;

export function setCapturedMeta(meta: PageMeta) {
  captured = meta;
}

export function getCapturedMeta(): PageMeta | null {
  return captured;
}

export function resetCapturedMeta() {
  captured = null;
}

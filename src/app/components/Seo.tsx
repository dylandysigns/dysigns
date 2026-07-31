import { useEffect } from "react";
import {
  type PageMeta,
  canonicalUrl,
  OG_IMAGE,
  DEFAULT_ROBOTS,
} from "../seo/meta";
import { setCapturedMeta } from "../seo/capturedMeta";

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonicalLink(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Seo — per-page head values (fase 3).
 *
 * The site is prerendered (fase 1): each route's <head> is baked into
 * static HTML by scripts/prerender.mjs, which reads the PageMeta this
 * component registers during render (captured synchronously, works
 * under renderToStaticMarkup where effects never fire). The useEffect
 * below additionally keeps <head> correct in the browser when the SPA
 * navigates between pages client-side (TransitionLink, no full reload) —
 * without it, a client-side navigation would leave the previous page's
 * prerendered <head> in place.
 */
export function Seo(meta: PageMeta) {
  setCapturedMeta(meta);

  useEffect(() => {
    document.title = meta.title;
    setMetaByName("description", meta.description);
    setMetaByName("robots", meta.robots ?? DEFAULT_ROBOTS);
    setCanonicalLink(canonicalUrl(meta.path));
    setMetaByProperty("og:title", meta.title);
    setMetaByProperty("og:description", meta.description);
    setMetaByProperty("og:url", canonicalUrl(meta.path));
    setMetaByProperty("og:type", meta.ogType ?? "website");
    setMetaByProperty("og:image", OG_IMAGE);
    setMetaByProperty("og:locale", "nl_NL");
    setMetaByProperty("og:locale:alternate", "en_US");
    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:title", meta.title);
    setMetaByName("twitter:description", meta.description);
    setMetaByName("twitter:image", OG_IMAGE);
  }, [meta.title, meta.description, meta.path, meta.ogType, meta.robots]);

  return null;
}

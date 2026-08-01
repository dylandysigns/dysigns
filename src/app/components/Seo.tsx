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

const SITE_SCHEMA_SCRIPT_ID = "site-schema";

// The site-wide graph (Person, Organization, LocalBusiness, WebSite) as
// originally server-rendered — captured once, before this module's own
// mutations touch the DOM, so repeated SPA navigations always merge
// page-specific nodes onto the pristine base instead of onto whatever
// the previous page already merged in (which would accumulate forever).
let baseGraph: object[] | null = null;

function setPageSchema(nodes: object[] | undefined) {
  const el = document.getElementById(SITE_SCHEMA_SCRIPT_ID) as HTMLScriptElement | null;
  if (!el) return; // shouldn't happen — index.html always ships this script

  if (baseGraph === null) {
    baseGraph = (JSON.parse(el.textContent || "{}")["@graph"] ?? []) as object[];
  }

  const graph = nodes && nodes.length > 0 ? [...baseGraph, ...nodes] : baseGraph;
  el.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
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
    setPageSchema(meta.schema);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- schema is a
    // freshly-built array of object literals on every render; comparing
    // its JSON string (not the reference) avoids re-running this effect
    // on every render while still reacting to actual content changes.
  }, [meta.title, meta.description, meta.path, meta.ogType, meta.robots, JSON.stringify(meta.schema)]);

  return null;
}

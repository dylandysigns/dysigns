import { useEffect, useState } from "react";

const CACHE_KEY = "dysigns_visitor_city";

/**
 * Approximate city of the visitor, from /api/geo (a Cloudflare Pages
 * Function that resolves it from the request IP at the edge). Returns null
 * until known, and stays null when the endpoint is unavailable (local dev,
 * unknown location, network error), so callers should render a fallback.
 */
export function useVisitorCity(): string | null {
  const [city, setCity] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(CACHE_KEY) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (city) return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);

    fetch("/api/geo", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const value = data?.city;
        if (typeof value !== "string" || !value || value.length > 60) return;
        setCity(value);
        try {
          sessionStorage.setItem(CACHE_KEY, value);
        } catch {}
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [city]);

  return city;
}

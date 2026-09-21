import { useEffect, useRef } from "react";

const SITE_KEY = (import.meta as unknown as { env: Record<string, string | undefined> }).env
  .VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}

let scriptPromise: Promise<void> | null = null;

function loadScript() {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Cloudflare Turnstile CAPTCHA for the contact form. Invisible unless
 * Cloudflare needs an interaction; it adds a hidden `cf-turnstile-response`
 * input to the enclosing <form>, which functions/api/contact.js verifies.
 * Renders nothing when VITE_TURNSTILE_SITE_KEY isn't set.
 */
export function TurnstileWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
        if (cancelled || !ref.current || !api) return;
        id = api.render(ref.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          appearance: "interaction-only",
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (id && api) api.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="mt-4" />;
}

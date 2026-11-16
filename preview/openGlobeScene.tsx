import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import type { GlobeOrigin } from "./GlobeScene";
import type { useLanguage } from "../src/app/hooks/useLanguage";

/* Opens the globe scene in a React root of its own, outside the page that opened it: the call to
   action in it flies on to another page, the page that opened it is gone by then, and the scene must
   stay until its sky has let go. It is used by the globe in the hero ("projects": where we have
   worked) and by the contact form once a message has been sent ("thanks": the same scene, with the
   thank-you as its title). */
const GlobeScene = lazy(() => import("./GlobeScene"));

export function openGlobeScene(opts: {
  mode: "projects" | "thanks";
  origin: GlobeOrigin | null;
  t: ReturnType<typeof useLanguage>["t"];
  lang: string;
  navigateTo: (path: string, opts?: { instant?: boolean }) => void;
  onClosed?: () => void;
}) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  const close = () => {
    // after the current call: React does not like a root that unmounts itself in the middle of a render
    window.setTimeout(() => {
      root.unmount();
      host.remove();
      opts.onClosed?.();
    }, 0);
  };
  root.render(
    <Suspense fallback={null}>
      <GlobeScene mode={opts.mode} origin={opts.origin} onClose={close} t={opts.t} lang={opts.lang} navigateTo={opts.navigateTo} />
    </Suspense>,
  );
}

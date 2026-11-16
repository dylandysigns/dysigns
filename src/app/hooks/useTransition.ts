import { createContext, useContext } from "react";

export interface TransitionAPI {
  /** `instant`: change the page at once, with no transition of the site's own. For a caller that
   * brings its own flight (the globe scene's sideways flight, see preview/sideFlight.ts). */
  navigateTo: (path: string, opts?: { instant?: boolean }) => void;
}

export const TransitionContext = createContext<TransitionAPI>({
  navigateTo: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

import { createContext, useContext } from "react";

export interface TransitionAPI {
  navigateTo: (path: string) => void;
}

export const TransitionContext = createContext<TransitionAPI>({
  navigateTo: () => {},
});

export const usePageTransition = () => useContext(TransitionContext);

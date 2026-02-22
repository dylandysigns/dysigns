import { createContext, useContext } from "react";

export type CursorVariant =
  | "default"
  | "link"
  | "view"
  | "drag"
  | "play"
  | "hidden";

export interface CursorAPI {
  set: (variant: CursorVariant, label?: string) => void;
  reset: () => void;
}

export const CursorContext = createContext<CursorAPI>({
  set: () => {},
  reset: () => {},
});

export const useCursor = () => useContext(CursorContext);

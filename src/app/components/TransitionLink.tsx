import React, { useCallback } from "react";
import { usePageTransition } from "../hooks/useTransition";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: React.ReactNode;
}

export function TransitionLink({
  to,
  children,
  onClick,
  ...rest
}: TransitionLinkProps) {
  const { navigateTo } = usePageTransition();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      if (
        e.button !== 0 ||
        e.metaKey ||
        e.altKey ||
        e.ctrlKey ||
        e.shiftKey ||
        rest.target === "_blank"
      ) {
        return;
      }

      e.preventDefault();
      navigateTo(to);
    },
    [to, navigateTo, onClick, rest.target],
  );

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

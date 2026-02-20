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
      e.preventDefault();
      onClick?.(e);
      navigateTo(to);
    },
    [to, navigateTo, onClick],
  );

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

import React, { useCallback, forwardRef } from "react";
import { useLocation } from "react-router";
import { usePageTransition } from "../hooks/useTransition";
import { pathIsDutch } from "../hooks/useLanguage";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: React.ReactNode;
}

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ to, children, onClick, ...rest }, ref) {
    const { navigateTo } = usePageTransition();
    const location = useLocation();
    // Resolve the *visible* href too, not just the click behavior — the
    // static prerendered HTML (what crawlers actually read) must already
    // point at the Dutch URL on a Dutch page, not rely on a JS redirect.
    const resolvedTo =
      pathIsDutch(location.pathname) && !pathIsDutch(to)
        ? to === "/"
          ? "/nl"
          : `/nl${to}`
        : to;

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
        navigateTo(resolvedTo);
      },
      [resolvedTo, navigateTo, onClick, rest.target],
    );

    return (
      <a ref={ref} href={resolvedTo} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  },
);

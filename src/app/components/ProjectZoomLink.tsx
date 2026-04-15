import React, { forwardRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  openCaseWithZoom,
  resolveCaseTransitionSource,
  prepareForCaseNavigation,
} from "../utils/caseZoomTransition";

interface ProjectZoomLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  projectSlug: string;
  imageSrc: string;
  transitionId?: string;
  to?: string;
  children: React.ReactNode;
  onBeforeNavigate?: () => void;
}

export const ProjectZoomLink = forwardRef<HTMLAnchorElement, ProjectZoomLinkProps>(
  function ProjectZoomLink(
    { projectSlug, imageSrc, transitionId, to, children, onClick, onBeforeNavigate, ...rest },
    ref,
  ) {
    const navigate = useNavigate();
    const location = useLocation();
    const targetPath = to ?? `/work/${projectSlug}`;

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;

        if (
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey ||
          rest.target === "_blank"
        ) {
          return;
        }

        event.preventDefault();

        if (!imageSrc) {
          navigate(targetPath, {
            state: {
              fromPath: `${location.pathname}${location.search}${location.hash}`,
            },
          });
          return;
        }

        onBeforeNavigate?.();

        openCaseWithZoom({
          cardEl: resolveCaseTransitionSource(event.currentTarget),
          imageSrc,
          caseId: transitionId ?? projectSlug,
          onComplete: () => {
            prepareForCaseNavigation();
            navigate(targetPath, {
              state: {
                fromPath: `${location.pathname}${location.search}${location.hash}`,
              },
            });
          },
        });
      },
      [
        imageSrc,
        location.hash,
        location.pathname,
        location.search,
        navigate,
        onBeforeNavigate,
        onClick,
        projectSlug,
        rest.target,
        targetPath,
        transitionId,
      ],
    );

    return (
      <a ref={ref} href={targetPath} onClick={handleClick} {...rest}>
        {children}
      </a>
    );
  },
);

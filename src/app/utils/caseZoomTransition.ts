import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TRANSITION_FROM_STORAGE_KEY = "transitionFrom";
const TRANSITION_OVERLAY_ID = "dysigns-transition-overlay";

export type TransitionFromState = {
  top: number;
  left: number;
  width: number;
  height: number;
  imageUrl: string;
  id?: string | number;
};

export function lockTransitionScroll() {
  const scrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.overflow = "hidden";
}

export function unlockTransitionScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.overflow = "";
}

function createOverlay() {
  const existing = document.getElementById(TRANSITION_OVERLAY_ID);
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = TRANSITION_OVERLAY_ID;
  document.body.appendChild(overlay);
  return overlay;
}

export function resolveCaseTransitionSource(rootEl: HTMLElement): HTMLElement {
  const directCover = rootEl.querySelector<HTMLElement>("[data-case-cover]");
  if (directCover) return directCover;

  const directImage = rootEl.querySelector<HTMLElement>("img");
  if (directImage) return directImage;

  const parentCover = rootEl.parentElement?.querySelector<HTMLElement>(
    "[data-case-cover]",
  );
  if (parentCover) return parentCover;

  const parentImage = rootEl.parentElement?.querySelector<HTMLElement>("img");
  if (parentImage) return parentImage;

  return rootEl;
}

export function readTransitionFrom(): TransitionFromState | null {
  const raw = sessionStorage.getItem(TRANSITION_FROM_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TransitionFromState;
  } catch {
    sessionStorage.removeItem(TRANSITION_FROM_STORAGE_KEY);
    return null;
  }
}

export function clearTransitionFrom() {
  sessionStorage.removeItem(TRANSITION_FROM_STORAGE_KEY);
}

export function consumeCaseTransitionOverlay() {
  const overlay = document.getElementById(TRANSITION_OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

export function prepareForCaseNavigation() {
  window.dispatchEvent(new Event("dysigns:cursor-reset"));
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.globalTimeline.getChildren(false, true, true).forEach((child) => {
    if (child !== gsap.globalTimeline) {
      child.kill();
    }
  });
}

export function openCaseWithZoom(params: {
  cardEl: HTMLElement;
  imageSrc: string;
  caseId?: string | number;
  onComplete: () => void;
}) {
  lockTransitionScroll();
  const rect = params.cardEl.getBoundingClientRect();

  sessionStorage.setItem(
    TRANSITION_FROM_STORAGE_KEY,
    JSON.stringify({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      imageUrl: params.imageSrc,
      id: params.caseId,
    } satisfies TransitionFromState),
  );

  const overlay = createOverlay();
  overlay.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    border-radius: 12px;
    background: url("${params.imageSrc}") center/cover no-repeat;
    z-index: 9999;
    pointer-events: none;
    transition:
      top 0.55s cubic-bezier(0.16, 1, 0.3, 1),
      left 0.55s cubic-bezier(0.16, 1, 0.3, 1),
      width 0.55s cubic-bezier(0.16, 1, 0.3, 1),
      height 0.55s cubic-bezier(0.16, 1, 0.3, 1),
      border-radius 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  overlay.getBoundingClientRect();
  overlay.style.top = "0px";
  overlay.style.left = "0px";
  overlay.style.width = `${window.innerWidth}px`;
  overlay.style.height = `${window.innerHeight}px`;
  overlay.style.borderRadius = "0px";

  overlay.addEventListener(
    "transitionend",
    () => {
      params.onComplete();
    },
    { once: true },
  );
}

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

/**
 * Muted, looping, autoplaying video that only downloads once it is near the
 * viewport, and pauses again when it scrolls out.
 *
 * Why: a plain <video autoPlay> ignores preload="metadata" and pulls the
 * whole file on page load, even far below the fold. The prerendered HTML
 * also shipped the desktop src while the client picked the mobile one, so
 * phones downloaded both. Here the src is chosen on the client only (the
 * prerendered markup shows just the poster) and attached on first approach.
 */
/* ─── Starting after a tap, when the browser will not start a video by itself ───
   An iPhone in Low Power Mode (and some data savers) refuses every video that tries to start
   on its own: the poster just stays. A video may start once the visitor has done something,
   and on an iPhone that means a tap or a key press, not scrolling. So videos that opt in with
   `resumeOnGesture` register here, and the first tap anywhere on the page starts the ones in
   view. Once a refusal has been seen, that same tap also clears the ones further down, so they
   start by themselves when they scroll into view. */
let autoplayRefused = false;
const onNextGesture = new Set<() => void>();
let gestureListening = false;
function listenForGestures() {
  if (gestureListening || typeof window === "undefined") return;
  gestureListening = true;
  const run = () => onNextGesture.forEach((fn) => fn());
  for (const type of ["pointerup", "touchend", "click", "keydown"]) {
    window.addEventListener(type, run, { passive: true, capture: true });
  }
}

type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster" | "autoPlay" | "preload"> & {
  src: string;
  poster?: string;
  /** Portrait cut, used when `mobileQuery` matches. */
  mobileSrc?: string;
  mobilePoster?: string;
  mobileQuery?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
  /** Start after the visitor's first tap when the browser refuses to autoplay (Low Power Mode). */
  resumeOnGesture?: boolean;
};

export function LazyVideo({
  src,
  poster,
  mobileSrc,
  mobilePoster,
  mobileQuery = "(max-width: 639px)",
  rootMargin = "300px 0px",
  resumeOnGesture = false,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(false);
  const inView = useRef(false);
  const srcRef = useRef(src);

  useEffect(() => {
    if (mobileSrc || mobilePoster) setIsMobile(window.matchMedia(mobileQuery).matches);
  }, [mobileSrc, mobilePoster, mobileQuery]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setActive(true);
          // with a source already on the element, a refusal to autoplay shows up here
          if (resumeOnGesture && !el.getAttribute("src")) el.src = srcRef.current;
          el.play().catch((err) => {
            if (err?.name === "NotAllowedError") autoplayRefused = true;
          });
        } else if (!el.paused) {
          el.pause();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, resumeOnGesture]);

  useEffect(() => {
    if (!resumeOnGesture) return;
    const el = ref.current;
    if (!el) return;
    const startOnGesture = () => {
      if (!el.paused) return;
      // in view: start now. Further down: only once we know autoplay is being refused.
      if (!inView.current && !autoplayRefused) return;
      if (!el.getAttribute("src")) el.src = srcRef.current;
      el.muted = true;
      el.play()
        .then(() => {
          setActive(true);
          if (!inView.current) el.pause(); // cleared for later; it starts when it scrolls in
        })
        .catch(() => {});
    };
    onNextGesture.add(startOnGesture);
    listenForGestures();
    return () => {
      onNextGesture.delete(startOnGesture);
    };
  }, [resumeOnGesture]);

  const chosenSrc = isMobile && mobileSrc ? mobileSrc : src;
  const chosenPoster = isMobile && mobilePoster ? mobilePoster : poster;
  srcRef.current = chosenSrc;

  return (
    <video
      ref={ref}
      // with resumeOnGesture the source is put on the element directly (see above), so a
      // later render never resets a video that is already playing
      src={resumeOnGesture ? undefined : active ? chosenSrc : undefined}
      poster={chosenPoster}
      autoPlay={active}
      preload={active ? "auto" : "none"}
      muted
      loop
      playsInline
      disablePictureInPicture
      {...rest}
    />
  );
}

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
type Props = Omit<VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster" | "autoPlay" | "preload"> & {
  src: string;
  poster?: string;
  /** Portrait cut, used when `mobileQuery` matches. */
  mobileSrc?: string;
  mobilePoster?: string;
  mobileQuery?: string;
  /** How far ahead of the viewport to start loading. */
  rootMargin?: string;
};

export function LazyVideo({
  src,
  poster,
  mobileSrc,
  mobilePoster,
  mobileQuery = "(max-width: 639px)",
  rootMargin = "300px 0px",
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState(false);

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
        if (entry.isIntersecting) {
          setActive(true);
          el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  const chosenSrc = isMobile && mobileSrc ? mobileSrc : src;
  const chosenPoster = isMobile && mobilePoster ? mobilePoster : poster;

  return (
    <video
      ref={ref}
      src={active ? chosenSrc : undefined}
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

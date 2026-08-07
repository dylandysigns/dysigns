/**
 * PlaceholderThumb — neutral, honest placeholder for case images that
 * don't exist yet (A/Café, Studio75). Flat fill using the site's own
 * --page-fg-rgb token at low opacity, a thin border matching existing
 * card borders, and a muted label. No stock photo, no AI-generated
 * image, no gradient meant to look like design — an empty placeholder
 * is more honest than fake work in a design agency's own portfolio.
 */
export function PlaceholderThumb({ width, height }: { width: number; height: number }) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      role="presentation"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <rect
        width={width}
        height={height}
        fill="rgba(255,255,255,.03)"
        stroke="rgba(255,255,255,.08)"
        strokeWidth="1"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,.28)"
        fontFamily="Inter, sans-serif"
        fontSize={Math.round(width * 0.045)}
        fontWeight={500}
        letterSpacing="0.08em"
      >
        IMAGE COMING SOON
      </text>
    </svg>
  );
}

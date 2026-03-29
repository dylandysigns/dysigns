export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(3rem,8vw,6rem)",
            fontWeight: 800,
            color: "rgba(var(--page-fg-rgb), .06)",
            letterSpacing: "-.06em",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <p
          className="mt-4"
          style={{
            fontSize: ".82rem",
            color: "rgba(var(--page-fg-rgb), .3)",
          }}
        >
          Page not found
        </p>
        <a
          href="/"
          className="inline-block mt-6 px-5 py-2 rounded-full"
          style={{
            fontSize: ".72rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .4)",
            border: "1px solid rgba(var(--page-fg-rgb), .15)",
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}

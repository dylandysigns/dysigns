import { Seo } from "../components/Seo";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Seo
        title="Pagina niet gevonden | DYSIGNS"
        description="Deze pagina bestaat niet (meer)."
        path="/404"
        robots="noindex, nofollow"
      />
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

        <nav aria-label="Hoofdsecties" className="mt-10">
          <ul
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            style={{
              fontSize: ".72rem",
              color: "rgba(var(--page-fg-rgb), .4)",
              listStyle: "none",
              padding: 0,
            }}
          >
            <li><a href="/cases" style={{ color: "inherit" }}>Cases</a></li>
            <li><a href="/webdesign-almere" style={{ color: "inherit" }}>Webdesign Almere</a></li>
            <li><a href="/ux-ui-design" style={{ color: "inherit" }}>UX/UI Design</a></li>
            <li><a href="/shopify-development" style={{ color: "inherit" }}>Shopify development</a></li>
            <li><a href="/branding" style={{ color: "inherit" }}>Branding</a></li>
            <li><a href="/over-dylan-kho" style={{ color: "inherit" }}>Over Dylan Kho</a></li>
            <li><a href="/contact" style={{ color: "inherit" }}>Contact</a></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

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
          className="inline-block mt-6 px-5 py-2 rounded-full transition-all duration-300"
          style={{
            fontSize: ".72rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .4)",
            border: "1px solid rgba(var(--page-fg-rgb), .15)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(var(--page-fg-rgb), .4)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(var(--page-fg-rgb), .15)";
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
            {[
              { href: "/cases", label: "Cases" },
              { href: "/webdesign-almere", label: "Webdesign Almere" },
              { href: "/ux-ui-design", label: "UX/UI Design" },
              { href: "/shopify-development", label: "Shopify development" },
              { href: "/branding", label: "Branding" },
              { href: "/over-dylan-kho", label: "Over Dylan Kho" },
              { href: "/contact", label: "Contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="transition-colors duration-300"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "var(--page-fg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "inherit";
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit on the last item (current page)
}

/**
 * Breadcrumb — shown on every page except home.
 * Real <a href> links (crawlable without JS); the current page is plain
 * text with aria-current="page". Structured data (BreadcrumbList) is
 * added separately in fase 4, this component only handles markup + UX.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="w-full">
      <ol
        className="flex flex-wrap items-center gap-2"
        style={{
          fontSize: ".6rem",
          fontWeight: 500,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "rgba(var(--page-fg-rgb), .4)",
        }}
      >
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  style={{ color: "rgba(var(--page-fg-rgb), .4)" }}
                  className="hover:opacity-80 transition-opacity"
                >
                  {item.label}
                </a>
              ) : (
                <span aria-current={isLast ? "page" : undefined} style={{ color: "rgba(var(--page-fg-rgb), .6)" }}>
                  {item.label}
                </span>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

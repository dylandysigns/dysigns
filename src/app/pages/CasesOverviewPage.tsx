import { Breadcrumb } from "../components/Breadcrumb";
import { Seo } from "../components/Seo";
import { getContent, getAllCases } from "../content/loadContent";

export default function CasesOverviewPage() {
  const entry = getContent("cases-overview.md");
  const cases = getAllCases();

  return (
    <section
      className="relative"
      style={{ background: "var(--page-bg)", minHeight: "100vh" }}
    >
      <Seo
        title={entry.frontmatter.title}
        description={entry.frontmatter.description}
        path="/cases"
      />
      <div className="max-w-[800px] mx-auto px-6 md:px-12 pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="mb-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cases" }]} />
        </div>

        <span
          style={{
            fontSize: ".6rem",
            fontWeight: 500,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "rgba(var(--page-fg-rgb), .45)",
          }}
        >
          Werk
        </span>

        <h1
          className="mt-3"
          style={{
            fontFamily: "'Inter',sans-serif",
            fontSize: "clamp(2rem,5vw,3.5rem)",
            fontWeight: 700,
            letterSpacing: "-.04em",
            color: "var(--page-fg)",
            lineHeight: 1.1,
          }}
        >
          {entry.frontmatter.heading || entry.frontmatter.title}
        </h1>

        {entry.frontmatter.answerBlock && (
          <p
            className="mt-6"
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(.95rem,1.3vw,1.15rem)",
              fontStyle: "italic",
              lineHeight: 1.75,
              color: "rgba(var(--page-fg-rgb), .7)",
            }}
          >
            {entry.frontmatter.answerBlock}
          </p>
        )}

        <ul className="mt-12 flex flex-col gap-3" style={{ listStyle: "none", padding: 0 }}>
          {cases.map((c) => (
            <li key={c.frontmatter.slug}>
              <a
                href={`/cases/${c.frontmatter.slug}`}
                className="block rounded-xl transition-colors"
                style={{
                  padding: "1.25rem 1.5rem",
                  border: "1px solid rgba(var(--page-fg-rgb), .08)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter',sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "var(--page-fg)",
                  }}
                >
                  {c.frontmatter.client || c.frontmatter.heading}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

# Archive

Content and pages from the previous (Dutch-first, "webdesign bureau")
version of the SEO/GEO project, superseded by the English-first
full-service rebuild. Kept for reference, not deleted, per the explicit
instruction in the follow-up brief.

- `nl-content/content/` — the Dutch markdown content files (home,
  4 services, 4 cases, about, contact) from the first version.
- `legacy-pages/` — original pre-SEO-project page components (bilingual
  EN/NL via useLanguage, backed by `data/projects.ts`). `WorkPage.tsx`,
  `CaseDetailPage.tsx`, and `AboutPage.tsx` were reinstated into
  `src/app/pages/` and back into `routes.ts` (request: "bring back the
  old work page and about us page") — copies are kept here too so this
  folder still reflects the full pre-rebuild set. `ServicesPage.tsx` and
  `ServiceDetailPage.tsx` remain archived only, replaced by
  `ServicePages.tsx`.
  - `ServicePages-nl.tsx`, `CasesOverviewPage-nl.tsx`,
    `CaseContentPage-nl.tsx`, `OverDylanKhoPage-nl.tsx`,
    `RelatedCases-nl.tsx`, `CaseFooterLinks-nl.tsx`, `services-nl.ts` —
    the Dutch-only pages built for the first version of this project.
- `content-driven-pages/` — the content/work-*.md-driven `WorkOverviewPage.tsx`,
  `WorkDetailPage.tsx`, and `AboutPage.tsx` that briefly replaced the
  legacy pages above during the English-first rebuild, kept here in case
  that direction is picked back up. Not wired into routes.ts.

**Known mismatch after reverting /work and /about**: the homepage's
"Selected projects" section (`src/app/components/home/SelectedProjects.tsx`)
still reads from `content/work/*.md` (3 cases: stelz, a-cafe, studio75)
and links to `/work/stelz` etc. The restored `/work` overview instead
lists the 9 projects in `data/projects.ts`, whose STËLZ entry lives at
`/work/stelz-web-design`. The two case sets no longer match each other —
not fixed as part of this revert since it wasn't asked for.

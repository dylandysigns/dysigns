import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { siteContent } from "../data/content";
import { projects } from "../data/projects";
import { useCursor } from "../hooks/useCursor";
import { TransitionLink } from "../components/TransitionLink";
import { LazyVideo } from "../components/LazyVideo";
import { ContactBand } from "../components/home/ContactBand";
import { LOGOS } from "../components/home/Partners";
import { useLanguage } from "../hooks/useLanguage";
import { Seo } from "../components/Seo";
import { breadcrumbListSchema, profilePageSchema } from "../seo/schema";
import { getLocalizedContent } from "../content/loadContent";
import { aboutCaseSlugs, aboutCopy } from "./about/aboutCopy";
import "./about/about.css";

gsap.registerPlugin(ScrollTrigger);

/* The About page: loud on purpose. The headline set edge to edge, the big word
   with a film in it, three panels for what we deliver, then the story, the
   values, cases and the logos. Copy in about/aboutCopy.ts, styling in
   about/about.css (classes prefixed `ab-`). */

function Accented({ parts }: { parts: string[] }) {
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="ab-ice">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Marquee({ children, speed }: { children: React.ReactNode; speed: number }) {
  return (
    <div className="ab-marquee" style={{ ["--ab-speed" as string]: `${speed}s` }}>
      <div className="ab-marquee-track">{children}</div>
      <div className="ab-marquee-track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { lang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const entry = getLocalizedContent("about.md", lang);
  const c = aboutCopy[lang];
  const [openPillar, setOpenPillar] = useState(0);

  const cases = aboutCaseSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project) => project !== undefined);

  // The big word and the film in it together fill the width: a letter of
  // Effra heavy is about 0.74em wide, the film 1.15em plus its gaps.
  const wordLetters = c.statementWord[0].length + c.statementWord[1].length;
  const wordSize = (56 / (wordLetters * 0.74 + 1.3)).toFixed(2);

  const instagram = siteContent.socials.find((s) => s.name.toLowerCase() === "instagram");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".ab-h1-line", {
        yPercent: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
      });
      // The film starts as a big framed window at the top of the statement. While that section is
      // pinned it shrinks and travels into the gap in the big word.
      const section = rootRef.current?.querySelector<HTMLElement>(".ab-statement");
      const slot = section?.querySelector<HTMLElement>(".ab-statement-slot");
      if (section && slot) {
        // Coming up from the bottom: the frame starts narrower and opens to its full width
        gsap.fromTo(
          ".ab-film",
          { scale: 0.76, transformOrigin: "50% 0%" },
          {
            scale: 1,
            ease: "power1.out",
            scrollTrigger: { trigger: section, start: "top 98%", end: "top top", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          ".ab-film video",
          { scale: 1.3 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 98%", end: "top top", scrub: 0.8 },
          },
        );
        // position of the slot inside the section, without the reveal transforms on the way
        const place = () => {
          let x = 0;
          let y = 0;
          for (let el: HTMLElement | null = slot; el && el !== section; el = el.offsetParent as HTMLElement | null) {
            x += el.offsetLeft;
            y += el.offsetTop;
          }
          return { x, y };
        };
        const pad = () => parseFloat(getComputedStyle(section).paddingLeft) || 24;
        gsap.fromTo(
          ".ab-film",
          {
            left: () => pad(),
            top: () => 0,
            width: () => section.clientWidth - pad() * 2,
            height: () => section.clientHeight,
            borderRadius: 28,
          },
          {
            left: () => place().x,
            top: () => place().y,
            width: () => slot.offsetWidth,
            height: () => slot.offsetHeight,
            borderRadius: () => parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 8,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=90%",
              scrub: 0.7,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          },
        );
      }
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        gsap.from(group.children, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [lang]);

  const linkCursor = {
    onMouseEnter: () => cursor.set("link"),
    onMouseLeave: () => cursor.reset(),
  };

  return (
    <div ref={rootRef} className="ab">
      <Seo
        title={entry.frontmatter.title}
        description={entry.frontmatter.description}
        path="/about"
        lastmod={entry.frontmatter.lastUpdated}
        schema={[
          breadcrumbListSchema(
            [
              { name: "DYSIGNS", path: "/" },
              { name: c.label, path: "/about" },
            ],
            lang,
          ),
          profilePageSchema({
            path: "/about",
            name: entry.frontmatter.title,
            dateModified: entry.frontmatter.lastUpdated,
          }),
        ]}
      />
      {/* ── 1. Hero: the manifesto line, then who we are, then the film ── */}
      <div className="ab-top">
      <section className="ab-hero ab-wrap">
        <span className="sr-only">{c.label}</span>
        <h1 className="ab-h1">
          {c.headline.map((line, i) => (
            <Fragment key={i}>
              <span className="ab-h1-line">
                {line.map((word, j) => (
                  <Fragment key={j}>
                    <span>{word}</span>
                    {j < line.length - 1 ? " " : null}
                  </Fragment>
                ))}
              </span>{" "}
            </Fragment>
          ))}
        </h1>
        <p className="ab-topline" data-reveal>
          {c.topLine}
        </p>
        <button
          type="button"
          className={`ph-down ab-scroll${scrolled ? " is-gone" : ""}`}
          aria-label={t("hero.scrollDown")}
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
        >
          <svg viewBox="0 0 24 72" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <defs>
              <linearGradient id="ab-down-fade" gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="66">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path className="ph-down__line" d="M12 2v64" stroke="url(#ab-down-fade)" />
            <path className="ph-down__spark" d="M12 2v64" pathLength="64" />
            <path className="ph-down__head" d="M6.5 60.5L12 66l5.5-5.5" />
          </svg>
        </button>
      </section>

      {/* ── 2. Statement: "designed to grow", with work playing inside the word ── */}
      <section className="ab-statement ab-wrap">
        <div className="ab-film">
          <LazyVideo src="/videos/dysigns-intro-bg.mp4" resumeOnGesture aria-hidden="true" />
        </div>
        <p className="ab-kicker" data-reveal>
          {c.statementKicker}
        </p>
        <h2 data-reveal>
          <span className="ab-statement-lead">{c.statementLead}</span>{" "}
          <span
            className="ab-statement-word"
            style={{ ["--ab-word-size" as string]: `min(${wordSize}vw, 12rem)` }}
          >
            <span>{c.statementWord[0]}</span>
            <span className="ab-statement-slot" aria-hidden="true" />
            <span>{c.statementWord[1]}</span>
          </span>
        </h2>
      </section>

      </div>

      {/* ── 4. Story ── */}
      <section className="ab-wrap">
        <div className="ab-story">
          <div className="ab-story-head" data-reveal>
            <span className="ab-label">{c.storyLabel}</span>
            <h2 className="ab-h2">{c.storyTitle}</h2>
          </div>
          <div className="ab-story-text" data-stagger>
            <p>{c.intro}</p>
            {c.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-wrap">
        <div className="ab-facts" data-stagger>
          {c.facts.map((fact) => (
            <div key={fact.text} className="ab-fact">
              <span className="ab-fact-figure">{fact.figure}</span>
              <p className="ab-fact-text">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. What we deliver: three panels, the open one takes the room ── */}
      <section className="ab-deliver ab-wrap">
        <div className="ab-deliver-head" data-reveal>
          <h2 className="ab-deliver-title">{c.deliverLabel}</h2>
        </div>
        <div className="ab-pillars" data-reveal>
          {c.pillars.map((pillar, i) => (
            <article
              key={pillar.title}
              className="ab-pillar"
              data-open={openPillar === i}
              data-plain={pillar.image ? undefined : ""}
              onMouseEnter={() => setOpenPillar(i)}
              onFocus={() => setOpenPillar(i)}
              onClick={() => setOpenPillar(i)}
            >
              {pillar.image ? <img className="ab-pillar-bg" src={pillar.image} alt="" loading="lazy" /> : null}
              <div className="ab-pillar-body">
                <p className="ab-pillar-text">{pillar.text}</p>
                <span className="ab-chip">{c.services}</span>
                <ul className="ab-pillar-list">
                  {pillar.items.map((item) => (
                    <li key={item.label}>
                      {item.to ? (
                        <TransitionLink to={item.to} {...linkCursor}>
                          {item.label}
                        </TransitionLink>
                      ) : (
                        item.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <h3 className="ab-pillar-title">{pillar.title}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ── Cases: crawlable internal links to the work behind the claims ── */}
      <section className="ab-cases">
        <div className="ab-cases-head ab-wrap" data-reveal>
          <h2 className="ab-h2">{c.casesLabel}</h2>
        </div>
        <div className="ab-strip" data-stagger>
          {cases.map((project) => (
            <TransitionLink key={project.slug} to={`/work/${project.slug}`} className="ab-case" {...linkCursor}>
              <span className="ab-case-img">
                <img src={project.thumbnail} alt={`${project.title}, ${project.category}`} loading="lazy" draggable={false} />
              </span>
              <span className="ab-case-name">{project.title}</span>
              <span className="ab-case-cat">{project.category}</span>
            </TransitionLink>
          ))}
        </div>
        <div className="ab-links ab-wrap">
          <TransitionLink to="/work" className="ab-link" {...linkCursor}>
            {c.links.work}
            <ArrowUpRight aria-hidden="true" />
          </TransitionLink>
          <TransitionLink to="/insights" className="ab-link" {...linkCursor}>
            {c.links.insights}
            <ArrowUpRight aria-hidden="true" />
          </TransitionLink>
        </div>
      </section>

      {/* ── Locations: local signals plus links to the city pages ── */}
      <section className="ab-wrap">
        <div className="ab-story">
          <div className="ab-story-head" data-reveal>
            <h2 className="ab-h2">{c.locationsLabel}</h2>
          </div>
          <div className="ab-story-text" data-reveal>
            <p>{c.locationsText}</p>
          </div>
        </div>
        <div className="ab-links">
          {c.locations.map((loc) => (
            <TransitionLink key={loc.to} to={loc.to} className="ab-link" {...linkCursor}>
              {loc.label}
              <ArrowUpRight aria-hidden="true" />
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* ── 7. Trusted by ── */}
      <section className="ab-clients">
        <div className="ab-clients-head ab-wrap">
          <h2 className="ab-clients-title">{c.clientsLabel}</h2>
        </div>
        <div className="ab-clients-grid ab-wrap">
          {LOGOS.map((logo) => (
            <a
              key={logo.name}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ab-logo"
              onMouseEnter={() => cursor.set("link", logo.name)}
              onMouseLeave={() => cursor.reset()}
            >
              <img src={logo.src} alt={logo.name} loading="lazy" draggable={false} />
            </a>
          ))}
        </div>
        <p className="ab-clients-text ab-wrap">{c.clientsText}</p>
      </section>

      <ContactBand />
    </div>
  );
}

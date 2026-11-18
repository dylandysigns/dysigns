import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { siteContent } from "../../data/content";
import { projects } from "../../data/projects";
import { useCursor } from "../../hooks/useCursor";
import { TransitionLink } from "../../components/TransitionLink";
import { LazyVideo } from "../../components/LazyVideo";
import { ContactBand } from "../../components/home/ContactBand";
import { LOGOS } from "../../components/home/Partners";
import { useLanguage } from "../../hooks/useLanguage";
import { bulletproofCaseSlugs, bulletproofCopy } from "./bulletproofCopy";
import "./about-bulletproof.css";

gsap.registerPlugin(ScrollTrigger);

/* The "Bulletproof" variant of the About page: the loud one, with the headline
   set edge to edge, the big word with a film in it and the three panels. Kept
   next to the live AboutPage.tsx so the two can be compared; it is only reachable
   in `npm run dev`, at /about-bulletproof (see routes.ts). No <Seo>: it is not a
   page of the site. */

function Accented({ parts }: { parts: string[] }) {
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="bp-ice">
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
    <div className="bp-marquee" style={{ ["--bp-speed" as string]: `${speed}s` }}>
      <div className="bp-marquee-track">{children}</div>
      <div className="bp-marquee-track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}

export default function AboutBulletproof() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursor = useCursor();
  const { lang } = useLanguage();
  const c = bulletproofCopy[lang];
  const [openPillar, setOpenPillar] = useState(0);

  const cases = bulletproofCaseSlugs
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project) => project !== undefined);

  // The big word and the film in it together fill the width: a letter of
  // Effra heavy is about 0.74em wide, the film 1.15em plus its gaps.
  const wordLetters = c.statementWord[0].length + c.statementWord[1].length;
  const wordSize = (86 / (wordLetters * 0.74 + 1.3)).toFixed(2);

  const instagram = siteContent.socials.find((s) => s.name.toLowerCase() === "instagram");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from(".bp-h1-line", {
        yPercent: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
      });
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
    <div ref={rootRef} className="bp">
      {/* ── 1. Hero: the manifesto line, then who we are, then the film ── */}
      <section className="bp-hero bp-wrap">
        <span className="bp-label">{c.label}</span>
        <h1 className="bp-h1">
          {c.headline.map((line, i) => (
            <Fragment key={i}>
              <span className="bp-h1-line">
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
        <p className="bp-sub" data-reveal>
          <Accented parts={c.sub} />
        </p>
        <p className="bp-intro" data-reveal>
          {c.intro}
        </p>
        <div className="bp-film" data-reveal>
          <LazyVideo
            src="/videos/stelz-app-cover-v17.mp4"
            poster="/images/stelz-app-cover-poster.jpg"
            mobileSrc="/videos/stelz-app-cover-mobile-v17.mp4"
            mobilePoster="/images/stelz-app-cover-mobile-poster.jpg"
            resumeOnGesture
            aria-hidden="true"
          />
        </div>
      </section>

      {/* ── 2. Statement: "designed to grow", with work playing inside the word ── */}
      <section className="bp-statement bp-wrap">
        <p className="bp-kicker" data-reveal>
          {c.statementKicker}
        </p>
        <h2 data-reveal>
          <span className="bp-statement-lead">{c.statementLead}</span>{" "}
          <span
            className="bp-statement-word"
            style={{ ["--bp-word-size" as string]: `min(${wordSize}vw, 21rem)` }}
          >
            <span>{c.statementWord[0]}</span>
            <LazyVideo
              src="/videos/merelymade-cover-v3.mp4"
              poster="/images/merelymade-cover-poster.jpg"
              aria-hidden="true"
            />
            <span>{c.statementWord[1]}</span>
          </span>
        </h2>
      </section>

      {/* ── 3. What we deliver: three panels, the open one takes the room ── */}
      <section className="bp-deliver bp-wrap">
        <div className="bp-deliver-head" data-reveal>
          <span className="bp-label">{c.deliverLabel}</span>
          <h2 className="bp-h2">{c.deliverTitle}</h2>
        </div>
        <div className="bp-pillars" data-reveal>
          {c.pillars.map((pillar, i) => (
            <article
              key={pillar.title}
              className="bp-pillar"
              data-open={openPillar === i}
              onMouseEnter={() => setOpenPillar(i)}
              onFocus={() => setOpenPillar(i)}
              onClick={() => setOpenPillar(i)}
            >
              <img className="bp-pillar-bg" src={pillar.image} alt="" loading="lazy" />
              <div className="bp-pillar-body">
                <p className="bp-pillar-text">{pillar.text}</p>
                <span className="bp-chip">{c.services}</span>
                <ul className="bp-pillar-list">
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
              <h3 className="bp-pillar-title">{pillar.title}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4. Story ── */}
      <section className="bp-wrap">
        <div className="bp-story">
          <div className="bp-story-head" data-reveal>
            <span className="bp-label">{c.storyLabel}</span>
            <h2 className="bp-h2">{c.storyTitle}</h2>
          </div>
          <div className="bp-story-text" data-stagger>
            {c.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="bp-facts" data-stagger>
          {c.facts.map((fact) => (
            <div key={fact.text} className="bp-fact">
              <span className="bp-fact-figure">{fact.figure}</span>
              <p className="bp-fact-text">{fact.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Values: the big word, then four principles ── */}
      <section className="bp-values">
        <Marquee speed={38}>
          <span className="bp-bigword">{c.valuesWord}</span>
          <span className="bp-bigword" aria-hidden="true">
            {c.valuesWord}
          </span>
        </Marquee>
        <div className="bp-wrap">
          <h2 className="bp-values-sub" data-reveal>
            <Accented parts={c.valuesSub} />
          </h2>
          <div className="bp-values-grid" data-stagger>
            {c.values.map((value) => (
              <div key={value.title} className="bp-value">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Cases ── */}
      <section className="bp-cases">
        <div className="bp-wrap bp-cases-head" data-reveal>
          <h2 className="bp-label">{c.casesLabel}</h2>
        </div>
        <div className="bp-strip" data-reveal>
          {cases.map((project) => (
            <TransitionLink
              key={project.slug}
              to={`/work/${project.slug}`}
              className="bp-case"
              onMouseEnter={() => cursor.set("view")}
              onMouseLeave={() => cursor.reset()}
            >
              <span className="bp-case-img">
                <img src={project.thumbnailMobile ?? project.thumbnail} alt="" loading="lazy" />
              </span>
              <span className="bp-case-name">{project.title}</span>
              <span className="bp-case-cat">{project.category}</span>
            </TransitionLink>
          ))}
        </div>
        <div className="bp-wrap bp-links" data-stagger>
          <TransitionLink to="/work" className="bp-link" {...linkCursor}>
            {c.links.work} <ArrowUpRight size={18} strokeWidth={1.75} />
          </TransitionLink>
          <TransitionLink to="/insights" className="bp-link" {...linkCursor}>
            {c.links.insights} <ArrowUpRight size={18} strokeWidth={1.75} />
          </TransitionLink>
          {instagram && (
            <a href={instagram.url} target="_blank" rel="noopener noreferrer" className="bp-link" {...linkCursor}>
              {c.links.social} <ArrowUpRight size={18} strokeWidth={1.75} />
            </a>
          )}
        </div>
      </section>

      {/* ── 7. Trusted by ── */}
      <section className="bp-clients">
        <div className="bp-clients-head bp-wrap">
          <h2 className="bp-label">{c.clientsLabel}</h2>
          <p>{c.clientsText}</p>
        </div>
        <Marquee speed={48}>
          {LOGOS.map((logo) => (
            <a
              key={logo.name}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-logo"
              onMouseEnter={() => cursor.set("link", logo.name)}
              onMouseLeave={() => cursor.reset()}
            >
              <img src={logo.src} alt={logo.name} loading="lazy" draggable={false} />
            </a>
          ))}
        </Marquee>
      </section>

      <ContactBand />
    </div>
  );
}

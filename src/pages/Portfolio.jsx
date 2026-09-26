import { useEffect, useMemo, useState } from 'react';
import { loadContent, contactEmail } from '../lib/firebase.js';
import { cleanContent, mergeContent } from '../lib/portfolio-data.js';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';

export default function Portfolio() {
  const [content, setContent] = useState(null);
  const [activeIdx, setActiveIdx] = useState(null);

  useEffect(() => {
    loadContent()
      .catch((e) => {
        console.warn('Could not load content, using defaults', e);
        return null;
      })
      .then((data) => setContent(cleanContent(mergeContent(data))));
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setActiveIdx(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (content) document.title = `${content.profile.name} — ${content.profile.role}`;
  }, [content]);

  return (
    <div className="page-bg box-border px-5 pt-5 pb-10">
      {!content ? (
        <div className="grid min-h-[80vh] place-items-center font-mono text-[13px] text-subtle">Loading portfolio…</div>
      ) : (
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[18px]">
          <Nav p={content.profile} />
          <Hero p={content.profile} />
          <Projects projects={content.projects} onOpen={setActiveIdx} />
          <Experience items={content.experience} />
          <Tools tools={content.tools} skills={content.skills} />
          <Contact p={content.profile} />
          <footer className="flex flex-wrap justify-between gap-3 px-3 py-2 text-xs text-subtle">
            <span>
              © {new Date().getFullYear()} {content.profile.name}
            </span>
            <div className="flex gap-[18px]">
              <a href="/admin" className="text-faint">Admin</a>
              <a href="#home" className="text-subtle">Back to top ↑</a>
            </div>
          </footer>
        </div>
      )}
      {content && activeIdx != null && content.projects[activeIdx] && (
        <CaseStudy project={content.projects[activeIdx]} onClose={() => setActiveIdx(null)} />
      )}
    </div>
  );
}

function Nav({ p }) {
  const link = 'rounded-full px-3.5 py-2 text-body hover:bg-white/70 hover:text-ink';
  return (
    <nav className="sticky top-3 z-20 flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-white/90 bg-[rgba(246,246,251,0.92)] py-3 pr-3.5 pl-4 shadow-[0_8px_30px_rgba(60,60,110,0.06)] backdrop-blur-[18px]">
      <a href="#home" className="flex items-center gap-3 text-ink hover:text-ink">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-base font-extrabold text-white">{p.initials}</div>
        <div className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold">{p.name}</span>
          <span className="text-xs text-muted">{p.role}</span>
        </div>
      </a>
      <div className="flex max-w-full flex-nowrap gap-1 overflow-x-auto text-[13px] font-medium whitespace-nowrap">
        <a href="#work" className={link}>Projects</a>
        <a href="#experience" className={link}>Experience</a>
        <a href="#tools" className={link}>Tools</a>
      </div>
      <a
        href={`mailto:${contactEmail}`}
        className="flex items-center gap-2.5 rounded-full bg-white px-[18px] py-2.5 text-[13px] font-semibold text-ink shadow-[0_2px_10px_rgba(60,60,110,0.08)] hover:text-ink"
      >
        Let's Connect <span className="text-[15px]">↗</span>
      </a>
    </nav>
  );
}

function Hero({ p }) {
  const floating = 'rounded-[20px] border border-white bg-white/70 backdrop-blur-[14px] shadow-[0_12px_30px_rgba(60,60,110,0.1)]';
  const bars = [
    ['30%', '#e2dcfb'], ['45%', '#d4cafa'], ['40%', '#c5b7f8'], ['65%', '#b3a2f6'], ['80%', '#9c86f3'], ['100%', '#8b6cf0'],
  ];
  return (
    <section
      id="home"
      className="glass-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-center gap-8 px-6 py-10 shadow-[0_20px_60px_rgba(70,60,140,0.07)] backdrop-blur-[20px] sm:px-12 sm:py-14"
    >
      <div className="flex flex-col gap-[22px]">
        <div className="eyebrow">Hello, I'm</div>
        <div className="flex flex-col gap-1.5">
          <h1 className="m-0 text-[clamp(44px,6vw,68px)] leading-[1.02] font-bold tracking-[-0.03em]">{p.name}</h1>
          <div className="gradient-text text-[clamp(28px,3.6vw,40px)] leading-[1.15] font-bold tracking-[-0.02em]">{p.role}</div>
        </div>
        <p className="m-0 max-w-[440px] text-base leading-[1.65] text-pretty text-body">{p.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href="#work"
            className="flex items-center gap-3 rounded-full bg-ink px-6 py-[15px] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(21,21,31,0.2)] hover:bg-ink-soft hover:text-white"
          >
            View My Work <span>↗</span>
          </a>
          {p.cvUrl && (
            <a
              href={p.cvUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-full border border-white bg-white/85 px-6 py-[15px] text-sm font-semibold text-ink shadow-[0_4px_14px_rgba(60,60,110,0.06)] hover:bg-white hover:text-ink"
            >
              Download CV <span>↓</span>
            </a>
          )}
        </div>
        {p.companies.length > 0 && (
          <div className="mt-3.5 flex flex-col gap-3">
            <div className="text-xs font-medium text-muted">Worked with teams at</div>
            <div className="flex flex-wrap gap-x-7 gap-y-2 text-[17px] font-bold tracking-[-0.01em] text-faint">
              {p.companies.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative flex min-h-[440px] items-center justify-center">
        <div className="relative box-border aspect-[4/5] w-[min(100%,360px)] rounded-[44px] border border-white/95 bg-white/50 p-2.5 shadow-[0_30px_70px_rgba(110,90,200,0.18)]">
          {p.photoUrl ? (
            <img src={p.photoUrl} alt={p.name} className="block h-full w-full rounded-[36px] object-cover" />
          ) : (
            <ImagePlaceholder label="Your portrait" className="rounded-[36px]" />
          )}
        </div>
        <div className={`absolute top-2.5 right-0 px-5 py-4 text-center ${floating}`}>
          <div className="text-4xl leading-none font-bold tracking-[-0.03em]">{p.yearsExp}</div>
          <div className="mt-1.5 text-[11px] leading-snug text-muted">
            Years of
            <br />
            <b className="text-ink">Experience</b>
          </div>
        </div>
        <div className={`absolute right-0 bottom-5 w-[190px] bg-white/[0.72] px-[18px] py-4 ${floating}`}>
          <div className="text-[11px] text-muted">{p.highlightLabel}</div>
          <div className="mt-1 text-[22px] font-bold">{p.highlightValue}</div>
          <div className="mt-2.5 flex h-[34px] items-end gap-[5px]">
            {bars.map(([h, bg]) => (
              <div key={bg} className="flex-1 rounded" style={{ height: h, background: bg }} />
            ))}
          </div>
        </div>
        <div className="absolute top-[48%] left-0 grid h-[58px] w-[58px] place-items-center rounded-full border border-white bg-white/75 text-[22px] text-accent shadow-[0_10px_26px_rgba(110,90,200,0.2)]">
          ◆
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="m-0 text-[30px] font-bold tracking-[-0.02em]">{title}</h2>
    </div>
  );
}

function Projects({ projects, onOpen }) {
  const [filter, setFilter] = useState('All');
  const cats = useMemo(() => ['All', ...new Set(projects.map((x) => x.cat).filter(Boolean))], [projects]);
  const shown = projects.map((x, i) => ({ ...x, i })).filter((x) => filter === 'All' || x.cat === filter);

  return (
    <section id="work" className="glass-section flex flex-col gap-[26px] px-6 py-10 sm:px-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead eyebrow="Featured projects" title="Selected Work" />
        <div className="flex flex-wrap gap-1.5 rounded-full border border-white bg-white/70 p-[5px]">
          {cats.map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`cursor-pointer rounded-full border-0 px-3.5 py-2 text-xs font-semibold transition-colors ${
                label === filter ? 'bg-ink text-white' : 'bg-transparent text-body hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[18px]">
        {shown.map((p) => (
          <article
            key={p.i}
            className="flex flex-col overflow-hidden rounded-[22px] border border-white bg-white/70 shadow-[0_10px_30px_rgba(60,60,110,0.06)]"
          >
            <div className="relative mx-2.5 mt-2.5 h-[200px] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#efeafe,#e3e9fb)]">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.title} className="block h-full w-full object-cover" />
              ) : (
                <ImagePlaceholder label="Project image" />
              )}
            </div>
            <div className="flex flex-col gap-2.5 px-5 pt-[18px] pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="text-base font-bold">{p.title}</div>
                  <div className="text-xs text-subtle">{p.meta}</div>
                </div>
                <button
                  onClick={() => onOpen(p.i)}
                  aria-label={`Open case study: ${p.title}`}
                  className="h-9 w-9 flex-none cursor-pointer rounded-full border border-line bg-white text-[15px] text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  ↗
                </button>
              </div>
              <div className="text-[13px] leading-relaxed text-copy">{p.summary}</div>
              <div className="mt-1 flex flex-wrap gap-2">
                {p.impact && <span className="rounded-full bg-pill px-2.5 py-1.5 text-[11px] font-bold text-pill-fg">{p.impact}</span>}
                {p.tag && <span className="rounded-full bg-soft px-2.5 py-1.5 text-[11px] font-semibold text-body">{p.tag}</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Experience({ items }) {
  return (
    <section id="experience" className="glass-section flex flex-col gap-[26px] px-6 py-10 sm:px-12">
      <SectionHead eyebrow="Career" title="Experience" />
      <div className="flex flex-col gap-3">
        {items.map((e, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-[20px] border border-white bg-white/75 p-6 sm:grid-cols-[minmax(140px,200px)_minmax(0,1fr)] sm:gap-6"
          >
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs text-accent">{e.period}</span>
              {e.current && (
                <span className="self-start rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok">Current</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[17px] font-bold">{[e.title, e.company].filter(Boolean).join(' · ')}</div>
              <div className="text-sm leading-[1.65] text-pretty text-copy">{e.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tools({ tools, skills }) {
  return (
    <section id="tools" className="glass-section flex flex-col gap-[26px] px-6 py-10 sm:px-12">
      <SectionHead eyebrow="Tools & skills" title="Tools I Use" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(118px,1fr))] gap-3">
        {tools.map((t, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2.5 rounded-[18px] border border-white bg-white/75 px-2.5 py-[18px] shadow-[0_6px_18px_rgba(60,60,110,0.05)]"
          >
            <div
              className="grid h-10 w-10 place-items-center rounded-[11px] text-[13px] font-extrabold"
              style={{ background: t.bg, color: t.fg }}
            >
              {t.abbr}
            </div>
            <div className="text-center text-[13px] font-semibold">{t.name}</div>
            <div className="text-[11px] text-subtle">{t.level}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="rounded-full border border-white bg-white/80 px-3.5 py-2 text-xs font-semibold text-text">
            {s}
          </span>
        ))}
      </div>
    </section>
  );
}

function Contact({ p }) {
  const email = p.email || contactEmail;
  const icon = 'grid h-10 w-10 flex-none place-items-center rounded-xl bg-white text-accent';
  const row = 'flex items-center gap-3.5 text-sm font-medium text-ink hover:text-ink';

  return (
    <section
      id="contact"
      className="glass-section grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-center gap-9 px-6 py-11 backdrop-blur-[20px] sm:px-12"
    >
      <div className="flex flex-col gap-[22px]">
        <div className="eyebrow">Let's connect</div>
        <h2 className="m-0 -mt-2 max-w-[440px] text-[30px] leading-tight font-bold tracking-[-0.02em] text-balance">
          {p.contactHeading}
        </h2>
        <div className="mt-1.5 flex flex-col gap-3.5">
          {email && (
            <a href={`mailto:${email}`} className={row}>
              <span className={icon}>✉</span>
              {email}
            </a>
          )}
          {p.phone && (
            <a href={`tel:${String(p.phone).replace(/[^\d+]/g, '')}`} className={row}>
              <span className={icon}>☏</span>
              {p.phone}
            </a>
          )}
          {p.linkedin && (
            <a href={p.linkedinUrl} target="_blank" rel="noopener" className={row}>
              <span className={`${icon} text-[13px] font-extrabold`}>in</span>
              {p.linkedin}
            </a>
          )}
          {p.location && (
            <div className={row}>
              <span className={icon}>◎</span>
              {p.location}
            </div>
          )}
        </div>
      </div>

      {email && (
        <div className="flex flex-col items-start gap-4 rounded-3xl border border-white bg-white/70 p-8 shadow-[0_14px_40px_rgba(60,60,110,0.07)]">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-pill text-[22px] text-accent">✉</div>
          <div className="text-xl font-bold">Start a conversation</div>
          <div className="text-sm leading-relaxed text-copy">
            Roles, contract projects or a process review — send a short note and I usually reply within one business day.
          </div>
          <a
            href={`mailto:${email}`}
            className="mt-1 flex items-center gap-3 rounded-full bg-ink px-[30px] py-[15px] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(21,21,31,0.2)] hover:bg-ink-soft hover:text-white"
          >
            Email me <span>↗</span>
          </a>
        </div>
      )}
    </section>
  );
}

function Block({ title, children }) {
  if (!children) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-bold">{title}</div>
      <div className="text-sm leading-[1.65] text-text">{children}</div>
    </div>
  );
}

function CaseStudy({ project: a, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(30,28,50,0.35)] p-5 backdrop-blur-[6px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={a.title}
        onClick={(e) => e.stopPropagation()}
        className="box-border flex max-h-[88vh] w-[min(100%,640px)] flex-col gap-5 overflow-auto rounded-[26px] bg-white/[0.96] p-[30px] shadow-[0_30px_80px_rgba(30,28,70,0.25)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="eyebrow">Case study</div>
            <div className="text-2xl font-bold tracking-[-0.02em]">{a.title}</div>
            <div className="text-[13px] text-subtle">{a.meta}</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-[38px] w-[38px] flex-none cursor-pointer rounded-full border border-line bg-white text-base"
          >
            ✕
          </button>
        </div>
        {a.stats?.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
            {a.stats.map((s, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-[14px] bg-[#f5f3ff] p-3.5">
                <div className="text-xl font-bold text-accent-deep">{s.v}</div>
                <div className="text-[11px] text-copy">{s.l}</div>
              </div>
            ))}
          </div>
        )}
        <Block title="Problem">{a.problem}</Block>
        <Block title="Approach">{a.approach}</Block>
        <Block title="Outcome">{a.outcome}</Block>
        {a.tools?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {a.tools.map((t) => (
              <span key={t} className="rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-text">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

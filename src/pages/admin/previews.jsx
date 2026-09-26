import { toList } from '../../lib/portfolio-data.js';

const card = 'rounded-[22px] border border-white bg-white/80 shadow-[0_10px_30px_rgba(60,60,110,0.08)]';

export function ProjectPreview({ x }) {
  const stats = [0, 1, 2].map((j) => (x.stats || [])[j] || {});
  return (
    <>
      <div className={`flex flex-col overflow-hidden ${card}`}>
        <div className="placeholder-stripes mx-2.5 mt-2.5 grid h-[180px] place-items-center overflow-hidden rounded-2xl">
          {x.imageUrl ? (
            <img src={x.imageUrl} alt="" className="block h-full w-full object-cover" />
          ) : (
            <span className="font-mono text-[11px] text-[#8a80b8]">cover image</span>
          )}
        </div>
        <div className="flex flex-col gap-2.5 px-5 pt-[18px] pb-5">
          <div className="flex flex-col gap-1">
            <div className="text-base font-bold">{x.title}</div>
            <div className="text-xs text-subtle">{x.meta}</div>
          </div>
          <div className="text-[13px] leading-relaxed text-copy">{x.summary}</div>
          <div className="flex flex-wrap gap-2">
            {x.impact && <span className="rounded-full bg-pill px-2.5 py-1.5 text-[11px] font-bold text-pill-fg">{x.impact}</span>}
            {x.tag && <span className="rounded-full bg-soft px-2.5 py-1.5 text-[11px] font-semibold text-body">{x.tag}</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-[3px] rounded-[14px] border border-white bg-white/80 p-3">
            <div className="text-base font-bold text-accent-deep">{s.v || '—'}</div>
            <div className="text-[11px] text-copy">{s.l || 'Stat label'}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function RolePreview({ x }) {
  return (
    <div className={`flex flex-col gap-2.5 p-[22px] ${card}`}>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-xs text-accent">{x.period}</span>
        {x.current && <span className="rounded-full bg-ok-bg px-2.5 py-1 text-[11px] font-bold text-ok">Current</span>}
      </div>
      <div className="text-[17px] font-bold">{[x.title, x.company].filter(Boolean).join(' · ') || 'Job title · Company'}</div>
      <div className="text-sm leading-[1.65] text-copy">{x.description}</div>
    </div>
  );
}

export function ToolPreview({ x }) {
  return (
    <div className="flex justify-center rounded-[22px] border border-white bg-white/55 p-[30px]">
      <div className="flex w-[140px] flex-col items-center gap-2.5 rounded-[18px] bg-white px-2.5 py-[18px] shadow-[0_6px_18px_rgba(60,60,110,0.08)]">
        <div className="grid h-10 w-10 place-items-center rounded-[11px] text-[13px] font-extrabold" style={{ background: x.bg, color: x.fg }}>
          {x.abbr}
        </div>
        <div className="text-center text-[13px] font-semibold">{x.name}</div>
        <div className="text-[11px] text-subtle">{x.level}</div>
      </div>
    </div>
  );
}

export function SkillsPreview({ skills }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-[22px] border border-white bg-white/55 p-[22px]">
      {toList(skills).map((s) => (
        <span key={s} className="rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-text">
          {s}
        </span>
      ))}
    </div>
  );
}

export function ProfilePreview({ p }) {
  return (
    <div className={`flex flex-col gap-3.5 p-6 ${card}`}>
      <div className="flex items-center gap-3.5">
        <div className="placeholder-stripes h-20 w-16 flex-none overflow-hidden rounded-2xl">
          {p.photoUrl && <img src={p.photoUrl} alt="" className="block h-full w-full object-cover" />}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="text-[22px] font-bold tracking-[-0.02em]">{p.name}</div>
          <div className="gradient-text text-base font-bold">{p.role}</div>
        </div>
      </div>
      <div className="text-[13px] leading-relaxed text-body">{p.tagline}</div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-0.5 rounded-[14px] bg-[#f7f7fb] p-3">
          <div className="text-xl font-bold">{p.yearsExp}</div>
          <div className="text-[11px] text-muted">Years of experience</div>
        </div>
        <div className="flex flex-1 flex-col gap-0.5 rounded-[14px] bg-[#f7f7fb] p-3">
          <div className="text-xl font-bold">{p.highlightValue}</div>
          <div className="text-[11px] text-muted">{p.highlightLabel}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3.5 text-[13px] font-bold text-faint">
        {toList(p.companies).map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="flex flex-col gap-1.5 border-t border-[#efeff5] pt-3 text-xs text-body">
        <span>✉ {p.email}</span>
        <span>☏ {p.phone}</span>
        <span>◎ {p.location}</span>
      </div>
    </div>
  );
}

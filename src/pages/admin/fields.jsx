import { toList } from '../../lib/portfolio-data.js';

export const getIn = (o, p) => p.reduce((a, k) => (a == null ? a : a[k]), o);
export const setIn = (o, p, v) => {
  if (!p.length) return v;
  const [k, ...rest] = p;
  const c = Array.isArray(o) ? [...o] : { ...(o || {}) };
  c[k] = setIn(o ? o[k] : undefined, rest, v);
  return c;
};

// Field spec helper: f(['profile','name'], 'Full name', { required: true })
export const f = (path, label, opts = {}) => ({ path, label, ...opts });

export function Field({ spec, draft, update }) {
  const { path, label, hint = '', help = '', type = 'text', rows = 4, full, required, max, list, area, color, check, options } = spec;
  const raw = getIn(draft, path);
  const value = list ? (Array.isArray(raw) ? raw.join(', ') : raw ?? '') : raw ?? '';
  const len = String(value).length;
  const empty = required && !String(value).trim();
  const tooLong = max && len > max;
  const error = empty ? 'Required' : tooLong ? `Keep it under ${max} characters` : '';
  const onChange = (e) => update(path, check ? e.target.checked : e.target.value);
  const bad = error ? '!border-[#f0b4ae]' : '';

  let control;
  if (area) {
    control = <textarea value={value} onChange={onChange} placeholder={hint} rows={rows} className={`field resize-y leading-relaxed ${bad}`} />;
  } else if (color) {
    control = (
      <span className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={onChange}
          className="box-border h-11 w-[52px] flex-none cursor-pointer rounded-xl border border-line-2 bg-white p-1"
        />
        <input type="text" value={value} onChange={onChange} className="field font-mono !text-[13px]" />
      </span>
    );
  } else if (check) {
    control = (
      <span className="flex h-11 items-center gap-2.5 rounded-xl border border-line-2 bg-white px-3.5">
        <input type="checkbox" checked={!!raw} onChange={onChange} className="h-[18px] w-[18px] accent-accent" />
        <span className="text-[13px] text-text">{hint}</span>
      </span>
    );
  } else if (options) {
    const opts = options.includes(value) || !value ? options : [value, ...options];
    control = (
      <select value={value} onChange={onChange} className="field">
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  } else {
    control = <input type={type} value={value} onChange={onChange} placeholder={hint} className={`field ${bad}`} />;
  }

  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${full ? 'col-span-full' : ''}`}>
      <span className="flex justify-between gap-2 text-xs font-semibold text-text">
        <span>
          {label}
          {required && <span className="text-danger"> *</span>}
        </span>
        {max && <span className="font-medium text-faint">{`${len}/${max}`}</span>}
      </span>
      {control}
      {help && <span className="text-xs leading-normal text-[#8a8aa0]">{help}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

export function FormCards({ cards, draft, update }) {
  return cards.map((c, i) => (
    <div
      key={c.title}
      className="flex flex-col gap-[18px] rounded-[22px] border border-white bg-white/[0.78] p-6 shadow-[0_10px_30px_rgba(60,60,110,0.05)]"
    >
      <div className="flex items-start gap-3.5">
        <div className="grid h-[30px] w-[30px] flex-none place-items-center rounded-[9px] bg-pill text-xs font-extrabold text-pill-fg">
          {String(i + 1).padStart(2, '0')}
        </div>
        <div className="flex flex-col gap-[3px]">
          <div className="text-base font-bold">{c.title}</div>
          <div className="text-[13px] leading-normal text-subtle">{c.subtitle}</div>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-4">
        {c.fields.map((spec) => (
          <Field key={spec.path.join('.')} spec={spec} draft={draft} update={update} />
        ))}
      </div>
    </div>
  ));
}

export { toList };

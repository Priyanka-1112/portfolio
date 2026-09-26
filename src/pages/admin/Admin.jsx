import { useCallback, useEffect, useRef, useState } from 'react';
import * as fb from '../../lib/firebase.js';
import { cleanContent, mergeContent, newProject, newRole, newTool, toList } from '../../lib/portfolio-data.js';
import { FormCards, f, setIn } from './fields.jsx';
import { ProfilePreview, ProjectPreview, RolePreview, SkillsPreview, ToolPreview } from './previews.jsx';

const SECTIONS = {
  projects: { label: 'Projects', singular: 'project', add: 'Add project', make: newProject },
  experience: { label: 'Experience', singular: 'role', add: 'Add role', make: newRole },
  tools: { label: 'Tools & Skills', singular: 'tool', add: 'Add tool', make: newTool },
};
const NAV = [['', 'Dashboard'], ['profile', 'Profile & Hero'], ['projects', 'Projects'], ['experience', 'Experience'], ['tools', 'Tools & Skills'], ['messages', 'Messages']];
const CATS = ['Process', 'Data', 'Systems', 'Strategy', 'Product', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Expert'];

const parseHash = () => {
  const [page = '', id = ''] = (location.hash || '').replace(/^#\/?/, '').split('/');
  return { page, id: id === '' ? null : decodeURIComponent(id) };
};
const go = (h) => (location.hash = h);

const msgView = (m) => {
  const dt = m.createdAt ? new Date(m.createdAt) : null;
  return {
    ...m,
    href: `#/messages/${encodeURIComponent(m.id)}`,
    initial: (m.name || '?')[0].toUpperCase(),
    snippet: String(m.message || '').replace(/\s+/g, ' ').slice(0, 140),
    mailto: 'mailto:' + m.email + '?subject=' + encodeURIComponent('Re: ' + (m.topic || 'your message')),
    date: dt ? dt.toLocaleString() : '',
    shortDate: dt ? dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
  };
};

const btnDark = 'cursor-pointer rounded-full border-0 bg-ink font-semibold text-white hover:bg-ink-soft hover:text-white';
const btnLight = 'cursor-pointer rounded-full border border-line bg-white font-semibold text-ink hover:text-ink';
const panel = 'rounded-[22px] border border-white bg-white/75';

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);
  const [route, setRoute] = useState(parseHash);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgLoaded, setMsgLoaded] = useState(false);
  const toastTimer = useRef();
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  const authorized = fb.isAdmin(user);

  const flash = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 2600);
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      setMessages(await fb.listMessages());
    } catch (e) {
      flash('Could not load messages: ' + e.message);
    } finally {
      setMsgLoaded(true);
    }
  }, [flash]);

  useEffect(() => {
    document.title = 'Portfolio Admin';
    const onHash = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    const onUnload = (e) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('beforeunload', onUnload);
    let unsub;
    let alive = true;
    fb.onAuth((u) => {
      setUser(u);
      setReady(true);
    }).then((fn) => (alive ? (unsub = fn) : fn?.()));
    return () => {
      alive = false;
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('beforeunload', onUnload);
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Load content + messages once an authorized admin is signed in.
  useEffect(() => {
    if (!authorized || draft) return;
    (async () => {
      let d;
      try {
        d = mergeContent(await fb.loadContent());
      } catch (e) {
        flash('Could not load content: ' + e.message);
        d = mergeContent(null);
      }
      setDraft(d);
      setSaved(d);
      setDirty(false);
      loadMessages();
    })();
  }, [authorized, draft, flash, loadMessages]);

  const update = useCallback((path, v) => {
    setDraft((d) => setIn(d, path, v));
    setDirty(true);
  }, []);

  const login = async () => {
    setBusy(true);
    setAuthError('');
    try {
      await fb.signInWithGoogle();
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setAuthError(String(err.message || err).replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  };
  const logout = async () => {
    if (dirty && !confirm('You have unsaved changes. Sign out anyway?')) return;
    await fb.signOutUser();
    setDraft(null);
    setSaved(null);
    setDirty(false);
    setMessages([]);
    setMsgLoaded(false);
  };
  const save = async () => {
    setSaving(true);
    try {
      const clean = cleanContent(draft);
      await fb.saveContent(clean);
      setDraft(clean);
      setSaved(clean);
      setDirty(false);
      flash('Changes published');
    } catch (e) {
      flash('Publish failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };
  const discard = () => {
    if (confirm('Discard all unpublished changes?')) {
      setDraft(saved);
      setDirty(false);
    }
  };

  const move = (key, i, dir) => {
    const arr = [...draft[key]];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    update([key], arr);
  };
  const remove = (key, i, label, thenGo) => {
    if (!confirm(`Delete "${label || 'this item'}"?`)) return;
    update([key], draft[key].filter((_, k) => k !== i));
    if (thenGo) go(thenGo);
  };
  const add = (key) => {
    const arr = [...draft[key], SECTIONS[key].make()];
    update([key], arr);
    go(`#/${key}/${arr.length - 1}`);
  };

  const shell = (children) => (
    <div className="page-bg box-border p-5">
      {children}
      {toast && (
        <div className="fixed bottom-7 left-1/2 z-60 -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-white shadow-[0_12px_30px_rgba(21,21,31,0.25)]">
          {toast}
        </div>
      )}
    </div>
  );

  if (!ready || (authorized && !draft)) {
    return shell(<div className="grid min-h-[80vh] place-items-center font-mono text-[13px] text-subtle">Checking access…</div>);
  }

  if (!user) {
    return shell(
      <div className="grid min-h-[85vh] place-items-center">
        <div className="box-border flex w-[min(100%,400px)] flex-col gap-4 rounded-[26px] border border-white bg-white/70 p-9 shadow-[0_20px_60px_rgba(70,60,140,0.1)] backdrop-blur-[20px]">
          <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-ink font-extrabold text-white">⚿</div>
          <div className="mb-1.5 flex flex-col gap-1.5">
            <div className="text-2xl font-bold tracking-[-0.02em]">Admin sign in</div>
            <div className="text-sm leading-normal text-muted">Only the portfolio owner's Google account can access this area.</div>
          </div>
          <button
            onClick={login}
            disabled={busy}
            className="flex cursor-pointer items-center justify-center gap-3 rounded-full border border-[#e3e3ee] bg-white p-3.5 text-sm font-bold text-ink shadow-[0_4px_14px_rgba(60,60,110,0.06)] hover:bg-[#f7f7fb] disabled:opacity-70"
          >
            <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[conic-gradient(#ea4335_0_25%,#fbbc05_0_50%,#34a853_0_75%,#4285f4_0)]">
              <span className="h-3 w-3 rounded-full bg-white" />
            </span>
            {busy ? 'Opening Google…' : fb.isConfigured ? 'Continue with Google' : 'Continue with Google (demo)'}
          </button>
          {authError && <div className="text-[13px] leading-normal text-danger">{authError}</div>}
          {!fb.isConfigured && (
            <div className="rounded-xl bg-[#fdf6e3] px-3 py-2.5 text-xs leading-normal text-muted">
              Demo mode: Firebase isn't configured yet, so sign-in is simulated and changes save to this browser only.
            </div>
          )}
          <a href="/" className="text-center text-[13px] text-muted">
            ← Back to site
          </a>
        </div>
      </div>,
    );
  }

  if (!authorized) {
    return shell(
      <div className="grid min-h-[85vh] place-items-center">
        <div className="box-border flex w-[min(100%,400px)] flex-col gap-3.5 rounded-[26px] border border-white bg-white/70 p-[34px]">
          <div className="text-[22px] font-bold">Access denied</div>
          <div className="text-sm leading-relaxed text-muted">{user.email} is not an admin for this portfolio.</div>
          <button onClick={logout} className={`${btnDark} p-[13px] text-sm`}>
            Sign out and try another account
          </button>
        </div>
      </div>,
    );
  }

  const msgs = messages.map(msgView);
  const counts = { projects: draft.projects.length, experience: draft.experience.length, tools: draft.tools.length, messages: messages.length || '' };
  const view = buildPage({ route, draft, user, msgs, msgLoaded, add, move, remove, loadMessages, flash });

  return shell(
    <div className="mx-auto flex max-w-[1240px] flex-col gap-[18px]">
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3.5 rounded-[20px] border border-white bg-white/[0.72] py-3 pr-3.5 pl-4 shadow-[0_8px_30px_rgba(60,60,110,0.06)] backdrop-blur-[18px]">
        <a href="#/" className="flex items-center gap-3 text-ink hover:text-ink">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-[15px] font-extrabold text-white">⚙</div>
          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-bold">Portfolio Admin</span>
            <span className="text-xs text-muted">{fb.isConfigured ? 'Connected to Firebase' : 'Demo mode · local only'}</span>
          </div>
        </a>
        <div className="flex flex-wrap items-center gap-2">
          {dirty && (
            <>
              <span className="flex items-center gap-1.5 pr-1.5 text-xs font-semibold text-[#9a6a00]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#e0a100]" />
                Unsaved changes
              </span>
              <button onClick={discard} className="cursor-pointer rounded-full border-0 bg-transparent px-3.5 py-2.5 text-[13px] font-semibold text-body">
                Discard
              </button>
            </>
          )}
          <a href="/" target="_blank" className={`${btnLight} px-4 py-2.5 text-[13px]`}>
            View site ↗
          </a>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className={`rounded-full border-0 px-5 py-2.5 text-[13px] font-bold text-white ${dirty ? 'cursor-pointer bg-ink' : 'bg-[#b9b9c8]'}`}
          >
            {saving ? 'Publishing…' : dirty ? 'Publish changes' : 'All changes live'}
          </button>
          <div className="ml-1 flex items-center gap-2.5 border-l border-line-2 pl-2.5">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-[34px] w-[34px] rounded-full object-cover" />
            ) : (
              <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#ece8fd] text-[13px] font-extrabold text-accent-deep">
                {(user.displayName || user.email || '?')[0].toUpperCase()}
              </div>
            )}
            <button onClick={logout} className="cursor-pointer rounded-full border border-line bg-transparent px-3 py-2 text-xs font-semibold text-body">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-start gap-[18px]">
        <aside className="flex max-w-full flex-[1_1_200px] flex-col gap-1 rounded-[20px] border border-white bg-white/55 p-2.5 md:max-w-[240px]">
          {NAV.map(([key, label]) => {
            const on = route.page === key;
            return (
              <a
                key={key}
                href={'#/' + key}
                className={`flex items-center justify-between gap-2 rounded-[14px] px-3.5 py-3 text-sm font-semibold ${
                  on ? 'bg-ink text-white hover:text-white' : 'text-text hover:bg-white/60 hover:text-ink'
                }`}
              >
                {label}
                <span className="text-[11px] font-bold opacity-65">{counts[key] ?? ''}</span>
              </a>
            );
          })}
        </aside>

        <main className="flex min-w-0 flex-[999_1_600px] flex-col gap-4">
          <PageHeader view={view} />
          {view.body}
        </main>
      </div>
    </div>,
  );

  // ---- page builder (closure over current state) ----
  function buildPage({ route, draft: d, user, msgs, msgLoaded, add, move, remove, loadMessages, flash }) {
    const { page, id } = route;
    const base = { crumbs: [{ label: 'Dashboard', href: '#/' }] };

    if (page === '') {
      const first = (user?.displayName || '').split(' ')[0];
      return {
        crumbs: [],
        pageCrumb: 'Dashboard',
        pageTitle: first ? `Welcome back, ${first}` : 'Welcome back',
        pageSubtitle: 'Manage everything that appears on your portfolio.',
        body: <Dashboard d={d} msgs={msgs} msgLoaded={msgLoaded} add={add} />,
      };
    }

    if (page === 'profile') {
      const P = (k) => ['profile', k];
      const cards = [
        { title: 'Identity', subtitle: 'Shown in the navigation bar and at the top of the hero.', fields: [
          f(P('name'), 'Full name', { required: 1 }),
          f(P('initials'), 'Initials', { help: 'Used as the logo mark in the navigation.', max: 3 }),
          f(P('role'), 'Role / title', { required: 1, full: 1 }),
          f(P('tagline'), 'Tagline', { area: 1, full: 1, rows: 3, max: 180, help: 'One or two sentences under your title.' })] },
        { title: 'Portrait & CV', subtitle: 'Links to files hosted anywhere public (Firebase Storage, Google Drive, etc).', fields: [
          f(P('photoUrl'), 'Portrait image URL', { full: 1, type: 'url', hint: 'https://…', help: 'Portrait orientation (4:5) looks best.' }),
          f(P('cvUrl'), 'CV / resume URL', { full: 1, type: 'url', hint: 'https://…', help: 'Leave empty to hide the Download CV button.' })] },
        { title: 'Hero highlights', subtitle: 'The floating cards next to your portrait.', fields: [
          f(P('yearsExp'), 'Years of experience', { hint: '6+' }),
          f(P('highlightValue'), 'Highlight value', { hint: '$2.4M' }),
          f(P('highlightLabel'), 'Highlight label', { full: 1, hint: 'Cost savings delivered' }),
          f(P('companies'), 'Companies worked with', { list: 1, full: 1, help: 'Separate with commas.' })] },
        { title: 'Contact details', subtitle: 'Shown beside the contact form.', fields: [
          f(P('contactHeading'), 'Section heading', { full: 1, max: 90 }),
          f(P('email'), 'Email', { type: 'email', required: 1 }),
          f(P('phone'), 'Phone'),
          f(P('linkedin'), 'LinkedIn label', { hint: 'linkedin.com/in/…' }),
          f(P('linkedinUrl'), 'LinkedIn URL', { type: 'url' }),
          f(P('location'), 'Location', { full: 1 })] },
      ];
      return {
        ...base, pageCrumb: 'Profile & Hero', pageTitle: 'Profile & Hero', pageSubtitle: 'Your name, headline and contact details.',
        body: <FormLayout cards={cards} draft={d} update={update} preview={<ProfilePreview p={d.profile} />} />,
      };
    }

    if (page === 'messages') {
      const crumbs = [...base.crumbs, { label: 'Messages', href: '#/messages' }];
      if (id != null) {
        const m = msgs.find((x) => String(x.id) === id);
        if (!m) {
          return { crumbs, pageCrumb: 'Message', pageTitle: 'Message', pageSubtitle: '',
            body: msgLoaded ? <NotFound back="#/messages" /> : null };
        }
        const del = async () => {
          if (!confirm('Delete this message?')) return;
          try {
            await fb.deleteMessage(m.id);
            await loadMessages();
            go('#/messages');
            flash('Message deleted');
          } catch (e) {
            flash('Delete failed: ' + e.message);
          }
        };
        return { crumbs, pageCrumb: m.name, pageTitle: m.topic || 'Message', pageSubtitle: `From ${m.name}`,
          body: <MessageDetail m={m} onDelete={del} /> };
      }
      return {
        ...base, pageCrumb: 'Messages', pageTitle: 'Messages', pageSubtitle: 'Submissions from your contact form.',
        actions: <button onClick={loadMessages} className={`${btnLight} px-[18px] py-2.5 text-[13px]`}>Refresh</button>,
        body: <MessageList msgs={msgs} msgLoaded={msgLoaded} />,
      };
    }

    const sec = SECTIONS[page];
    if (!sec) return { ...base, pageCrumb: 'Not found', pageTitle: 'Page not found', pageSubtitle: '', body: <NotFound back="#/" /> };
    const arr = d[page];
    const addBtn = <button onClick={() => add(page)} className={`${btnDark} px-[18px] py-2.5 text-[13px]`}>+ {sec.add}</button>;

    // List view
    if (id == null) {
      const items = arr.map((x, i) => {
        const common = { key: i, href: `#/${page}/${i}`, up: () => move(page, i, -1), down: () => move(page, i, 1), remove: () => remove(page, i, x.title || x.name) };
        if (page === 'projects') return { ...common, title: x.title || 'Untitled project', subtitle: x.meta || x.summary, badge: x.cat, sw: String(i + 1).padStart(2, '0'), swBg: '#f1edff', swFg: '#5b45d6' };
        if (page === 'experience') return { ...common, title: [x.title, x.company].filter(Boolean).join(' · ') || 'Untitled role', subtitle: x.period, badge: x.current ? 'Current' : '', sw: (x.company || '?')[0], swBg: '#e4ecfb', swFg: '#2b4aa8' };
        return { ...common, title: x.name || 'Untitled tool', subtitle: x.level, badge: '', sw: x.abbr, swBg: x.bg, swFg: x.fg };
      });
      return {
        ...base, pageCrumb: sec.label, pageTitle: sec.label,
        pageSubtitle: `${arr.length} ${sec.singular}${arr.length === 1 ? '' : 's'} · order here is the order on your site.`,
        actions: addBtn,
        body: (
          <>
            <ItemList items={items} />
            {page === 'tools' && (
              <FormLayout
                draft={d}
                update={update}
                cards={[{ title: 'Skills & methods', subtitle: 'The pills shown below your tool grid.', fields: [
                  f(['skills'], 'Skills', { list: 1, full: 1, area: 1, rows: 3, help: 'Separate with commas.' })] }]}
                preview={<SkillsPreview skills={d.skills} />}
              />
            )}
          </>
        ),
      };
    }

    // Detail / edit view
    const i = Number(id);
    const x = arr[i];
    const crumbs = [...base.crumbs, { label: sec.label, href: `#/${page}` }];
    if (!Number.isInteger(i) || !x) return { crumbs, pageCrumb: 'Not found', pageTitle: 'Not found', pageSubtitle: '', body: <NotFound back={`#/${page}`} /> };
    const Q = (...k) => [page, i, ...k];
    const prevNext = arr.length > 1 && (
      <>
        <a href={`#/${page}/${i - 1}`} className={`${btnLight} px-3.5 py-2.5 text-[13px] ${i > 0 ? '' : 'pointer-events-none !text-[#c0c0cc]'}`}>← Prev</a>
        <a href={`#/${page}/${i + 1}`} className={`${btnLight} px-3.5 py-2.5 text-[13px] ${i < arr.length - 1 ? '' : 'pointer-events-none !text-[#c0c0cc]'}`}>Next →</a>
      </>
    );
    const del = <DeleteCard singular={sec.singular} onDelete={() => remove(page, i, x.title || x.name, `#/${page}`)} />;

    if (page === 'projects') {
      const cards = [
        { title: 'Basics', subtitle: 'How the project is labelled and filtered on your site.', fields: [
          f(Q('title'), 'Project title', { required: 1, full: 1, max: 60 }),
          f(Q('cat'), 'Category', { options: CATS, help: 'Visitors filter projects by category.' }),
          f(Q('meta'), 'Client · type', { hint: 'Northwind Bank · Process improvement' }),
          f(Q('impact'), 'Impact badge', { hint: '−38% cycle time', max: 24 }),
          f(Q('tag'), 'Methods tag', { hint: 'BPMN · Jira', max: 30 })] },
        { title: 'Card', subtitle: 'The cover image and summary shown in the project grid.', fields: [
          f(Q('imageUrl'), 'Cover image URL', { full: 1, type: 'url', hint: 'https://…', help: 'Landscape, around 1200×800. Leave empty for a placeholder.' }),
          f(Q('summary'), 'Summary', { area: 1, full: 1, rows: 3, required: 1, max: 140 })] },
        { title: 'Key numbers', subtitle: 'Three headline results at the top of the case study.', fields: [0, 1, 2].flatMap((j) => [
          f(Q('stats', j, 'v'), `Result ${j + 1}`, { hint: j === 0 ? '−38%' : '' }),
          f(Q('stats', j, 'l'), `Result ${j + 1} label`, { hint: j === 0 ? 'Approval cycle time' : '' })]) },
        { title: 'Case study', subtitle: 'The story visitors read when they open the project.', fields: [
          f(Q('problem'), 'Problem', { area: 1, full: 1, help: 'What was broken, and for whom?' }),
          f(Q('approach'), 'Approach', { area: 1, full: 1, rows: 5, help: 'What you did: research, analysis, artefacts, workshops.' }),
          f(Q('outcome'), 'Outcome', { area: 1, full: 1, help: 'Measurable results.' })] },
        { title: 'Tools used', subtitle: 'Shown as tags at the bottom of the case study.', fields: [
          f(Q('tools'), 'Tools', { list: 1, full: 1, hint: 'Visio, Jira, SQL', help: 'Separate with commas.' })] },
      ];
      return { crumbs, pageCrumb: x.title || 'Untitled', pageTitle: x.title || 'Untitled project', pageSubtitle: `Project ${i + 1} of ${arr.length}`,
        actions: prevNext, body: <FormLayout cards={cards} draft={d} update={update} footer={del} preview={<ProjectPreview x={x} />} /> };
    }

    if (page === 'experience') {
      const cards = [
        { title: 'Role', subtitle: 'Your position and employer.', fields: [
          f(Q('title'), 'Job title', { required: 1 }),
          f(Q('company'), 'Company', { required: 1 }),
          f(Q('period'), 'Period', { hint: '2023 — Present' }),
          f(Q('current'), 'Status', { check: 1, hint: 'This is my current role' })] },
        { title: 'Description', subtitle: 'Responsibilities and achievements in two or three sentences.', fields: [
          f(Q('description'), 'Description', { area: 1, full: 1, rows: 5, max: 400 })] },
      ];
      return { crumbs, pageCrumb: x.title || 'Untitled', pageTitle: [x.title, x.company].filter(Boolean).join(' at ') || 'Untitled role',
        pageSubtitle: x.period || 'Role details', actions: prevNext,
        body: <FormLayout cards={cards} draft={d} update={update} footer={del} preview={<RolePreview x={x} />} /> };
    }

    const cards = [
      { title: 'Tool', subtitle: 'Name and your proficiency.', fields: [
        f(Q('name'), 'Name', { required: 1 }),
        f(Q('level'), 'Proficiency', { options: LEVELS }),
        f(Q('abbr'), 'Icon letters', { max: 3, help: '1–3 characters shown in the icon tile.' })] },
      { title: 'Icon colours', subtitle: 'Soft background with a darker text colour reads best.', fields: [
        f(Q('bg'), 'Background', { color: 1 }),
        f(Q('fg'), 'Text', { color: 1 })] },
    ];
    return { crumbs, pageCrumb: x.name || 'Untitled', pageTitle: x.name || 'Untitled tool', pageSubtitle: x.level || 'Tool details',
      actions: prevNext, body: <FormLayout cards={cards} draft={d} update={update} footer={del} preview={<ToolPreview x={x} />} /> };
  }
}

function PageHeader({ view }) {
  return (
    <div className="flex flex-col gap-3.5 px-1.5 py-1">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-subtle">
        {view.crumbs.map((cr) => (
          <span key={cr.href} className="flex items-center gap-2">
            <a href={cr.href} className="text-subtle hover:text-ink">{cr.label}</a>
            <span className="text-[#b9b9c8]">/</span>
          </span>
        ))}
        <span className="text-ink">{view.pageCrumb}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="m-0 text-[30px] leading-[1.15] font-bold tracking-[-0.02em]">{view.pageTitle}</h1>
          {view.pageSubtitle && <div className="text-sm text-muted">{view.pageSubtitle}</div>}
        </div>
        {view.actions && <div className="flex flex-wrap gap-2">{view.actions}</div>}
      </div>
    </div>
  );
}

function Dashboard({ d, msgs, msgLoaded, add }) {
  const tiles = [
    { label: 'Projects', count: d.projects.length, desc: 'Case studies in your Selected Work grid', href: '#/projects' },
    { label: 'Experience', count: d.experience.length, desc: 'Roles on your career timeline', href: '#/experience' },
    { label: 'Tools', count: d.tools.length, desc: `${toList(d.skills).length} skills & methods listed`, href: '#/tools' },
    { label: 'Messages', count: msgs.length, desc: 'Contact form submissions', href: '#/messages' },
  ];
  const quick = 'rounded-[14px] border border-line bg-white px-4 py-[13px] text-left text-[13px] font-semibold text-ink hover:text-ink';
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3.5">
        {tiles.map((t) => (
          <a
            key={t.label}
            href={t.href}
            className={`flex flex-col gap-2.5 p-[22px] text-ink shadow-[0_10px_30px_rgba(60,60,110,0.05)] hover:bg-white hover:text-ink ${panel}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-semibold text-muted">{t.label}</span>
              <span className="text-accent">↗</span>
            </div>
            <div className="text-[34px] font-bold tracking-[-0.03em]">{t.count}</div>
            <div className="text-xs leading-normal text-subtle">{t.desc}</div>
          </a>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <div className={`flex flex-[2_1_360px] flex-col gap-3 p-6 ${panel}`}>
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Recent messages</div>
            <a href="#/messages" className="text-[13px] font-semibold">View all</a>
          </div>
          {msgs.length === 0 && <div className="py-2.5 text-sm text-subtle">{msgLoaded ? 'No messages yet.' : 'Loading messages…'}</div>}
          {msgs.slice(0, 3).map((m) => (
            <a key={m.id} href={m.href} className="flex flex-col gap-1 rounded-[14px] bg-[#f7f7fb] px-4 py-3.5 text-ink hover:bg-pill hover:text-ink">
              <div className="flex justify-between gap-2.5">
                <span className="text-sm font-bold">{m.name}</span>
                <span className="font-mono text-[11px] text-subtle">{m.shortDate}</span>
              </div>
              <div className="truncate text-[13px] text-copy">{m.snippet}</div>
            </a>
          ))}
        </div>
        <div className={`flex flex-[1_1_240px] flex-col gap-2.5 p-6 ${panel}`}>
          <div className="mb-1 text-base font-bold">Quick actions</div>
          <button onClick={() => add('projects')} className={`${btnDark} !rounded-[14px] px-4 py-[13px] text-left text-[13px]`}>+ Add a project</button>
          <button onClick={() => add('experience')} className={`${quick} cursor-pointer`}>+ Add a role</button>
          <a href="#/profile" className={quick}>Edit profile &amp; hero</a>
          <a href="#/tools" className={quick}>Update tools &amp; skills</a>
        </div>
      </div>
    </>
  );
}

function ItemList({ items }) {
  const sq = 'h-8 w-8 cursor-pointer rounded-[9px] border border-line bg-white text-xs';
  return (
    <div className="flex flex-col gap-2 rounded-[22px] border border-white bg-white/55 p-2.5">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-3.5 rounded-2xl border border-white bg-white/90 px-3.5 py-3">
          <div
            className="grid h-10 w-10 flex-none place-items-center rounded-[11px] text-xs font-extrabold"
            style={{ background: it.swBg, color: it.swFg }}
          >
            {it.sw}
          </div>
          <a href={it.href} className="flex min-w-0 flex-1 flex-col gap-[3px] text-ink hover:text-ink">
            <span className="truncate text-[15px] font-bold">{it.title}</span>
            <span className="truncate text-xs text-subtle">{it.subtitle}</span>
          </a>
          {it.badge && (
            <span className="hidden flex-none rounded-full bg-pill px-2.5 py-[5px] text-[11px] font-bold text-pill-fg sm:inline">{it.badge}</span>
          )}
          <div className="flex flex-none gap-1.5">
            <button onClick={it.up} title="Move up" className={sq}>↑</button>
            <button onClick={it.down} title="Move down" className={sq}>↓</button>
            <a href={it.href} className="flex h-8 items-center rounded-[9px] bg-ink px-3.5 text-xs font-semibold text-white hover:text-white">Edit</a>
            <button onClick={it.remove} title="Delete" className={`${sq} !border-[#f4d6d3] text-[13px] text-danger`}>✕</button>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="p-9 text-center text-sm text-muted">Nothing here yet. Use the add button above.</div>}
    </div>
  );
}

function FormLayout({ cards, draft, update, preview, footer }) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="flex min-w-0 flex-[3_1_440px] flex-col gap-4">
        <FormCards cards={cards} draft={draft} update={update} />
        {footer}
      </div>
      <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-3 lg:sticky lg:top-5">
        <div className="eyebrow px-1.5">Live preview</div>
        {preview}
        <div className="px-1.5 text-xs leading-normal text-[#8a8aa0]">
          Edits are kept as a draft. Press <b>Publish changes</b> to update the live site.
        </div>
      </div>
    </div>
  );
}

function DeleteCard({ singular, onDelete }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#f4d6d3] bg-white/60 px-6 py-5">
      <div className="flex flex-col gap-[3px]">
        <div className="text-sm font-bold text-danger">Delete {singular}</div>
        <div className="text-[13px] text-subtle">Removes it from the site after you publish.</div>
      </div>
      <button onClick={onDelete} className="cursor-pointer rounded-full border border-[#f0c4bf] bg-white px-[18px] py-2.5 text-[13px] font-bold text-danger">
        Delete
      </button>
    </div>
  );
}

function NotFound({ back }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-[#d8d4ee] bg-white/60 p-10 text-center">
      <div className="text-[15px] font-bold">This item doesn't exist</div>
      <a href={back} className="text-[13px] font-semibold">← Back to list</a>
    </div>
  );
}

function MessageList({ msgs, msgLoaded }) {
  return (
    <div className="flex flex-col gap-2 rounded-[22px] border border-white bg-white/55 p-2.5">
      {msgs.length === 0 && <div className="p-9 text-center text-sm text-muted">{msgLoaded ? 'No messages yet.' : 'Loading messages…'}</div>}
      {msgs.map((m) => (
        <a key={m.id} href={m.href} className="flex items-center gap-3.5 rounded-2xl bg-white/90 px-4 py-3.5 text-ink hover:bg-white hover:text-ink">
          <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#ece8fd] text-sm font-extrabold text-accent-deep">{m.initial}</div>
          <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-bold">{m.name}</span>
              {m.topic && <span className="rounded-full bg-pill px-2 py-[3px] text-[10px] font-bold text-pill-fg">{m.topic}</span>}
            </div>
            <div className="truncate text-[13px] text-copy">{m.snippet}</div>
          </div>
          <span className="flex-none font-mono text-[11px] text-subtle">{m.shortDate}</span>
        </a>
      ))}
    </div>
  );
}

function MessageDetail({ m, onDelete }) {
  return (
    <div className="flex flex-col gap-5 rounded-[22px] border border-white bg-white/80 p-7 shadow-[0_10px_30px_rgba(60,60,110,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#ece8fd] text-[17px] font-extrabold text-accent-deep">{m.initial}</div>
          <div className="flex flex-col gap-[3px]">
            <div className="text-[17px] font-bold">{m.name}</div>
            <a href={m.mailto} className="text-[13px]">{m.email}</a>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-mono text-xs text-subtle">{m.date}</span>
          {m.topic && <span className="rounded-full bg-pill px-2.5 py-[5px] text-[11px] font-bold text-pill-fg">{m.topic}</span>}
        </div>
      </div>
      <div className="rounded-2xl bg-[#f7f7fb] p-5 text-[15px] leading-[1.75] whitespace-pre-wrap text-[#33334a]">{m.message}</div>
      <div className="flex flex-wrap gap-2.5">
        <a href={m.mailto} className={`${btnDark} px-5 py-3 text-[13px]`}>Reply by email ↗</a>
        <button onClick={onDelete} className="cursor-pointer rounded-full border border-[#f0c4bf] bg-white px-5 py-3 text-[13px] font-semibold text-danger">
          Delete message
        </button>
      </div>
    </div>
  );
}

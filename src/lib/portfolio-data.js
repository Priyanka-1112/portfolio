export const DEFAULT_CONTENT = {
  profile: {
    name: 'Maya Reyes', initials: 'MR', role: 'Business Analyst',
    tagline: 'I turn messy processes and scattered data into clear requirements, measurable KPIs and decisions teams can act on.',
    photoUrl: '', cvUrl: '',
    yearsExp: '6+', highlightLabel: 'Cost savings delivered', highlightValue: '$2.4M',
    companies: ['Northwind Bank', 'Helix Health', 'Cartwell Retail', 'Orbit Logistics'],
    contactHeading: "Have a project in mind? Let's make sense of it together.",
    email: 'hello@mayareyes.com', phone: '+1 (555) 014-2233',
    linkedin: 'linkedin.com/in/mayareyes', linkedinUrl: 'https://linkedin.com/in/mayareyes',
    location: 'Toronto, Canada · Open to remote',
  },
  projects: [
    { title: 'Loan Approval Redesign', cat: 'Process', meta: 'Northwind Bank · Process improvement', imageUrl: '', tag: 'BPMN · Jira', impact: '−38% cycle time',
      summary: 'Re-mapped the end-to-end loan approval flow and removed four manual handoffs.',
      stats: [{ v: '−38%', l: 'Approval cycle time' }, { v: '4', l: 'Handoffs removed' }, { v: '$1.1M', l: 'Annual savings' }],
      problem: 'Personal loan approvals took 9 days on average, and customers were abandoning applications mid-process.',
      approach: 'Ran 14 stakeholder interviews, produced as-is and to-be BPMN maps, and wrote 60+ user stories for an automated credit-check step.',
      outcome: 'Average approval time dropped to 5.6 days and application abandonment fell by 22%.',
      tools: ['Visio', 'Jira', 'Confluence', 'SQL'] },
    { title: 'Executive KPI Dashboard', cat: 'Data', meta: 'Cartwell Retail · Data & reporting', imageUrl: '', tag: 'Power BI · SQL', impact: '12 reports → 1',
      summary: 'Consolidated a dozen spreadsheet reports into a single Power BI dashboard for leadership.',
      stats: [{ v: '12→1', l: 'Reports consolidated' }, { v: '6 hrs', l: 'Saved per week' }, { v: '45', l: 'Active users' }],
      problem: 'Leadership relied on 12 manually assembled spreadsheets with conflicting numbers.',
      approach: 'Defined a shared KPI dictionary with finance, modelled the data in SQL and designed a Power BI dashboard with drill-downs by region and category.',
      outcome: 'One trusted weekly view of sales, margin and stock, and roughly six analyst hours saved each week.',
      tools: ['Power BI', 'SQL', 'Excel'] },
    { title: 'EHR Integration Requirements', cat: 'Systems', meta: 'Helix Health · Systems analysis', imageUrl: '', tag: 'UML · UAT', impact: '98% UAT pass',
      summary: 'Wrote the functional spec and ran UAT for connecting the billing platform to a new EHR.',
      stats: [{ v: '180', l: 'Requirements' }, { v: '98%', l: 'UAT pass rate' }, { v: '12', l: 'Clinics live' }],
      problem: 'Billing staff re-keyed patient data from the EHR, causing errors and delayed claims.',
      approach: 'Documented data mappings and integration rules, produced UML sequence diagrams and coordinated UAT with clinical and billing teams.',
      outcome: 'Went live across 12 clinics on schedule; claim rejections from data errors fell by 31%.',
      tools: ['Confluence', 'Jira', 'Visio', 'Excel'] },
    { title: 'Customer Churn Analysis', cat: 'Data', meta: 'Northwind Bank · Analytics', imageUrl: '', tag: 'Python · Tableau', impact: '+9% retention',
      summary: 'Identified the drivers of credit-card churn and shaped a targeted retention campaign.',
      stats: [{ v: '250K', l: 'Accounts analysed' }, { v: '5', l: 'Churn drivers found' }, { v: '+9%', l: 'Retention' }],
      problem: 'Card churn was rising and marketing had no clear picture of which customers were at risk.',
      approach: 'Analysed transaction and support data in Python, segmented at-risk customers and presented findings in Tableau.',
      outcome: 'The retention campaign built on the segments lifted 12-month retention by 9%.',
      tools: ['Python', 'SQL', 'Tableau'] },
    { title: 'Warehouse Returns Workflow', cat: 'Process', meta: 'Orbit Logistics · Process improvement', imageUrl: '', tag: 'Lean · BPMN', impact: '−2 days',
      summary: 'Streamlined the returns process across three warehouses using Lean analysis.',
      stats: [{ v: '−2 days', l: 'Returns processing' }, { v: '3', l: 'Sites aligned' }, { v: '−17%', l: 'Handling cost' }],
      problem: 'Each warehouse handled returns differently, with long delays before refunds were issued.',
      approach: 'Ran gemba walks and value-stream mapping, then designed one standard workflow with clear ownership.',
      outcome: 'Returns processing shortened by two days and handling cost dropped 17%.',
      tools: ['Visio', 'Excel', 'Miro'] },
    { title: 'CRM Migration', cat: 'Systems', meta: 'Cartwell Retail · Systems analysis', imageUrl: '', tag: 'Salesforce', impact: '0 data loss',
      summary: 'Gathered requirements and led data mapping for a move from a legacy CRM to Salesforce.',
      stats: [{ v: '1.2M', l: 'Records migrated' }, { v: '0', l: 'Data loss incidents' }, { v: '300', l: 'Users onboarded' }],
      problem: 'The legacy CRM was out of support and sales teams tracked leads in personal spreadsheets.',
      approach: 'Ran requirements workshops with sales and service, built field-level mapping docs and planned phased cut-over.',
      outcome: 'Migrated 1.2M records with no data loss and onboarded 300 users in two phases.',
      tools: ['Salesforce', 'Excel', 'Jira'] },
  ],
  experience: [
    { period: '2023 — Present', current: true, title: 'Senior Business Analyst', company: 'Northwind Bank',
      description: 'Lead BA on the digital lending programme. Own the requirements backlog for three squads, run discovery workshops with risk and operations, and define the KPIs used in quarterly business reviews.' },
    { period: '2021 — 2023', current: false, title: 'Business Analyst', company: 'Helix Health',
      description: 'Mapped patient intake and billing workflows across 12 clinics, wrote specs for an EHR integration and coordinated UAT with clinical staff.' },
    { period: '2019 — 2021', current: false, title: 'Junior Data Analyst', company: 'Cartwell Retail',
      description: 'Built weekly sales and inventory reports in SQL and Power BI, and supported the merchandising team with ad-hoc analysis.' },
  ],
  tools: [
    { name: 'Excel', abbr: 'XL', level: 'Advanced', bg: '#e3f4ea', fg: '#1e7a46' },
    { name: 'SQL', abbr: 'SQL', level: 'Advanced', bg: '#e4ecfb', fg: '#2b4aa8' },
    { name: 'Power BI', abbr: 'BI', level: 'Advanced', bg: '#fdf1d6', fg: '#9a6a00' },
    { name: 'Tableau', abbr: 'TB', level: 'Proficient', bg: '#e6eefc', fg: '#2d5596' },
    { name: 'Jira', abbr: 'JR', level: 'Advanced', bg: '#e1ecff', fg: '#1d5ad6' },
    { name: 'Confluence', abbr: 'CF', level: 'Advanced', bg: '#e4ecfb', fg: '#24479a' },
    { name: 'Visio', abbr: 'VS', level: 'Proficient', bg: '#e6e9fb', fg: '#3845a8' },
    { name: 'Python', abbr: 'PY', level: 'Intermediate', bg: '#fdf5d9', fg: '#7d6300' },
    { name: 'Figma', abbr: 'FG', level: 'Wireframes', bg: '#fbe6e2', fg: '#b3412c' },
    { name: 'Salesforce', abbr: 'SF', level: 'Proficient', bg: '#e1f2fb', fg: '#0f6f9e' },
  ],
  skills: ['BPMN 2.0', 'UML', 'User Stories', 'Gap Analysis', 'SWOT', 'UAT', 'Agile / Scrum', 'Data Modeling'],
};

const clone = (x) => JSON.parse(JSON.stringify(x));

export function mergeContent(data) {
  const d = clone(DEFAULT_CONTENT);
  if (!data) return d;
  return {
    profile: { ...d.profile, ...(data.profile || {}) },
    projects: Array.isArray(data.projects) ? data.projects : d.projects,
    experience: Array.isArray(data.experience) ? data.experience : d.experience,
    tools: Array.isArray(data.tools) ? data.tools : d.tools,
    skills: data.skills ?? d.skills,
  };
}

export const toList = (a) => (Array.isArray(a) ? a : String(a || '').split(',')).map((s) => String(s).trim()).filter(Boolean);

export function cleanContent(c) {
  const x = clone(c);
  x.profile.companies = toList(x.profile.companies);
  x.skills = toList(x.skills);
  x.projects = x.projects.map((p) => ({ ...p, tools: toList(p.tools), stats: (p.stats || []).filter((s) => s && (s.v || s.l)) }));
  return x;
}

export const newProject = () => ({ title: 'New project', cat: 'Process', meta: '', imageUrl: '', tag: '', impact: '', summary: '',
  stats: [{ v: '', l: '' }, { v: '', l: '' }, { v: '', l: '' }], problem: '', approach: '', outcome: '', tools: [] });
export const newRole = () => ({ period: '', current: false, title: 'New role', company: '', description: '' });
export const newTool = () => ({ name: 'New tool', abbr: 'NT', level: '', bg: '#ece8fd', fg: '#4b36b0' });

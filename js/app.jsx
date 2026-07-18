'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const TOK = {
  bg:          "#f1ece2",
  bgAlt:       "#e3dccd",
  bgDeep:      "#2c3a3a",
  ink:         "#1f2a2a",
  inkSoft:     "#5a6868",
  accent:      "#3f6764",
  accentSoft:  "#86a09c",
  rule:        "#cdc5b3",
  serif: "'Cormorant Garamond', Georgia, serif",
  sans:  "'DM Sans', system-ui, sans-serif",
  mono:  "'JetBrains Mono', ui-monospace, monospace",
};

const shell = {
  fontFamily: TOK.sans,
  color: TOK.ink,
  background: TOK.bg,
  minHeight: "100vh",
  lineHeight: 1.55,
  fontSize: 15,
};

const PAGES = [
  { label: "Home",           hash: "home" },
  { label: "Research",       hash: "research" },
  { label: "Publications",   hash: "publications" },
  { label: "Engagement",     hash: "engagement" },
  { label: "Contact",        hash: "contact" },
];

// ─────────────────────────────────────────────────────────────────────────────
// CSV PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseCSV(text) {
  if (!text) return [];
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseRow(lines[0]);
  return lines.slice(1)
    .map(line => {
      const values = parseRow(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h.trim()] = (values[i] || "").trim(); });
      return obj;
    })
    .filter(row => row[headers[0].trim()]);
}

function parseRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function splitSemi(str) {
  return (str || "").split(";").map(s => s.trim()).filter(Boolean);
}

function linkify(text) {
  if (!text || typeof text !== "string") return text;
  const regex = /(https?:\/\/[^\s<>"']+)/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<a key={m.index} href={m[0]} target="_blank" rel="noopener" style={{ color: TOK.accent, textDecoration: "underline" }}>{m[0]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA LOADER
// ─────────────────────────────────────────────────────────────────────────────
async function loadData() {
  const get  = url => fetch(url).then(r => { if (!r.ok) throw new Error(url); return r; });
  const json = url => get(url).then(r => r.json());
  const csv  = url => get(url).then(r => r.text()).then(parseCSV);

  const [site, themes, projects, publications, engagement] = await Promise.all([
    json("data/site.json"),
    csv("data/research_themes.csv"),
    csv("data/projects.csv"),
    csv("data/publications.csv"),
    csv("data/engagement.csv"),
  ]);

  // Join themes + projects
  const themeList = themes.map(t => ({
    ...t,
    tags: splitSemi(t.tags),
    projects: projects
      .filter(p => p.theme_id === t.id)
      .map(p => ({
        ...p,
        sites:    splitSemi(p.sites),
        funders:  splitSemi(p.funders),
        partners: splitSemi(p.partners),
        outputs:  splitSemi(p.outputs),
      })),
  }));

  // Build slug lookup across all themes
  const projectBySlug = {};
  themeList.forEach(t => t.projects.forEach(p => {
    projectBySlug[p.slug] = { theme: t, project: p };
  }));

  // Group publications by theme
  const pubThemes = [];
  publications.forEach(pub => {
    let group = pubThemes.find(g => g.theme === pub.theme);
    if (!group) { group = { theme: pub.theme, items: [] }; pubThemes.push(group); }
    group.items.push(pub);
  });

  return {
    site,
    themeList,
    projectBySlug,
    pubThemes,
    engagement: (() => {
      const groups = [];
      engagement.forEach(e => {
        let group = groups.find(g => g.type === e.type);
        if (!group) { group = { type: e.type, items: [] }; groups.push(group); }
        group.items.push(e);
      });
      return groups;
    })(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER IMAGES
// ─────────────────────────────────────────────────────────────────────────────
const PH_TONES = {
  warm: { bg: "#e8d9c4", accent: "#c9a989", text: "#5a4836" },
  sand: { bg: "#e7dcc7", accent: "#b8a07a", text: "#4a3c26" },
  teal: { bg: "#c8d4d2", accent: "#7a9590", text: "#2f4744" },
};

function FieldPlaceholder({ label = "photo", tone = "teal", aspect = "4 / 5" }) {
  const t = PH_TONES[tone] || PH_TONES.teal;
  const id = React.useId();
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: aspect, background: t.bg, overflow: "hidden" }}>
      <svg width="100%" height="100%" viewBox="0 0 400 500" preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, display: "block" }}>
        <defs>
          <pattern id={id} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={t.accent} strokeWidth="1" opacity="0.35" />
          </pattern>
        </defs>
        <rect width="400" height="500" fill={`url(#${id})`} />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: TOK.mono, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase",
        color: t.text, opacity: 0.7, textAlign: "center", padding: "0 16px",
      }}>▢  {label}</div>
    </div>
  );
}

function Portrait({ src, tone = "teal", aspect = "4 / 5" }) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <FieldPlaceholder label="portrait" tone={tone} aspect={aspect} />;
  return (
    <img src={src} onError={() => setFailed(true)}
      style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ active, mobile, onNav, menuOpen, onToggleMenu }) {
  if (mobile) {
    return (
      <>
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 20px", borderBottom: `1px solid ${TOK.rule}`,
          background: TOK.bg, position: "sticky", top: 0, zIndex: 20,
        }}>
          <div onClick={() => { onNav("home"); if (menuOpen) onToggleMenu(); }}
            style={{ fontFamily: TOK.serif, fontSize: 22, fontStyle: "italic", fontWeight: 400, cursor: "pointer" }}>
            Clara Siagian
          </div>
          <div onClick={onToggleMenu} style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
            <span style={{ width: 18, height: 1.5, background: TOK.ink, display: "block" }} />
            <span style={{ width: 18, height: 1.5, background: TOK.ink, display: "block" }} />
            <span style={{ width: 12, height: 1.5, background: TOK.ink, display: "block" }} />
          </div>
        </header>
        {menuOpen && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: TOK.bg, zIndex: 15, padding: "80px 28px 40px",
            display: "flex", flexDirection: "column", gap: 24,
          }}>
            {PAGES.map(p => (
              <div key={p.hash} onClick={() => onNav(p.hash)} style={{
                fontFamily: TOK.serif, fontSize: 28, fontWeight: 400,
                color: p.hash === active ? TOK.accent : TOK.ink, cursor: "pointer",
              }}>{p.label}</div>
            ))}
          </div>
        )}
      </>
    );
  }
  return (
    <header style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "32px 56px 24px", borderBottom: `1px solid ${TOK.rule}`,
      background: TOK.bg, position: "sticky", top: 0, zIndex: 10,
    }}>
      <div onClick={() => onNav("home")}
        style={{ fontFamily: TOK.serif, fontSize: 26, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.005em", cursor: "pointer" }}>
        Clara Siagian
      </div>
      <nav style={{ display: "flex", gap: 26, fontSize: 13, letterSpacing: "0.02em" }}>
        {PAGES.map(p => (
          <span key={p.hash} onClick={() => onNav(p.hash)} style={{
            color: p.hash === active ? TOK.accent : TOK.ink,
            borderBottom: p.hash === active ? `1px solid ${TOK.accent}` : "1px solid transparent",
            paddingBottom: 2, cursor: "pointer",
          }}>{p.label}</span>
        ))}
      </nav>
    </header>
  );
}

function Footer({ mobile }) {
  return (
    <footer style={{
      borderTop: `1px solid ${TOK.rule}`,
      padding: mobile ? "32px 20px" : "40px 56px",
      marginTop: 80,
      display: "flex", flexDirection: mobile ? "column" : "row",
      justifyContent: "space-between", gap: 16,
      fontSize: 12, color: TOK.inkSoft, letterSpacing: "0.04em",
    }}>
      <span style={{ fontFamily: TOK.mono }}>© CLARA SIAGIAN — {new Date().getFullYear()}</span>
    </footer>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <div style={{
      fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.18em",
      color: light ? "#c3d6d2" : TOK.accent, textTransform: "uppercase", marginBottom: 16,
    }}>{children}</div>
  );
}

function PageHeader({ eyebrow, title, em, lead, mobile }) {
  return (
    <>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {(title || em) && (
        <h1 style={{
          fontFamily: TOK.serif, fontSize: mobile ? 44 : 76, fontWeight: 300,
          letterSpacing: "-0.025em", margin: "0 0 24px", lineHeight: 0.98,
          color: TOK.accent,
        }}>
          {title}{title && em ? " " : ""}{em}
        </h1>
      )}
      {lead && (
        <p style={{
          fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, fontWeight: 400,
          color: TOK.inkSoft, maxWidth: 640, lineHeight: 1.45, margin: "0 0 56px",
        }}>{lead}</p>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────
function Home({ data, mobile, onNav, menuOpen, onToggleMenu }) {
  const { site } = data;
  const bioParagraphs = (site.bio || "").split(/\n\n+/).filter(Boolean);
  const { links = {} } = site;
  const portraitLinks = [
    { key: "orcid",    label: "ORCID" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "yupcities", label: "YUP Project" },
    { key: "puskapa", label: "Puskapa Universitas Indonesia" },
  ].filter(l => links[l.key]);

  return (
    <div style={shell}>
      <Nav active="home" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "32px 20px 0" : "72px 56px 0" }}>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr 1fr", gap: mobile ? 32 : 64, alignItems: "start" }}>
          <div>
            <p style={{
              fontFamily: TOK.serif, fontSize: mobile ? 19 : 24, lineHeight: 1.4,
              fontWeight: 400, color: TOK.inkSoft, maxWidth: 520, margin: "0 0 36px",
            }}>
              {linkify(site.tagline)}
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
              <span onClick={() => onNav("research")} style={{
                background: TOK.accent, color: TOK.bg, padding: "12px 22px",
                fontSize: 13, letterSpacing: "0.04em", fontWeight: 500, cursor: "pointer",
              }}>
                Read my research →
              </span>
              <span onClick={() => onNav("contact")} style={{
                color: TOK.ink, fontSize: 13, borderBottom: `1px solid ${TOK.ink}`,
                paddingBottom: 2, cursor: "pointer",
              }}>
                Get in touch
              </span>
            </div>
            {bioParagraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: TOK.serif, fontSize: mobile ? 17 : 19, lineHeight: 1.55,
                fontWeight: 400, margin: "0 0 18px", color: TOK.ink,
              }}>{linkify(p)}</p>
            ))}
          </div>
          <div>
            <Portrait src={site.photo} tone="teal" aspect="4 / 5" />
            {portraitLinks.length > 0 && (
              <div style={{ marginTop: 20, borderTop: `1px solid ${TOK.rule}`, paddingTop: 16, fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.06em", lineHeight: 2 }}>
                {portraitLinks.map(l => (
                  <a key={l.key} href={links[l.key]} target="_blank" rel="noopener"
                    style={{ display: "block", color: TOK.accent, textDecoration: "none" }}>
                    {l.label} →
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESEARCH
// ─────────────────────────────────────────────────────────────────────────────
const THEME_TONES = ["teal", "sand", "teal", "sand"];

function ThemePhoto({ theme, tone, mobile }) {
  const [failed, setFailed] = React.useState(false);
  const aspect = mobile ? "5 / 4" : "4 / 5";
  if (!theme.image || failed) {
    return <FieldPlaceholder label={theme.title} tone={tone} aspect={aspect} />;
  }
  return (
    <img src={"assets/themes/" + theme.image} alt={theme.title}
      onError={() => setFailed(true)}
      style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }} />
  );
}

function Research({ data, mobile, onNav, menuOpen, onToggleMenu }) {
  const { themeList } = data;
  return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0" }}>
        <PageHeader
          title="Research"
          em="projects"
          lead="My research moves across several themes. Each gathers a long arc of fieldwork, collaborations, and writing — built up over years rather than projects. Click any project to read more."
          mobile={mobile}
        />

        {themeList.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Research themes coming soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 56 : 96 }}>
            {themeList.map((t, i) => (
              <article key={t.id} style={{
                display: "grid",
                gridTemplateColumns: mobile ? "1fr" : i % 2 === 0 ? "5fr 7fr" : "7fr 5fr",
                gap: mobile ? 24 : 56, alignItems: "start",
              }}>
                <div style={{ order: mobile ? 0 : i % 2 === 0 ? 0 : 1 }}>
                  <ThemePhoto theme={t} tone={THEME_TONES[i % 4]} mobile={mobile} />
                </div>
                <div style={{ order: mobile ? 1 : i % 2 === 0 ? 1 : 0 }}>
                  <h2 style={{
                    fontFamily: TOK.serif, fontSize: mobile ? 32 : 48, fontWeight: 400,
                    letterSpacing: "-0.02em", margin: "0 0 20px", lineHeight: 1.05,
                  }}>{t.title}</h2>
                  {t.blurb && (
                    <p style={{
                      fontFamily: TOK.serif, fontSize: mobile ? 17 : 19, fontWeight: 400,
                      color: TOK.inkSoft, lineHeight: 1.55, margin: "0 0 24px",
                    }}>{t.blurb}</p>
                  )}
                  {t.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                      {t.tags.map(tag => (
                        <span key={tag} style={{
                          fontFamily: TOK.sans, fontSize: 11, letterSpacing: "0.04em",
                          color: TOK.accent, padding: "5px 12px", borderRadius: 999,
                          border: `1px solid ${TOK.accentSoft}`, background: "rgba(63,103,100,0.04)",
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {t.projects.length > 0 && (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: `1px solid ${TOK.rule}` }}>
                      {t.projects.map(p => (
                        <li key={p.slug}
                          onClick={() => onNav("project/" + p.slug)}
                          style={{
                            borderBottom: `1px solid ${TOK.rule}`, padding: "16px 0",
                            display: "grid", gridTemplateColumns: "1fr auto",
                            alignItems: "baseline", gap: 16, cursor: "pointer",
                          }}>
                          <div>
                            <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 17 : 19, fontWeight: 500, lineHeight: 1.25, color: TOK.ink }}>{p.title}</div>
                            <div style={{ fontFamily: TOK.mono, fontSize: 11, color: TOK.inkSoft, marginTop: 4, letterSpacing: "0.05em" }}>
                              {linkify([p.period, p.sites.join(", "), p.role].filter(Boolean).join(" · "))}
                            </div>
                          </div>
                          <span style={{ fontFamily: TOK.mono, fontSize: 13, color: TOK.accent, letterSpacing: "0.08em" }}>READ →</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT DETAIL
// ─────────────────────────────────────────────────────────────────────────────
function ProjectBanner({ project, mobile }) {
  const [failed, setFailed] = React.useState(false);
  const aspect = mobile ? "5 / 3" : "16 / 7";
  if (!project.image || failed) {
    return <FieldPlaceholder label={project.title} tone="teal" aspect={aspect} />;
  }
  return (
    <img src={"assets/projects/" + project.image} alt={project.title}
      onError={() => setFailed(true)}
      style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }} />
  );
}

function ProjectDetail({ data, mobile, onNav, slug, menuOpen, onToggleMenu }) {
  const entry = data.projectBySlug[slug];
  if (!entry) return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "40px 20px" : "80px 56px" }}>
        <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Project not found.</p>
      </main>
    </div>
  );

  const { theme, project } = entry;
  const metaFields = [
    { label: "Period",    value: project.period },
    { label: "Sites",     value: project.sites.join(" · ") },
    { label: "Role",      value: project.role },
    { label: "Funding",        value: project.funders.join(" · ") },
    { label: "Collaborators",  value: project.partners.join(" · ") },
  ].filter(f => f.value);

  return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "32px 20px 0" : "56px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <span onClick={() => onNav("research")}
          style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.14em", color: TOK.accent, textTransform: "uppercase", cursor: "pointer", display: "inline-block", marginBottom: 24 }}>
          ← Back to Research
        </span>

        <Eyebrow>{theme.title}</Eyebrow>
        <h1 style={{
          fontFamily: TOK.serif, fontSize: mobile ? 36 : 60, fontWeight: 400,
          letterSpacing: "-0.02em", margin: "0 0 32px", lineHeight: 1.02,
        }}>{project.title}</h1>

        <ProjectBanner project={project} mobile={mobile} />

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 2fr", gap: mobile ? 32 : 56, marginTop: 48 }}>
          <aside style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.06em", lineHeight: 1.9, color: TOK.inkSoft }}>
            {metaFields.map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <div style={{ color: TOK.accent, marginBottom: 4, textTransform: "uppercase" }}>{f.label}</div>
                <div style={{ fontFamily: TOK.sans, fontSize: 14, color: TOK.ink, letterSpacing: 0, lineHeight: 1.4 }}>{linkify(f.value)}</div>
              </div>
            ))}
          </aside>
          <div>
            {project.summary && (
              <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, lineHeight: 1.45, color: TOK.ink, margin: "0 0 24px", fontWeight: 400 }}>
                {linkify(project.summary)}
              </p>
            )}
            {project.long && (
              <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 17 : 18, lineHeight: 1.6, color: TOK.inkSoft, margin: "0 0 36px" }}>
                {linkify(project.long)}
              </p>
            )}
            {project.outputs.length > 0 && (
              <>
                <h3 style={{ fontFamily: TOK.serif, fontSize: 24, fontWeight: 500, margin: "0 0 16px", letterSpacing: "-0.01em" }}>Outputs</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {project.outputs.map((o, i) => (
                    <li key={i} style={{
                      padding: "12px 0", borderTop: `1px solid ${TOK.rule}`,
                      fontFamily: TOK.serif, fontSize: 17, fontStyle: "italic", color: TOK.ink,
                    }}>— {linkify(o)}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function Publications({ data, mobile, onNav, menuOpen, onToggleMenu }) {
  const { pubThemes } = data;
  return (
    <div style={shell}>
      <Nav active="publications" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader title="Publications, by" em="theme" mobile={mobile} />
        {pubThemes.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Publications coming soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 48 : 72 }}>
            {pubThemes.map((g) => (
              <section key={g.theme}>
                <div style={{
                  display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
                  gap: mobile ? 16 : 56, paddingBottom: 24,
                  borderBottom: `1px solid ${TOK.rule}`, marginBottom: 8,
                }}>
                  <div>
                    <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.1 }}>{g.theme}</h2>
                  </div>
                  <div style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.08em", color: TOK.inkSoft, alignSelf: "end", textTransform: "uppercase" }}>
                    {g.items.length} {g.items.length === 1 ? "entry" : "entries"}
                  </div>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {g.items.map((it, j) => (
                    <li key={j} style={{
                      display: "grid",
                      gridTemplateColumns: mobile ? "auto 1fr" : "120px 1fr 60px",
                      gap: mobile ? 12 : 24, padding: "20px 0",
                      borderBottom: `1px solid ${TOK.rule}`, alignItems: "baseline",
                    }}>
                      <span style={{ fontFamily: TOK.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: TOK.accent, whiteSpace: "nowrap" }}>{it.kind}</span>
                      <div style={{ gridColumn: mobile ? "1 / -1" : "auto" }}>
                        <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 18 : 21, fontWeight: 500, lineHeight: 1.25, color: TOK.ink, marginBottom: 4, letterSpacing: "-0.005em" }}>
                          {it.url ? (
                            <a href={it.url} target="_blank" rel="noopener"
                              style={{ color: "inherit", textDecoration: "none", borderBottom: `1px solid ${TOK.rule}` }}>
                              {it.title}
                            </a>
                          ) : it.title}
                        </div>
                        <div style={{ fontFamily: TOK.serif, fontSize: 14, color: TOK.inkSoft, fontStyle: "italic" }}>
                          {it.authors && <span style={{ fontStyle: "normal", marginRight: 8 }}>{linkify(it.authors)} ·</span>}
                          {linkify(it.venue)}
                          {mobile && <span style={{ fontFamily: TOK.mono, fontStyle: "normal", marginLeft: 12, color: TOK.accent }}>{it.year}</span>}
                        </div>
                      </div>
                      {!mobile && <span style={{ fontFamily: TOK.mono, fontSize: 13, color: TOK.accent, textAlign: "right" }}>{it.year}</span>}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENGAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function Engagement({ data, mobile, onNav, menuOpen, onToggleMenu }) {
  const { engagement } = data;
  const sections = engagement.filter(g => g.items.length > 0);

  return (
    <div style={shell}>
      <Nav active="engagement" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader title="Public" em="engagement"
          lead="A selection of podcasts, public writing, and invited talks." mobile={mobile} />

        {sections.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Engagement entries coming soon.</p>
        ) : sections.map(sec => (
          <section key={sec.type} style={{ marginBottom: 64 }}>
            <div style={{
              display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
              gap: mobile ? 8 : 56, paddingBottom: 20, borderBottom: `1px solid ${TOK.rule}`, marginBottom: 8,
            }}>
              <div>
                <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>{sec.type}</h2>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {sec.items.map((it, i) => (
                <li key={i} style={{
                  display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 60px",
                  gap: mobile ? 12 : 24, padding: "18px 0",
                  borderBottom: `1px solid ${TOK.rule}`, alignItems: "baseline",
                }}>
                  <div>
                    <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 18 : 20, lineHeight: 1.3, marginBottom: 2, fontWeight: 500 }}>{linkify(it.title)}</div>
                    <div style={{ fontFamily: TOK.serif, fontSize: 14, color: TOK.inkSoft, fontStyle: "italic" }}>
                      {linkify(it.venue)}{it.location ? " · " : ""}{linkify(it.location)}
                      {mobile && <span style={{ fontFamily: TOK.mono, fontStyle: "normal", marginLeft: 12, color: TOK.accent }}>{it.year}</span>}
                    </div>
                  </div>
                  {!mobile && <span style={{ fontFamily: TOK.mono, fontSize: 13, color: TOK.accent, textAlign: "right" }}>{it.year}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────
function Contact({ data, mobile, onNav, menuOpen, onToggleMenu }) {
  const { site } = data;
  const { links = {} } = site;
  const email = site.email || links.email;

  const elsewhere = [
    { label: "Google Scholar", url: links.scholar },
    { label: "ORCID",          url: links.orcid },
    { label: "LinkedIn",       url: links.linkedin },
    { label: "Bluesky",        url: links.bluesky },
    { label: "ResearchGate",   url: links.researchgate },
    { label: "YUP Cities",     url: links.yupcities },
    { label: "Puskapa",        url: links.puskapa },
  ].filter(l => l.url);

  return (
    <div style={shell}>
      <Nav active="contact" mobile={mobile} onNav={onNav} menuOpen={menuOpen} onToggleMenu={onToggleMenu} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <h1 style={{ fontFamily: TOK.serif, fontSize: mobile ? 56 : 96, fontWeight: 300, letterSpacing: "-0.025em", margin: "0 0 24px", lineHeight: 0.95, color: TOK.accent }}>
          Let's talk.
        </h1>
        <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 24, fontWeight: 400, color: TOK.inkSoft, maxWidth: 640, lineHeight: 1.45, margin: "0 0 64px" }}>
          For research collaborations, podcast invitations, lectures, media requests, or to share your own work.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 32 : 56, paddingTop: 32, borderTop: `1px solid ${TOK.rule}` }}>
          <div>
            <Eyebrow>Email</Eyebrow>
            {email ? (
              <a href={"mailto:" + email} style={{
                fontFamily: TOK.serif, fontSize: mobile ? 28 : 40, color: TOK.ink,
                textDecoration: "none", borderBottom: `1px solid ${TOK.accent}`,
                paddingBottom: 4, fontWeight: 400, letterSpacing: "-0.015em",
                display: "inline-block", wordBreak: "break-word",
              }}>{email}</a>
            ) : (
              <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Email coming soon.</p>
            )}
          </div>

          {elsewhere.length > 0 && (
            <div>
              <Eyebrow>Elsewhere</Eyebrow>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {elsewhere.map(l => (
                  <li key={l.label}>
                    <a href={l.url} target="_blank" rel="noopener" style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "16px 0", borderBottom: `1px solid ${TOK.rule}`,
                      fontFamily: TOK.serif, fontSize: 19, fontStyle: "italic",
                      color: "inherit", textDecoration: "none",
                    }}>
                      <span>{l.label}</span>
                      <span style={{ color: TOK.accent, fontFamily: TOK.mono, fontStyle: "normal" }}>→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTER + APP
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_MAP = {
  home:           Home,
  research:       Research,
  publications:   Publications,
  engagement:     Engagement,
  contact:        Contact,
};

function AppShell({ data }) {
  const [hash, setHash]     = React.useState(() => window.location.hash.slice(1) || "home");
  const [isMobile, setMobile] = React.useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onHash   = () => { setHash(window.location.hash.slice(1) || "home"); window.scrollTo(0, 0); setMenuOpen(false); };
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("hashchange", onHash); window.removeEventListener("resize", onResize); };
  }, []);

  const onNav = target => { window.location.hash = "#" + target; };
  const onToggleMenu = () => setMenuOpen(o => !o);
  const props = { data, mobile: isMobile, onNav, menuOpen, onToggleMenu };

  if (hash.startsWith("project/")) {
    return <ProjectDetail {...props} slug={hash.slice(8)} />;
  }

  const Page = PAGE_MAP[hash] || Home;
  return <Page {...props} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUNT
// ─────────────────────────────────────────────────────────────────────────────
loadData()
  .then(data => {
    ReactDOM.createRoot(document.getElementById("root")).render(<AppShell data={data} />);
  })
  .catch(err => {
    console.error("[app]", err);
    const root = document.getElementById("root");
    root.innerHTML = '<div style="padding:40px;font-family:monospace;color:#c00">Error loading site data. Make sure you are serving via a local server (e.g. python3 -m http.server 8080).</div>';
  });

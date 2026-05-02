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
  { label: "About",          hash: "about" },
  { label: "Research",       hash: "research" },
  { label: "Publications",   hash: "publications" },
  { label: "Engagement",     hash: "engagement" },
  { label: "Collaborations", hash: "collaborations" },
  { label: "Fieldwork",      hash: "fieldwork" },
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

// ─────────────────────────────────────────────────────────────────────────────
// DATA LOADER
// ─────────────────────────────────────────────────────────────────────────────
async function loadData() {
  const get  = url => fetch(url).then(r => { if (!r.ok) throw new Error(url); return r; });
  const json = url => get(url).then(r => r.json());
  const csv  = url => get(url).then(r => r.text()).then(parseCSV);

  const [site, themes, projects, publications, currently,
         engagement, collaborations, awards, grants, gallery] = await Promise.all([
    json("data/site.json"),
    csv("data/research_themes.csv"),
    csv("data/projects.csv"),
    csv("data/publications.csv"),
    csv("data/currently.csv"),
    csv("data/engagement.csv"),
    csv("data/collaborations.csv"),
    csv("data/awards.csv"),
    csv("data/grants.csv"),
    csv("data/gallery.csv"),
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
    currently,
    engagement: {
      podcasts: engagement.filter(e => e.type === "Podcast"),
      writing:  engagement.filter(e => e.type === "Writing"),
      talks:    engagement.filter(e => e.type === "Talk"),
    },
    collaborations,
    awards,
    grants,
    gallery,
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
function Nav({ active, mobile, onNav }) {
  if (mobile) {
    return (
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 20px", borderBottom: `1px solid ${TOK.rule}`,
        background: TOK.bg, position: "sticky", top: 0, zIndex: 10,
      }}>
        <div onClick={() => onNav("home")}
          style={{ fontFamily: TOK.serif, fontSize: 22, fontStyle: "italic", fontWeight: 400, cursor: "pointer" }}>
          Clara Siagian
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, cursor: "pointer" }}>
          <span style={{ width: 18, height: 1.5, background: TOK.ink, display: "block" }} />
          <span style={{ width: 18, height: 1.5, background: TOK.ink, display: "block" }} />
          <span style={{ width: 12, height: 1.5, background: TOK.ink, display: "block" }} />
        </div>
      </header>
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
      <span style={{ fontFamily: TOK.serif, fontStyle: "italic", fontSize: 14 }}>— written from London —</span>
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
      <Eyebrow>{eyebrow}</Eyebrow>
      {(title || em) && (
        <h1 style={{
          fontFamily: TOK.serif, fontSize: mobile ? 44 : 76, fontWeight: 300,
          letterSpacing: "-0.025em", margin: "0 0 24px", lineHeight: 0.98,
        }}>
          {title}{title && em ? " " : ""}{em && <em style={{ fontStyle: "italic", color: TOK.accent, fontWeight: 300 }}>{em}</em>}
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
function Home({ data, mobile, onNav }) {
  const { site, currently } = data;
  return (
    <div style={shell}>
      <Nav active="home" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "32px 20px 0" : "72px 56px 0" }}>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.1fr 1fr", gap: mobile ? 32 : 64, alignItems: "start" }}>
          <div>
            <Eyebrow>{site.role} · {site.affiliation}</Eyebrow>
            <h1 style={{
              fontFamily: TOK.serif, fontSize: mobile ? 56 : 92,
              lineHeight: 0.95, letterSpacing: "-0.025em", fontWeight: 300, margin: "0 0 28px",
            }}>
              <em style={{ fontStyle: "italic", color: TOK.accent }}>{site.name}</em>
            </h1>
            <p style={{
              fontFamily: TOK.serif, fontSize: mobile ? 19 : 24, lineHeight: 1.4,
              fontWeight: 400, color: TOK.inkSoft, maxWidth: 520, margin: "0 0 36px",
            }}>
              {site.tagline}
            </p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
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
          </div>
          <Portrait src={site.photo} tone="teal" aspect="4 / 5" />
        </div>

        {currently.length > 0 && (
          <section style={{ marginTop: mobile ? 64 : 120, paddingTop: 40, borderTop: `1px solid ${TOK.rule}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
              <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 30 : 40, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>Currently</h2>
              <span style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.16em", color: TOK.inkSoft, textTransform: "uppercase" }}>
                {new Date().toLocaleString("en-GB", { month: "long", year: "numeric" })}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(3, 1fr)", gap: mobile ? 24 : 40 }}>
              {currently.map((c, i) => (
                <div key={i}>
                  <div style={{ fontFamily: TOK.mono, fontSize: 10, letterSpacing: "0.18em", color: TOK.accent, textTransform: "uppercase", marginBottom: 12 }}>◦ {c.tag}</div>
                  <h3 style={{ fontFamily: TOK.serif, fontSize: 24, margin: "0 0 8px", fontWeight: 500, letterSpacing: "-0.01em" }}>{c.title}</h3>
                  <p style={{ margin: 0, color: TOK.inkSoft, fontSize: 14, lineHeight: 1.55 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────────────────────
function About({ data, mobile, onNav }) {
  const { site } = data;
  const bioParagraphs = (site.bio || "").split(/\n\n+/).filter(Boolean);
  const { links = {}, education = [], methods } = site;

  const socialLinks = [
    { key: "orcid",     label: "ORCID" },
    { key: "linkedin",  label: "LinkedIn" },
    { key: "scholar",   label: "Google Scholar" },
    { key: "bluesky",   label: "Bluesky" },
  ].filter(l => links[l.key]);

  return (
    <div style={shell}>
      <Nav active="about" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader eyebrow="About" title="A social scientist" em="writing from Jakarta." mobile={mobile} />

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1.4fr", gap: mobile ? 32 : 72 }}>
          <div>
            <Portrait src={site.photo} tone="teal" aspect="4 / 5" />
            {socialLinks.length > 0 && (
              <div style={{ marginTop: 24, borderTop: `1px solid ${TOK.rule}`, paddingTop: 20, fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.06em", color: TOK.inkSoft, lineHeight: 2 }}>
                {socialLinks.map(l => (
                  <a key={l.key} href={links[l.key]} target="_blank" rel="noopener"
                    style={{ display: "block", color: TOK.accent, textDecoration: "none" }}>
                    {l.label} →
                  </a>
                ))}
              </div>
            )}
          </div>
          <div>
            {bioParagraphs.map((p, i) => (
              <p key={i} style={{
                fontFamily: TOK.serif, fontSize: mobile ? 18 : 21, lineHeight: 1.55,
                fontWeight: 400, margin: "0 0 22px", color: TOK.ink,
              }}>{p}</p>
            ))}

            {education.length > 0 && (
              <>
                <h3 style={{ fontFamily: TOK.serif, fontSize: 26, fontWeight: 500, margin: "48px 0 18px", letterSpacing: "-0.01em" }}>Education</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 14, color: TOK.inkSoft }}>
                  {education.map((e, i) => (
                    <li key={i} style={{
                      display: "grid",
                      gridTemplateColumns: mobile ? "1fr auto" : "1fr 1fr auto",
                      padding: "14px 0", borderTop: `1px solid ${TOK.rule}`, gap: 8, alignItems: "baseline",
                    }}>
                      <span style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.ink, gridColumn: mobile ? "1 / -1" : "auto" }}>{e.degree}</span>
                      {!mobile && <span style={{ fontStyle: "italic", fontFamily: TOK.serif, fontSize: 15 }}>{e.institution}</span>}
                      <span style={{ fontFamily: TOK.mono, fontSize: 12, color: TOK.accent }}>{e.year}</span>
                      {mobile && <span style={{ gridColumn: "1 / -1", fontSize: 13, color: TOK.inkSoft, fontStyle: "italic", fontFamily: TOK.serif }}>{e.institution}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {methods && (
              <>
                <h3 style={{ fontFamily: TOK.serif, fontSize: 26, fontWeight: 500, margin: "48px 0 18px", letterSpacing: "-0.01em" }}>Methods I work with</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, color: TOK.ink }}>{methods}</p>
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
// RESEARCH
// ─────────────────────────────────────────────────────────────────────────────
const THEME_TONES = ["teal", "sand", "teal", "sand"];

function Research({ data, mobile, onNav }) {
  const { themeList } = data;
  return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0" }}>
        <PageHeader
          eyebrow={`Research · ${themeList.length} Theme${themeList.length !== 1 ? "s" : ""}`}
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
                  <FieldPlaceholder label={t.title} tone={THEME_TONES[i % 4]} aspect={mobile ? "5 / 4" : "4 / 5"} />
                </div>
                <div style={{ order: mobile ? 1 : i % 2 === 0 ? 1 : 0 }}>
                  <Eyebrow>Theme 0{i + 1}</Eyebrow>
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
                              {[p.period, p.sites.join(", "), p.role].filter(Boolean).join(" · ")}
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
function ProjectDetail({ data, mobile, onNav, slug }) {
  const entry = data.projectBySlug[slug];
  if (!entry) return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} />
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
    { label: "Funders",   value: project.funders.join(" · ") },
    { label: "Partners",  value: project.partners.join(" · ") },
  ].filter(f => f.value);

  return (
    <div style={shell}>
      <Nav active="research" mobile={mobile} onNav={onNav} />
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

        <FieldPlaceholder label={project.title} tone="teal" aspect={mobile ? "5 / 3" : "16 / 7"} />

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 2fr", gap: mobile ? 32 : 56, marginTop: 48 }}>
          <aside style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.06em", lineHeight: 1.9, color: TOK.inkSoft }}>
            {metaFields.map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <div style={{ color: TOK.accent, marginBottom: 4, textTransform: "uppercase" }}>{f.label}</div>
                <div style={{ fontFamily: TOK.sans, fontSize: 14, color: TOK.ink, letterSpacing: 0, lineHeight: 1.4 }}>{f.value}</div>
              </div>
            ))}
          </aside>
          <div>
            {project.summary && (
              <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, lineHeight: 1.45, color: TOK.ink, margin: "0 0 24px", fontWeight: 400 }}>
                {project.summary}
              </p>
            )}
            {project.long && (
              <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 17 : 18, lineHeight: 1.6, color: TOK.inkSoft, margin: "0 0 36px" }}>
                {project.long}
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
                    }}>— {o}</li>
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
function Publications({ data, mobile, onNav }) {
  const { pubThemes } = data;
  return (
    <div style={shell}>
      <Nav active="publications" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader eyebrow="Publications" title="Publications, by" em="theme" mobile={mobile} />
        {pubThemes.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Publications coming soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 48 : 72 }}>
            {pubThemes.map((g, i) => (
              <section key={g.theme}>
                <div style={{
                  display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
                  gap: mobile ? 16 : 56, paddingBottom: 24,
                  borderBottom: `1px solid ${TOK.rule}`, marginBottom: 8,
                }}>
                  <div>
                    <Eyebrow>Theme 0{i + 1}</Eyebrow>
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
                          {it.authors && <span style={{ fontStyle: "normal", marginRight: 8 }}>{it.authors} ·</span>}
                          {it.venue}
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
function Engagement({ data, mobile, onNav }) {
  const { engagement } = data;
  const sections = [
    { name: "Podcasts",      subtitle: "Conversations",        items: engagement.podcasts, kind: "Audio" },
    { name: "Public Writing", subtitle: "Op-eds & Essays",     items: engagement.writing,  kind: "Essay" },
    { name: "Invited Talks",  subtitle: "Lectures & Workshops", items: engagement.talks,   kind: "Talk"  },
  ].filter(s => s.items.length > 0);

  return (
    <div style={shell}>
      <Nav active="engagement" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader eyebrow="Public Engagement" title="Public" em="engagement"
          lead="A selection of podcasts, public writing, and invited talks." mobile={mobile} />

        {sections.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Engagement entries coming soon.</p>
        ) : sections.map(sec => (
          <section key={sec.name} style={{ marginBottom: 64 }}>
            <div style={{
              display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
              gap: mobile ? 8 : 56, paddingBottom: 20, borderBottom: `1px solid ${TOK.rule}`, marginBottom: 8,
            }}>
              <div>
                <Eyebrow>{sec.subtitle}</Eyebrow>
                <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>{sec.name}</h2>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {sec.items.map((it, i) => (
                <li key={i} style={{
                  display: "grid", gridTemplateColumns: mobile ? "auto 1fr" : "100px 1fr 60px",
                  gap: mobile ? 12 : 24, padding: "18px 0",
                  borderBottom: `1px solid ${TOK.rule}`, alignItems: "baseline",
                }}>
                  <span style={{ fontFamily: TOK.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: TOK.accent }}>◦ {sec.kind}</span>
                  <div style={{ gridColumn: mobile ? "1 / -1" : "auto" }}>
                    <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 18 : 20, lineHeight: 1.3, marginBottom: 2, fontWeight: 500 }}>{it.title}</div>
                    <div style={{ fontFamily: TOK.serif, fontSize: 14, color: TOK.inkSoft, fontStyle: "italic" }}>
                      {it.venue}{it.location ? ` · ${it.location}` : ""}
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
// COLLABORATIONS / AWARDS / GRANTS
// ─────────────────────────────────────────────────────────────────────────────
function Collaborations({ data, mobile, onNav }) {
  const { collaborations, awards, grants } = data;
  const hasAny = collaborations.length > 0 || awards.length > 0 || grants.length > 0;

  return (
    <div style={shell}>
      <Nav active="collaborations" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <PageHeader
          eyebrow="Collaborations · Awards · Grants"
          title="Collaborations, grants,"
          em="and awards"
          lead="Research is collective. These are the partners, funders, and recognitions that have made the work possible."
          mobile={mobile}
        />

        {!hasAny && (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>Entries coming soon.</p>
        )}

        {collaborations.length > 0 && (
          <section style={{ marginBottom: mobile ? 56 : 80 }}>
            <div style={{
              display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
              gap: mobile ? 12 : 56, paddingBottom: 20, borderBottom: `1px solid ${TOK.rule}`,
            }}>
              <div>
                <Eyebrow>§ 01 Partners</Eyebrow>
                <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>Collaborations</h2>
              </div>
              <div style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.08em", color: TOK.inkSoft, alignSelf: "end", textTransform: "uppercase" }}>{collaborations.length} organisations</div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {collaborations.map((c, i) => (
                <li key={i} style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr 2fr 80px",
                  gap: mobile ? 8 : 24, padding: "20px 0", borderBottom: `1px solid ${TOK.rule}`, alignItems: "baseline",
                }}>
                  <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, fontWeight: 500, letterSpacing: "-0.005em" }}>{c.name}</div>
                  <div style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: TOK.accent }}>{c.role}</div>
                  <div style={{ fontFamily: TOK.serif, fontSize: 15, color: TOK.inkSoft, fontStyle: "italic" }}>{c.note}</div>
                  {!mobile && <span style={{ fontFamily: TOK.mono, fontSize: 12, color: TOK.accent, textAlign: "right" }}>since {c.since}</span>}
                  {mobile && <div style={{ fontFamily: TOK.mono, fontSize: 11, color: TOK.inkSoft }}>{c.place} · since {c.since}</div>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {grants.length > 0 && (
          <section style={{
            background: TOK.bgDeep, color: "#e8ddc8",
            margin: mobile ? "0 -20px" : "0 -56px",
            padding: mobile ? "48px 20px" : "80px 56px",
            marginBottom: mobile ? 56 : 80,
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
              gap: mobile ? 12 : 56, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.15)",
              maxWidth: 1100, margin: "0 auto 20px",
            }}>
              <div>
                <Eyebrow light>§ 02 Funded Projects</Eyebrow>
                <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0, color: "#f1ece2" }}>Grants</h2>
              </div>
              <div style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.08em", color: "#c3d6d2", alignSelf: "end", textTransform: "uppercase" }}>{grants.length} active & recent</div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 auto", maxWidth: 1100 }}>
              {grants.map((g, i) => (
                <li key={i} style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "1fr" : "100px 1fr 1fr 140px",
                  gap: mobile ? 6 : 24, padding: "22px 0", borderBottom: "1px solid rgba(255,255,255,0.12)", alignItems: "baseline",
                }}>
                  <span style={{ fontFamily: TOK.mono, fontSize: 12, color: "#c3d6d2" }}>{g.period}</span>
                  <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, color: "#f1ece2", fontWeight: 500, letterSpacing: "-0.005em" }}>{g.title}</div>
                  <div style={{ fontFamily: TOK.serif, fontSize: 15, fontStyle: "italic", color: "#c3d6d2" }}>{g.funder} · {g.role}</div>
                  <span style={{ fontFamily: TOK.mono, fontSize: 12, color: "#f1ece2", textAlign: mobile ? "left" : "right" }}>{g.amount}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {awards.length > 0 && (
          <section style={{ marginBottom: mobile ? 24 : 40 }}>
            <div style={{
              display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 3fr",
              gap: mobile ? 12 : 56, paddingBottom: 20, borderBottom: `1px solid ${TOK.rule}`,
            }}>
              <div>
                <Eyebrow>§ 03 Recognition</Eyebrow>
                <h2 style={{ fontFamily: TOK.serif, fontSize: mobile ? 26 : 32, fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>Awards & Honours</h2>
              </div>
              <div style={{ fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.08em", color: TOK.inkSoft, alignSelf: "end", textTransform: "uppercase" }}>{awards.length} entries</div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {awards.map((a, i) => (
                <li key={i} style={{
                  display: "grid",
                  gridTemplateColumns: mobile ? "auto 1fr" : "80px 1fr 2fr",
                  gap: mobile ? 12 : 24, padding: "20px 0", borderBottom: `1px solid ${TOK.rule}`, alignItems: "baseline",
                }}>
                  <span style={{ fontFamily: TOK.mono, fontSize: 12, color: TOK.accent }}>{a.year}</span>
                  <div style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 22, fontWeight: 500, letterSpacing: "-0.005em", gridColumn: mobile ? "1 / -1" : "auto" }}>{a.title}</div>
                  <div style={{ fontFamily: TOK.serif, fontSize: 15, color: TOK.inkSoft, fontStyle: "italic", gridColumn: mobile ? "1 / -1" : "auto" }}>
                    {a.body}{a.note ? ` — ${a.note}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIELDWORK
// ─────────────────────────────────────────────────────────────────────────────
const GALLERY_TONES = { urban: "sand", coastal: "teal", rural: "sand" };

function Fieldwork({ data, mobile, onNav }) {
  const { gallery } = data;
  const [filter, setFilter] = React.useState("all");
  const filtered = filter === "all" ? gallery : gallery.filter(g => g.tag === filter);

  return (
    <div style={shell}>
      <Nav active="fieldwork" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0" }}>
        <PageHeader
          eyebrow="From the field"
          title="Notes from"
          em="fieldwork."
          lead="Photographs from fieldwork across Indonesia — cities, coasts, and rural districts."
          mobile={mobile}
        />

        {gallery.length === 0 ? (
          <p style={{ fontFamily: TOK.serif, fontSize: 18, color: TOK.inkSoft }}>
            Fieldwork photos coming soon.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
              {["all", "urban", "coastal", "rural"].map(f => (
                <span key={f} onClick={() => setFilter(f)} style={{
                  fontFamily: TOK.mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "8px 14px", borderRadius: 999,
                  border: `1px solid ${f === filter ? TOK.accent : TOK.rule}`,
                  color: f === filter ? TOK.bg : TOK.ink,
                  background: f === filter ? TOK.accent : "transparent",
                  cursor: "pointer",
                }}>{f}</span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: mobile ? 14 : 28 }}>
              {filtered.map((g, i) => {
                const span = !mobile && (i === 0 || i === 4) ? 2 : 1;
                const tone = GALLERY_TONES[g.tag] || "sand";
                const aspect = span === 2 ? "16 / 10" : "4 / 5";
                return (
                  <figure key={g.caption + i} style={{ margin: 0, gridColumn: `span ${span}` }}>
                    {g.filename ? (
                      <img src={"assets/fieldwork/" + g.filename} alt={g.caption}
                        style={{ width: "100%", aspectRatio: aspect, objectFit: "cover", display: "block" }} />
                    ) : (
                      <FieldPlaceholder label={g.caption} tone={tone} aspect={aspect} />
                    )}
                    <figcaption style={{ paddingTop: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", fontSize: 13 }}>
                      <span style={{ fontFamily: TOK.serif, fontSize: 15, fontStyle: "italic", color: TOK.ink }}>{g.caption}</span>
                      <span style={{ fontFamily: TOK.mono, fontSize: 10, letterSpacing: "0.12em", color: TOK.accent, textTransform: "uppercase", whiteSpace: "nowrap" }}>{g.location} · {g.year}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer mobile={mobile} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────
function Contact({ data, mobile, onNav }) {
  const { site } = data;
  const { links = {} } = site;
  const email = site.email || links.email;

  const elsewhere = [
    { label: "Google Scholar", url: links.scholar },
    { label: "ORCID",          url: links.orcid },
    { label: "LinkedIn",       url: links.linkedin },
    { label: "Bluesky",        url: links.bluesky },
    { label: "ResearchGate",   url: links.researchgate },
  ].filter(l => l.url);

  return (
    <div style={shell}>
      <Nav active="contact" mobile={mobile} onNav={onNav} />
      <main style={{ padding: mobile ? "40px 20px 0" : "80px 56px 0", maxWidth: mobile ? "none" : 1100, margin: "0 auto" }}>
        <Eyebrow>Contact</Eyebrow>
        <h1 style={{ fontFamily: TOK.serif, fontSize: mobile ? 56 : 96, fontWeight: 300, letterSpacing: "-0.025em", margin: "0 0 24px", lineHeight: 0.95 }}>
          Let's <em style={{ fontStyle: "italic", color: TOK.accent }}>talk</em>.
        </h1>
        <p style={{ fontFamily: TOK.serif, fontSize: mobile ? 19 : 24, fontWeight: 400, color: TOK.inkSoft, maxWidth: 640, lineHeight: 1.45, margin: "0 0 64px" }}>
          For research collaborations, podcast invitations, lectures, media requests, or to share your own work — I read everything.
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
            <p style={{ marginTop: 24, color: TOK.inkSoft, fontSize: 14, lineHeight: 1.6, maxWidth: 380 }}>
              I aim to reply within a week. For students writing about coursework, please include your supervisor's name.
            </p>
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
  about:          About,
  research:       Research,
  publications:   Publications,
  engagement:     Engagement,
  collaborations: Collaborations,
  fieldwork:      Fieldwork,
  contact:        Contact,
};

function AppShell({ data }) {
  const [hash, setHash]     = React.useState(() => window.location.hash.slice(1) || "home");
  const [isMobile, setMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const onHash   = () => { setHash(window.location.hash.slice(1) || "home"); window.scrollTo(0, 0); };
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener("hashchange", onHash);
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("hashchange", onHash); window.removeEventListener("resize", onResize); };
  }, []);

  const onNav = target => { window.location.hash = "#" + target; };
  const props = { data, mobile: isMobile, onNav };

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

# How to Edit Your Website

This guide covers everything you need to update your website content — no coding required. All edits are done directly on GitHub in your browser.

---

## Quick overview

Your website content lives in the **`data/`** folder. Each file controls a different part of the site:

| File | Controls |
|---|---|
| `data/site.json` | Name, bio, photo, links, education, methods |
| `data/currently.csv` | The 3 "Currently" spotlight items on the Home page |
| `data/research_themes.csv` | Research theme names and descriptions |
| `data/projects.csv` | Individual research projects (linked to themes) |
| `data/publications.csv` | Publications list, grouped by theme |
| `data/engagement.csv` | Podcasts, public writing, invited talks |
| `data/collaborations.csv` | Institutional collaborations |
| `data/awards.csv` | Awards and honours |
| `data/grants.csv` | Research grants and funding |
| `data/gallery.csv` | Fieldwork photo gallery |

---

## How to edit a file on GitHub

1. Go to your repository on GitHub
2. Click on the `data` folder
3. Click the file you want to edit
4. Click the **pencil icon** (✏️) — "Edit this file"
5. Make your changes
6. Click the green **"Commit changes"** button
7. A small window appears — you can leave a note or just click **"Commit changes"** again
8. Wait about 30 seconds, then refresh your website

> **Tip:** For CSV files, click the **Preview** tab in the GitHub editor to see your data as a table before and after editing.

---

## Updating your profile (`data/site.json`)

This controls the **Home** and **About** pages.

### Fields explained

```
"name"        → Your name as it appears everywhere on the site
"role"        → Your job title or role
"affiliation" → Your institution and department
"tagline"     → A one-line description shown on the Home page (under your name)
"bio"         → Your bio text, shown on the About page.
               To create paragraph breaks, type \n\n between paragraphs (two backslash-n).
               Example: "First paragraph.\n\nSecond paragraph."
"email"       → Your email address
"location"    → Your city/country
"photo"       → Path to your profile photo, e.g. "assets/profile.jpg"
"methods"     → A sentence or two about your research methods (About page)

"education"   → A list of your degrees. Each entry has:
                "degree"      → e.g. "PhD, Anthropology"
                "institution" → e.g. "Australian National University"
                "year"        → e.g. "2022"

"links"       → Your academic profiles. Leave as "" to hide.
  "scholar"     → Google Scholar profile URL
  "orcid"       → ORCID profile URL
  "linkedin"    → LinkedIn profile URL
  "bluesky"     → Bluesky profile URL
  "researchgate"→ ResearchGate profile URL
  "email"       → Your email (also used on the Contact page)
```

### Rules

- Always keep the **double quotes** around values: `"like this"`
- Leave a link as `""` (two quotes with nothing between) to hide it
- For `bio`, separate paragraphs with `\n\n` (no space around the backslashes)

---

## Home page spotlight (`data/currently.csv`)

The **"Currently"** section on the Home page shows 3 short items. Each row has:

| Column | What to put |
|---|---|
| `tag` | A short category label (e.g. Writing, Research, Fieldwork) |
| `title` | A short title for the item |
| `body` | A sentence or two of detail |

**Example:**
```
tag,title,body
Writing,Book in Progress,"Co-editing a volume on Early Childhood Development, forthcoming from Oxford University Press."
Research,Climate & Youth,"Investigating how young people across Indonesia adapt to environmental change."
Collaboration,Open for Partnerships,"Available for collaborations on housing, youth, and social policy."
```

Update these whenever you start something new or want to highlight different work.

---

## Research themes (`data/research_themes.csv`)

Themes group your projects on the **Research** page. Each row is one theme:

| Column | What to put |
|---|---|
| `id` | A short unique identifier — lowercase, hyphens only (e.g. `housing-urban`). **Do not change this once projects are linked to it.** |
| `title` | The full theme title shown on the site |
| `tags` | Keywords separated by semicolons (e.g. `housing;urban;displacement`) |
| `blurb` | A sentence or two describing the theme |

---

## Research projects (`data/projects.csv`)

Each project appears under its theme on the **Research** page, and has its own detail page.

| Column | What to put |
|---|---|
| `theme_id` | Must match an `id` from `research_themes.csv` |
| `slug` | Short unique URL identifier — lowercase, hyphens (e.g. `climate-young-people`). **Do not change once set.** |
| `title` | The full project title |
| `period` | Date range, e.g. `2024–Present` or `2022–2024` |
| `sites` | Field sites, separated by semicolons (e.g. `Jakarta; Makassar`) |
| `role` | Your role (e.g. `Principal Investigator`, `Lead Researcher`) |
| `funders` | Funding bodies, separated by semicolons |
| `partners` | Partner organisations, separated by semicolons |
| `summary` | 2–3 sentences summarising the project |
| `long` | A longer paragraph for the project detail page (optional) |
| `outputs` | Published outputs, separated by semicolons (e.g. `Journal article (2024); Policy brief (2023)`) |

**To add a new project**, copy an existing row and fill in the columns.

---

## Publications (`data/publications.csv`)

Publications appear grouped by theme on the **Publications** page.

| Column | What to put |
|---|---|
| `theme` | The theme name to group under (e.g. `Housing and Urban Life`). Does **not** need to match research_themes — it's just a label. |
| `kind` | Publication type: `Journal Article`, `Book Chapter`, `Edited Volume`, `Book`, `Report`, `Working Paper`, `Op-ed` |
| `title` | The full publication title |
| `authors` | All authors, comma-separated |
| `venue` | Journal, publisher, or outlet name |
| `year` | Year published, or `forthcoming` |
| `url` | DOI or link. Leave blank for no link. |

**To add a new publication**, add a new row. Publications within each theme appear in the order they are listed in the file.

---

## Public engagement (`data/engagement.csv`)

Appears on the **Engagement** page, sorted into Podcasts, Writing, and Talks sections.

| Column | What to put |
|---|---|
| `type` | Must be exactly: `Podcast`, `Writing`, or `Talk` |
| `title` | Title of the podcast episode, article, or talk |
| `venue` | The podcast name, publication, or institution |
| `year` | Year (just the number) |
| `location` | City/country for talks — leave blank for podcasts and writing |

---

## Collaborations (`data/collaborations.csv`)

Appears on the **Collaborations** page.

| Column | What to put |
|---|---|
| `name` | Organisation name |
| `role` | Your role (e.g. `Research Affiliate`, `Partner Researcher`) |
| `since` | Year the collaboration started (just the number, e.g. `2020`) |
| `place` | City or country |
| `note` | One sentence describing the collaboration |

---

## Awards (`data/awards.csv`)

Also on the **Collaborations** page, in the Awards & Honours section.

| Column | What to put |
|---|---|
| `year` | Year received |
| `title` | Award name |
| `body` | The awarding institution |
| `note` | Optional: a brief note about what it was for |

---

## Grants (`data/grants.csv`)

Also on the **Collaborations** page, in a dark inverted block.

| Column | What to put |
|---|---|
| `period` | Date range, e.g. `2024–2027` |
| `title` | Project title |
| `funder` | Funding body |
| `amount` | Amount awarded (e.g. `£280,000` or `AUD 540,000`) |
| `role` | Your role on the grant |

---

## Fieldwork gallery (`data/gallery.csv`)

Photos appear on the **Fieldwork** page in a filterable grid.

| Column | What to put |
|---|---|
| `caption` | Caption for the photo |
| `year` | Year the photo was taken |
| `location` | Place name shown under the photo |
| `tag` | Must be exactly: `urban`, `coastal`, or `rural` (used for filtering) |
| `filename` | Filename of the image in the `assets/fieldwork/` folder (e.g. `jakarta-01.jpg`). Leave blank to show a placeholder. |

**To upload fieldwork photos:**
1. Go to your repository → `assets/` folder
2. If there is no `fieldwork/` subfolder, create a dummy file: "Add file" → "Create new file" → type `assets/fieldwork/.gitkeep` → commit
3. Then go to `assets/fieldwork/` and click "Add file" → "Upload files"
4. After uploading, add the filename to the relevant row in `gallery.csv`

---

## Uploading a profile photo

1. Go to your repository → `assets/` folder
2. Click **"Add file"** → **"Upload files"**
3. Upload your photo (any format: jpg, png, webp)
4. Open `data/site.json` and update the `"photo"` field with the filename:
   ```
   "photo": "assets/your-photo.jpg"
   ```

---

## CSV formatting rules (applies to all `.csv` files)

- **Always quote fields that contain commas** — wrap them in double quotes: `"Last, First"`
- **To include a double quote** inside a quoted field, write it twice: `"She said ""hello"""`
- **Semicolons** separate multiple values within a single field (sites, funders, outputs, tags)
- **Leave a field blank** by putting nothing between the commas: `value,,next value`
- **Do not add extra columns** — the site only reads the columns listed in the header row

---

## Common mistakes

| What happened | How to fix it |
|---|---|
| Page shows no data | Check the CSV for a missing or malformed header row |
| A project doesn't appear on Research | Check that `theme_id` in `projects.csv` exactly matches an `id` in `research_themes.csv` |
| A publication entry is missing | Check that the row doesn't have an extra or missing comma |
| Photo not showing | Confirm the filename in `site.json` or `gallery.csv` matches the uploaded file exactly (case-sensitive) |
| Changes not visible | Wait 1–2 minutes, then hard-refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) |

---

*If something is broken and you can't fix it, take a screenshot of what you see and ask for help.*

# How to Edit Your Website

This guide covers everything you need to update your website content — no coding required. All edits are done directly on GitHub in your browser.

---

## Quick overview

Your website content lives in three files in the **`data/`** folder:

| File | What it controls |
|---|---|
| `data/site.json` | Your name, bio, research interests, links, and the contact form intro |
| `data/projects.csv` | Your research projects list |
| `data/publications.csv` | Your publications list |

---

## How to find and edit a file on GitHub

1. Go to your repository on GitHub (bookmark it!)
2. Click on the `data` folder
3. Click the file you want to edit
4. Click the **pencil icon** (✏️) in the top right — it says "Edit this file" when you hover
5. Make your changes
6. When done, click the green **"Commit changes"** button at the top right
7. A small window appears — you can type a note about what you changed, or just click the green **"Commit changes"** button again
8. Wait about 30 seconds, then refresh your website to see the changes

> **Important:** If you see a **yellow or red warning bar** at the top of the editor after making changes — stop. Do not click Commit. Close the tab and undo your changes, or ask for help. This warning means there is a formatting error that would break the page.

---

## Updating your profile (`data/site.json`)

This file controls your **Profile page** and the intro text on your **Collaborate page**.

### What the fields mean

```
"name"              → Your name as it appears in the page heading
"title"             → Your role or position (e.g. "PhD Researcher")
"institution"       → Your university or organisation, and country
"photo"             → The filename of your profile photo (see below)
"bio"               → Your About paragraph — a few sentences about your research

"interests"         → Your research interest tags (the pill-shaped labels)
                      Each item goes on its own line, in "quotes", separated by commas

"links"             → Your academic and social links
  "scholar"         → Your Google Scholar profile URL (paste the full https://... link)
  "orcid"           → Your ORCID profile URL
  "researchgate"    → Your ResearchGate profile URL
  "linkedin"        → Your LinkedIn profile URL
  "email"           → Your email address (just the address, no mailto:)

"collaborate_intro" → The introductory text on your Collaborate page
"formspree_id"      → Your Formspree form ID (see the contact form section below)
```

### Rules to remember

- Always keep the **double quotes** around every value: `"like this"`
- To hide a link (e.g. if you don't have ResearchGate), leave it as `""` — two quotes with nothing between them
- For `interests`, each tag goes on its own line. To add a new interest, copy one of the existing lines and paste it. Make sure every line except the last one ends with a comma:

```json
"interests": [
  "Environmental Economics",
  "Land Use Change",
  "Southeast Asia"
]
```

---

## Adding a project (`data/projects.csv`)

**Tip:** Before editing, click the **Preview** tab — GitHub will show your projects as a table so you can see the current data clearly.

### How to add a new project

1. Open `data/projects.csv` and click the pencil icon
2. Go to the last row of data (the bottom of the file, before any blank lines)
3. Press Enter to start a new line
4. Copy this template and fill in your details:

```
"Your Project Title","2025 – Present","Ongoing","Write your project description here.",""
```

5. Commit the changes

### The columns explained

| Column | What to put |
|---|---|
| `title` | The project name |
| `years` | Date range, e.g. `2024 – Present` or `2022 – 2024` |
| `status` | Either `Ongoing` or `Completed` |
| `description` | 2–4 sentences about the project |
| `url` | A link to a project page, if you have one. Leave as `""` for no link. |

### The one rule: always use double quotes around every field

Every piece of text must be wrapped in double quotes, like this:

```
"Project Title","2024 – Present","Ongoing","Description goes here.",""
```

If your description contains a double quote character (rare), write it as two double quotes: `""`.

### To edit an existing project

Find the row with that project title, click into the cell you want to change, and update the text. Keep the surrounding double quotes.

### To remove a project

Delete the entire row (the whole line).

---

## Adding a publication (`data/publications.csv`)

Same approach as projects. Click **Preview** first to see your current publications as a table.

### How to add a new publication

1. Open `data/publications.csv` and click the pencil icon
2. Add a new line at the top (publications go newest first)
3. Copy this template:

```
"Paper Title","Author One, Author Two","Journal Name",2025,"https://doi.org/..."
```

4. Commit the changes

### The columns explained

| Column | What to put |
|---|---|
| `title` | The paper title (without quotation marks — the website adds those automatically) |
| `authors` | All authors, separated by commas |
| `venue` | Journal or conference name |
| `year` | The year as a number — **no quotes around it**: `2025` not `"2025"` |
| `url` | A DOI link or paper URL. Leave as `""` for no link. |

> **Note on year:** The year column is the only one that should not have quotes around it. Write `2025`, not `"2025"`.

---

## Uploading a profile photo

1. Go to your repository on GitHub
2. Click on the `assets` folder (create it if it doesn't exist: "Add file" → "Create new file", name it `assets/.gitkeep`, commit)
3. Click **"Add file"** → **"Upload files"**
4. Drag your photo into the upload area, or click to browse
5. Click **"Commit changes"**
6. Now open `data/site.json`, find the `"photo"` line, and update it with your filename:
   ```
   "photo": "assets/your-photo-filename.jpg"
   ```

The photo will appear as a circle on your profile page. A square photo works best, but any photo will work.

---

## Setting up the contact form

The contact form on your Collaborate page uses a free service called **Formspree**, which forwards messages to your email.

### One-time setup (takes about 2 minutes)

1. Go to **[formspree.io](https://formspree.io)** and sign up for a free account using your email
2. Click **"New Form"** and give it a name (e.g. "Website contact")
3. You'll see a Form ID that looks like: `xpwzabcd`
4. Open `data/site.json`, find the `"formspree_id"` line, and replace `YOUR_FORM_ID` with your actual ID:
   ```
   "formspree_id": "xpwzabcd"
   ```
5. Commit the changes — the form will now be active

After setup, every message submitted through your website will be emailed to you.

---

## Common mistakes

| What went wrong | How to fix it |
|---|---|
| Yellow/red warning in GitHub editor | There's a formatting error. Close the tab without committing and try again carefully. |
| A field is missing from the page | Check that the value in the data file is not empty. It should have something between the quotes. |
| The contact form gives an error | Make sure you set your Formspree ID in `site.json` and that it matches exactly what Formspree shows. |
| A link is not showing up | Make sure the URL starts with `https://` and is not just `""`. |
| Changes not visible on the website | Wait 1–2 minutes and do a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac). |

---

*If something is not working and you can't figure it out, take a screenshot of what you see and ask for help.*

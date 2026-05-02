# Project rules

## Never delete without being explicitly asked

Do not delete files, remove components, remove data, or remove features unless the user has explicitly said to delete or remove that specific thing. This includes:

- Removing components or page sections because they "look unused" or "aren't wired up yet"
- Deleting data files, CSV rows, or JSON fields
- Removing content that appears to be placeholder or stub data

If something is dead code or unused as a **direct consequence** of a change the user just requested (e.g. removing a page that was just explicitly asked to be removed), cleaning it up is fine. But do not go beyond the literal scope of what was asked.

## Project context

Clara's academic website. Clara is the non-technical content owner — she edits data files on GitHub. Keep all changes non-breaking and easy for a non-technical person to understand.

Data files live in `data/`. Use CSV for tabular data; JSON only for genuinely nested structures (currently just `site.json`).

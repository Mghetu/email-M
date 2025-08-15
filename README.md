# MJML Email Editor — GitHub Pages + “+ Insert” Menu

This build mimics the UI logic you asked for:
- A floating **“+” button** appears on component selection (in the toolbar).
- Clicking it opens an **Insert menu** that shows **only the MJML components allowed** at that position.
- Smart defaults (e.g., new `<mj-section>` gets a `<mj-column>`, new `<mj-navbar>` gets a `<mj-navbar-link>`, etc.).
- Runs entirely on **GitHub Pages** (no backend): uses `grapesjs-mjml` and `mjml-browser`.

## Use on GitHub Pages
1) Create a repo, upload these files at the root: `index.html`, `app.js`, `styles.css`, `README.md`.
2) Settings → Pages → “Deploy from a branch”. Select `main` and folder `/`.
3) Open the Pages URL. Optional: `?project=my-newsletter` to scope storage.

## Notes
- Asset uploads are disabled (static hosting). Add images via URL in the Asset Manager.
- “Import MJML” compiles MJML **in the browser** via `mjml-browser`.

# jinja-preview

A small static app for previewing Jinja-style newsletter templates in the browser.

Paste a template into the left editor, optionally provide JSON context, and see the rendered output on the right.

## Why this works on GitHub Pages

This project is fully static:

- `index.html`
- `styles.css`
- `app.js`
- `samples/body.jinja2`

The preview uses [Nunjucks](https://mozilla.github.io/nunjucks/), a browser-friendly templating engine inspired by Jinja2, so you can host this on GitHub Pages without a backend.

## Important compatibility note

For most newsletter templates, this should feel very close to Jinja2. But because GitHub Pages cannot run Python, this app does **not** execute a real Python Jinja2 environment.

That means templates relying on Python-only behavior may need a backend later, for example:

- custom Python filters
- custom Python extensions
- application-specific globals
- advanced Jinja2 environment behavior

If you run into those limitations, the next step would be a tiny Vercel deployment that renders with real Python + Jinja2 server-side.

## Local development

Because the app fetches the sample template, run it through a local web server instead of opening `index.html` directly.

```bash
cd /workspace/project
python3 -m http.server 12000
```

Then open:

- `http://localhost:12000`
- or your hosted workspace URL mapped to port `12000`

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder.
5. Save.

GitHub Pages will serve the app as a static site.

## Deploy to Vercel

This same static site also works on Vercel with no code changes. Import the repository in Vercel and deploy it as a static project.


## Features

- left-side Jinja editor
- right-side preview iframe
- optional JSON context
- rendered HTML output panel
- auto-render while editing
- sample template loader
- local storage persistence between refreshes

## Keyboard shortcut

- `Ctrl+Enter` or `Cmd+Enter` renders immediately
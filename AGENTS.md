# Repository Notes

## Project overview
- This repository is a static Jinja newsletter preview tool.
- The app is designed to run on GitHub Pages with no build step.
- Rendering is done client-side with Nunjucks, so it is close to Jinja2 but not a full Python Jinja2 runtime.

## Key files
- `index.html` contains the app shell.
- `styles.css` contains the responsive two-pane layout and UI styling.
- `app.js` handles template rendering, local storage, sample loading, and preview updates.
- `samples/body.jinja2` contains the default newsletter sample used by the UI.

## Local verification
- Run `python3 -m http.server 12000` from the repository root.
- Open the mapped workspace host for port `12000` to test the browser UI.

## Deployment
- GitHub Pages should work because the site is static.
- If real Python Jinja2 compatibility becomes necessary, move rendering to a backend such as Vercel.

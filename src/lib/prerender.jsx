// Apache serves pre-rendered HTML for sitemap pages (scripts/build-static.mjs).
// It is captured before React replaces #root, then shown while the page waits
// for TMDB: a crawler that snapshots early, or can't reach TMDB, still gets
// the content instead of "Chargement…".
let captured = null;

export function capturePrerender(root = document.getElementById('root'), location = window.location) {
  const html = root?.innerHTML.trim();
  captured = html ? { html, url: location.pathname + location.search } : null;
}

// Only for the URL that was served pre-rendered
export function prerenderedHtml(location = window.location) {
  return captured?.url === location.pathname + location.search ? captured.html : null;
}

export default function Prerendered({ fallback }) {
  const html = prerenderedHtml();
  // Our own escaped HTML, already in the served document
  return html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : fallback;
}

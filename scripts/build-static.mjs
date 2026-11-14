// Runs after `vite build` (npm "postbuild"): writes build/sitemap.xml and one
// pre-rendered HTML file per sitemap URL in build/_prerender/, which Apache
// serves instead of the bare SPA shell (so crawlers see distinct pages).
// Never fails the build: without TMDB, only the month pages are listed and
// nothing is pre-rendered, Apache then falls back to build/index.html.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  DEFAULT_DESCRIPTION, SITE_URL, fullTitle, isIndexable, monthMeta, movieMeta, moviePath,
} from '../src/lib/format.js';

const MONTHS_BEFORE = 12;
const MONTHS_AFTER = 6;
const DELAY_MS = 250;
const CONCURRENCY = 4;
const CAST_COUNT = 12;
const WRITER_JOBS = ['Screenplay', 'Writer', 'Story'];

const pad = (n) => String(n).padStart(2, '0');

// 'YYYY-MM' strings, the format of the Home page ?mois= parameter
export function monthsAround(today, before = MONTHS_BEFORE, after = MONTHS_AFTER) {
  const months = [];
  for (let offset = -before; offset <= after; offset++) {
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1));
    months.push(`${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`);
  }
  return months;
}

export function monthRange(month) {
  const [year, m] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return [`${month}-01`, `${month}-${pad(lastDay)}`];
}

// Same queries as src/api/moviedb.js, which can't be imported here: it reads
// its key from import.meta.env, a Vite-only object.
async function tmdb(apiKey, path, params = {}) {
  const query = new URLSearchParams({ api_key: apiKey, language: 'fr', ...params });
  const response = await fetch(`https://api.themoviedb.org/3/${path}?${query}`);
  if (!response.ok) throw new Error(`TMDB ${path} : HTTP ${response.status}`);
  return response.json();
}

async function fetchMoviesOfMonth(apiKey, month) {
  const [start, end] = monthRange(month);
  const data = await tmdb(apiKey, 'discover/movie', {
    'primary_release_date.gte': start,
    'primary_release_date.lte': end,
    sort_by: 'popularity.desc',
  });
  return data.results;
}

const fetchMovie = (apiKey, id) => tmdb(apiKey, `movie/${id}`, { append_to_response: 'credits,releases' });

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// Months around today with their indexable movies, in TMDB's popularity order.
// Movie details (credits, release dates) are fetched for the pre-render; a
// movie whose details fail keeps its discover data and is still listed.
export async function collectSite({ apiKey, today = new Date(), delay = DELAY_MS, warn = console.warn }) {
  const current = monthsAround(today, 0, 0)[0];
  const months = monthsAround(today).map((month) => ({ month, movies: [] }));
  if (!apiKey) {
    warn('static: no REACT_APP_MOVIEDB_API_KEY, movie pages skipped');
    return { current, months, complete: false };
  }
  try {
    const seen = new Set();
    for (const entry of months) {
      for (const movie of await fetchMoviesOfMonth(apiKey, entry.month)) {
        // A movie belongs to the first month that lists it
        if (isIndexable(movie) && !seen.has(movie.id)) {
          seen.add(movie.id);
          entry.movies.push(movie);
        }
      }
      if (delay) await new Promise((done) => setTimeout(done, delay));
    }
  } catch (error) {
    warn(`static: ${error.message}, movie pages skipped`);
    return { current, months: months.map(({ month }) => ({ month, movies: [] })), complete: false };
  }
  for (const entry of months) {
    const movies = await mapLimit(entry.movies, CONCURRENCY, async (movie) => {
      try {
        return { ...await fetchMovie(apiKey, movie.id), detailed: true };
      } catch (error) {
        warn(`static: movie ${movie.id}: ${error.message}`);
        return movie;
      }
    });
    // The app decides noindex from the details: stay consistent with it
    entry.movies = movies.filter(isIndexable);
  }
  return { current, months, complete: true };
}

export function sitemapPaths({ current, months }) {
  const paths = ['/', ...months.filter(({ month }) => month !== current).map(({ month }) => `/?mois=${month}`)];
  const moviePaths = new Set(months.flatMap(({ movies }) => movies.map(moviePath)));
  return [...paths, ...moviePaths];
}

const escapeXml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sitemapXml(paths) {
  const urls = paths.map((path) => `  <url><loc>${escapeXml(SITE_URL + path)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export const escapeHtml = (text) => String(text ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const frenchDate = (date) => (date ? date.split('-').reverse().join('/') : null);

// Same tags as src/lib/page_meta.js, so the app updates them instead of adding new ones
export function renderPage(template, { title, description, path, image, type = 'website' }, body) {
  const pageTitle = escapeHtml(fullTitle(title));
  const text = escapeHtml(description || DEFAULT_DESCRIPTION);
  const url = escapeHtml(`${SITE_URL}${path}`);
  const head = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:title" content="${pageTitle}">`,
    `<meta property="og:description" content="${text}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:image" content="${escapeHtml(image || `${SITE_URL}/logo-big.png`)}">`,
  ].map((tag) => `    ${tag}\n`).join('');

  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${text}">`],
    [/\n\s*<\/head>/, `\n${head}  </head>`],
    [/<div id="root"><\/div>/, `<div id="root">${body}</div>`],
  ];
  return replacements.reduce((html, [pattern, value]) => {
    if (!pattern.test(html)) throw new Error(`template: ${pattern} not found in build/index.html`);
    return html.replace(pattern, () => value);
  }, template);
}

function monthLink(movie, current) {
  const month = movie.release_date?.slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(month || '')) return '';
  const meta = monthMeta(month, current);
  return `<p><a href="${escapeHtml(meta.path)}">${escapeHtml(meta.title)}</a></p>`;
}

export function movieBody(movie, current) {
  const crew = movie.credits?.crew || [];
  const directors = crew.filter((person) => person.job === 'Director').map((person) => person.name);
  const writers = [...new Set(crew.filter((person) => WRITER_JOBS.includes(person.job)).map((person) => person.name))];
  const cast = (movie.credits?.cast || []).slice(0, CAST_COUNT);
  const releaseFr = movie.releases?.countries?.find((country) => country.iso_3166_1 === 'FR')?.release_date;
  const genres = (movie.genres || []).map((genre) => genre.name);

  const parts = [`<h1>${escapeHtml(movie.title)}</h1>`];
  const dates = [
    movie.release_date && `Date de sortie : ${frenchDate(movie.release_date)}`,
    releaseFr && `Sortie en France : ${frenchDate(releaseFr.slice(0, 10))}`,
  ].filter(Boolean);
  if (dates.length) parts.push(`<p>${escapeHtml(dates.join(' · '))}</p>`);
  if (movie.original_title && movie.original_title !== movie.title) {
    parts.push(`<p>Titre original : ${escapeHtml(movie.original_title)}</p>`);
  }
  parts.push('<h2>Synopsis</h2>', `<p>${escapeHtml(movie.overview)}</p>`);
  if (directors.length) parts.push('<h2>Réalisation</h2>', `<p>${escapeHtml(directors.join(', '))}</p>`);
  if (writers.length) parts.push('<h2>Scénario</h2>', `<p>${escapeHtml(writers.join(', '))}</p>`);
  if (cast.length) {
    const items = cast.map((person) => `<li>${escapeHtml(person.name)}${person.character ? ` (${escapeHtml(person.character)})` : ''}</li>`);
    parts.push('<h2>Casting</h2>', `<ul>${items.join('')}</ul>`);
  }
  if (genres.length) parts.push(`<p>Genres : ${escapeHtml(genres.join(', '))}</p>`);
  parts.push(monthLink(movie, current));
  return `<main class="container prerender">${parts.join('')}</main>`;
}

export function monthBody(month, movies, current) {
  const meta = monthMeta(month, current);
  const items = movies.map((movie) => {
    const year = movie.release_date?.slice(0, 4);
    return `<li><a href="${escapeHtml(moviePath(movie))}">${escapeHtml(movie.title)}</a>${year ? ` (${year})` : ''}</li>`;
  });
  return `<main class="container prerender"><h1>Les films les plus populaires en ${escapeHtml(meta.label)}</h1>`
    + `${items.length ? `<ol>${items.join('')}</ol>` : ''}</main>`;
}

// { relative file path: html } for every page to pre-render
export function prerenderFiles(template, { current, months }) {
  const files = {};
  for (const { month, movies } of months) {
    const html = renderPage(template, monthMeta(month, current), monthBody(month, movies, current));
    files[`mois/${month}.html`] = html;
    if (month === current) files['home.html'] = html;
    for (const movie of movies.filter((m) => m.detailed)) {
      files[`${moviePath(movie).slice(1)}.html`] = renderPage(template, movieMeta(movie), movieBody(movie, current));
    }
  }
  return files;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(fileURLToPath(import.meta.url), '../..');
  const build = resolve(root, 'build');
  const { loadEnv } = await import('vite');
  const env = loadEnv('production', root, 'REACT_APP_');
  const site = await collectSite({ apiKey: env.REACT_APP_MOVIEDB_API_KEY });

  const paths = sitemapPaths(site);
  writeFileSync(resolve(build, 'sitemap.xml'), sitemapXml(paths));
  console.log(`sitemap: ${paths.length} URLs in build/sitemap.xml`);

  if (site.complete) {
    try {
      const files = prerenderFiles(readFileSync(resolve(build, 'index.html'), 'utf8'), site);
      for (const [file, html] of Object.entries(files)) {
        const target = resolve(build, '_prerender', file);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, html);
      }
      console.log(`prerender: ${Object.keys(files).length} pages in build/_prerender`);
    } catch (error) {
      console.warn(`prerender: ${error.message}, skipped`);
    }
  }
}

// Writes build/sitemap.xml after `vite build` (npm "postbuild").
// Never fails the build: without TMDB, the sitemap only lists the month pages.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE_URL, moviePath } from '../src/lib/format.js';

const MONTHS_BEFORE = 12;
const MONTHS_AFTER = 6;
const DELAY_MS = 250;

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

// Same query as fetchMoviesOfMonth in src/api/moviedb.js, which can't be
// imported here: it reads its key from import.meta.env, a Vite-only object.
async function fetchMoviesOfMonth(apiKey, month) {
  const [start, end] = monthRange(month);
  const query = new URLSearchParams({
    api_key: apiKey,
    language: 'fr',
    'primary_release_date.gte': start,
    'primary_release_date.lte': end,
    sort_by: 'popularity.desc',
  });
  const response = await fetch(`https://api.themoviedb.org/3/discover/movie?${query}`);
  if (!response.ok) throw new Error(`TMDB discover/movie ${month} : HTTP ${response.status}`);
  return (await response.json()).results;
}

export async function sitemapPaths({ apiKey, today = new Date(), delay = DELAY_MS, warn = console.warn }) {
  const months = monthsAround(today);
  const current = monthsAround(today, 0, 0)[0];
  const paths = ['/', ...months.filter((month) => month !== current).map((month) => `/?mois=${month}`)];
  if (!apiKey) {
    warn('sitemap: no REACT_APP_MOVIEDB_API_KEY, movie pages skipped');
    return paths;
  }
  const moviePaths = new Set();
  try {
    for (const month of months) {
      for (const movie of await fetchMoviesOfMonth(apiKey, month)) moviePaths.add(moviePath(movie));
      if (delay) await new Promise((done) => setTimeout(done, delay));
    }
  } catch (error) {
    warn(`sitemap: ${error.message}, movie pages skipped`);
    return paths;
  }
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(fileURLToPath(import.meta.url), '../..');
  const { loadEnv } = await import('vite');
  const env = loadEnv('production', root, 'REACT_APP_');
  const paths = await sitemapPaths({ apiKey: env.REACT_APP_MOVIEDB_API_KEY });
  writeFileSync(resolve(root, 'build/sitemap.xml'), sitemapXml(paths));
  console.log(`sitemap: ${paths.length} URLs in build/sitemap.xml`);
}

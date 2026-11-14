import slugify from 'slugify';

export const SITE_URL = 'https://www.movies-calendar.com';
export const SITE_NAME = 'Movies Calendar';
export const DEFAULT_DESCRIPTION = 'Les films les plus populaires, mois par mois, avec The Movie Database.';
export const IMAGE_URL = 'https://image.tmdb.org/t/p/';

const numberFormat = new Intl.NumberFormat('fr-FR');

export function formatNumber(value) {
  return numberFormat.format(value || 0);
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

// Punctuation becomes a word break ("Henry Danger: The Movie", "L'Internat"),
// then strict mode drops what slugify can't transliterate (CJK titles -> 'detail').
export function movieSlug(title) {
  const words = (title || '').replace(/[^\p{L}\p{N}]+/gu, ' ');
  return slugify(words, { lower: true, strict: true }) || 'detail';
}

// Without a synopsis the page is an empty template: kept out of the index.
export function isIndexable(movie) {
  return Boolean(movie?.overview?.trim());
}

export function moviePath(movie) {
  return `/movie/${movie.id}/${movieSlug(movie.title)}`;
}

// Cut on a word boundary so search snippets don't end mid-word.
export function summary(text, max = 160) {
  if (!text || text.length <= max) return text || '';
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, '')}…`;
}

export function fullTitle(title) {
  return title ? `${title} – ${SITE_NAME}` : SITE_NAME;
}

// Head tags of a movie page: shared by the app and the build-time pre-render.
export function movieMeta(movie) {
  const year = movie.release_date?.slice(0, 4);
  return {
    title: year ? `${movie.title} (${year})` : movie.title,
    description: summary(movie.overview),
    path: moviePath(movie),
    image: movie.poster_path ? `${IMAGE_URL}w500${movie.poster_path}` : null,
    type: 'video.movie',
    noindex: !isIndexable(movie),
  };
}

const monthFormat = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// month and currentMonth are 'YYYY-MM', the format of the home page ?mois= parameter
export function monthMeta(month, currentMonth) {
  const [year, m] = month.split('-').map(Number);
  const label = monthFormat.format(new Date(Date.UTC(year, m - 1, 1)));
  return {
    label,
    title: `Films les plus populaires en ${label}`,
    description: `Les films les plus populaires sortis en ${label} : affiches, notes et bandes-annonces, avec The Movie Database.`,
    path: month === currentMonth ? '/' : `/?mois=${month}`,
  };
}

// One entry per movie (an actor can be credited twice), newest first, undated last.
export function filmography(credits) {
  const byId = new Map();
  for (const credit of credits?.cast || []) {
    const known = byId.get(credit.id);
    if (!known) {
      byId.set(credit.id, { ...credit });
    } else if (credit.character && !known.character?.includes(credit.character)) {
      known.character = known.character ? `${known.character} / ${credit.character}` : credit.character;
    }
  }
  return [...byId.values()].sort((a, b) => {
    if (!a.release_date || !b.release_date) return (a.release_date ? 0 : 1) - (b.release_date ? 0 : 1);
    return b.release_date.localeCompare(a.release_date);
  });
}

export function knownFor(credits, count = 8) {
  return filmography(credits)
    .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
    .slice(0, count);
}

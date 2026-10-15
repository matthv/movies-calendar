import slugify from 'slugify';

export const SITE_URL = 'https://www.movies-calendar.com';

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

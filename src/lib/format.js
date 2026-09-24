import slugify from 'slugify';

const numberFormat = new Intl.NumberFormat('fr-FR');

export function formatNumber(value) {
  return numberFormat.format(value || 0);
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function movieSlug(title) {
  return slugify((title || '').toLowerCase()) || 'detail';
}

export function moviePath(movie) {
  return `/movie/${movie.id}/${movieSlug(movie.title)}`;
}

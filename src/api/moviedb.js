const API_KEY = import.meta.env.REACT_APP_MOVIEDB_API_KEY;
const LANG = 'fr';
const ROOT_URL = 'https://api.themoviedb.org/3/';

export const IMAGE_URL = 'https://image.tmdb.org/t/p/';

async function get(path, params = {}, signal) {
  const query = new URLSearchParams({ api_key: API_KEY, language: LANG });
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, value);
  }
  const response = await fetch(`${ROOT_URL}${path}?${query}`, { signal });
  if (!response.ok) {
    throw new Error(`TMDB ${path} : HTTP ${response.status}`);
  }
  return response.json();
}

export function fetchGenres(signal) {
  return get('genre/movie/list', {}, signal).then((data) => data.genres);
}

export function fetchMoviesOfMonth(startDate, endDate, signal) {
  return get('discover/movie', {
    'primary_release_date.gte': startDate,
    'primary_release_date.lte': endDate,
    sort_by: 'popularity.desc',
  }, signal).then((data) => data.results);
}

export function searchMovies(query, signal) {
  return get('search/movie', { query }, signal).then((data) => data.results);
}

export function fetchMovie(id, signal) {
  return get(`movie/${id}`, {
    append_to_response: 'credits,releases,images,videos,keywords',
    include_image_language: 'null',
  }, signal);
}

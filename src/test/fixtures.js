import { vi } from 'vitest';
export const GENRES = [{ id: 28, name: 'Action' }, { id: 18, name: 'Drame' }];

export const MOVIES = [
  { id: 1, title: 'Premier', overview: 'En avant', vote_average: 7.3, genre_ids: [28], poster_path: '/p1.jpg', backdrop_path: '/b1.jpg' },
  { id: 2, title: 'Deuxième film', overview: '', vote_average: 6, genre_ids: [28, 18, 999], poster_path: null, backdrop_path: null },
  { id: 3, title: 'Troisième', overview: '', vote_average: 5, genre_ids: [18], poster_path: null, backdrop_path: null },
  { id: 4, title: 'Dernier', overview: '', vote_average: 5, genre_ids: [], poster_path: null, backdrop_path: null },
];

export const MOVIE = {
  id: 550,
  title: 'Fight Club',
  original_title: 'Fight Club',
  overview: 'Le narrateur...',
  vote_average: 8.439999,
  budget: 63000000,
  revenue: 100853753,
  runtime: 139,
  release_date: '1999-10-15',
  poster_path: '/poster.jpg',
  genres: [{ id: 18, name: 'Drame' }],
  production_companies: [{ id: 1, name: 'Fox 2000 Pictures' }],
  production_countries: [{ name: 'Germany' }],
  releases: { countries: [{ iso_3166_1: 'FR', release_date: '1999-11-10' }] },
  credits: {
    cast: [{ credit_id: 'c1', cast_id: 1, name: 'Edward Norton', character: 'Narrator', profile_path: null }],
    crew: [
      { credit_id: 'd1', id: 7467, name: 'David Fincher', job: 'Director' },
      { credit_id: 'w1', id: 7468, name: 'Jim Uhls', job: 'Screenplay' },
    ],
  },
  images: { posters: [{ file_path: '/a1.jpg' }], backdrops: [{ file_path: '/b1.jpg' }] },
  videos: { results: [{ key: 'yt1' }] },
  keywords: { keywords: [{ id: 1, name: 'nihilism' }] },
};

// Faux fetch qui repond selon le chemin TMDB demande
export function mockTmdb(routes) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const { pathname, searchParams } = new URL(url);
    const path = pathname.replace('/3/', '');
    const handler = routes[path];
    if (!handler) return new Response('{}', { status: 404 });
    const body = typeof handler === 'function' ? handler(searchParams) : handler;
    return new Response(JSON.stringify(body), { status: 200 });
  });
}

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
    cast: [{ credit_id: 'c1', cast_id: 1, id: 819, name: 'Edward Norton', character: 'Narrator', profile_path: null }],
    crew: [
      { credit_id: 'd1', id: 7467, name: 'David Fincher', job: 'Director' },
      { credit_id: 'w1', id: 7468, name: 'Jim Uhls', job: 'Screenplay' },
    ],
  },
  images: { posters: [{ file_path: '/a1.jpg' }], backdrops: [{ file_path: '/b1.jpg' }] },
  videos: { results: [{ key: 'yt1' }] },
  keywords: { keywords: [{ id: 1, name: 'nihilism' }] },
};

export const PERSON = {
  id: 819,
  name: 'Edward Norton',
  biography: '',
  birthday: '1969-08-18',
  deathday: null,
  place_of_birth: 'Boston, Massachusetts, USA',
  profile_path: null,
  movie_credits: {
    cast: [
      { id: 550, title: 'Fight Club', release_date: '1999-10-15', character: 'Narrator', vote_count: 30000, poster_path: null },
      { id: 600, title: 'Projet à venir', release_date: '', character: '', vote_count: 0, poster_path: null },
      { id: 700, title: 'American History X', release_date: '1998-10-30', character: 'Derek', vote_count: 12000, poster_path: null },
      { id: 700, title: 'American History X', release_date: '1998-10-30', character: 'Narrateur', vote_count: 12000, poster_path: null },
      { id: 800, title: 'Le Pacte', release_date: '2001-03-01', character: 'Jack', vote_count: 10, poster_path: null },
    ],
  },
};

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

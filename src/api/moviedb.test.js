import { describe, expect, it, vi } from 'vitest';
import { fetchMoviesOfMonth, fetchMovie, searchMovies } from './moviedb';

describe('client TMDB', () => {
  it('construit l URL avec la clef, la langue et les parametres', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"results":[]}'));
    await fetchMoviesOfMonth('2026-09-01', '2026-09-30');

    const url = new URL(fetchSpy.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.themoviedb.org/3/discover/movie');
    expect(url.searchParams.get('api_key')).toBe('test-key');
    expect(url.searchParams.get('language')).toBe('fr');
    expect(url.searchParams.get('primary_release_date.gte')).toBe('2026-09-01');
    expect(url.searchParams.get('primary_release_date.lte')).toBe('2026-09-30');
    expect(url.searchParams.get('sort_by')).toBe('popularity.desc');
  });

  it('encode la recherche', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"results":[]}'));
    await searchMovies('le & la');
    expect(new URL(fetchSpy.mock.calls[0][0]).searchParams.get('query')).toBe('le & la');
  });

  it('echoue sur une reponse HTTP en erreur', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));
    await expect(fetchMovie(550)).rejects.toThrow('HTTP 401');
  });
});

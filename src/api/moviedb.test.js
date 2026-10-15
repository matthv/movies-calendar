import { describe, expect, it, vi } from 'vitest';
import { fetchMoviesOfMonth, fetchMovie, fetchPerson, searchMovies } from './moviedb';
import { PERSON, mockTmdb } from '../test/fixtures';

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
    expect(url.searchParams.get('page')).toBe('1');
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

  it('charge une personne avec sa filmographie', async () => {
    const fetchSpy = mockTmdb({ 'person/819': { ...PERSON, biography: 'Acteur americain.' } });
    const person = await fetchPerson(819);
    expect(person.biography).toBe('Acteur americain.');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(new URL(fetchSpy.mock.calls[0][0]).searchParams.get('append_to_response')).toBe('movie_credits');
  });

  it('prend la biographie anglaise quand la francaise est vide', async () => {
    mockTmdb({
      'person/819': (params) => (params.get('language') === 'en-US' ? { biography: 'American actor.' } : PERSON),
    });
    const person = await fetchPerson(819);
    expect(person.biography).toBe('American actor.');
    expect(person.biographyLanguage).toBe('en');
    expect(person.movie_credits.cast).toHaveLength(5);
  });
});

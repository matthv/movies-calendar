import { describe, expect, it } from 'vitest';
import { personAge } from './dates';
import { filmography, isIndexable, knownFor, movieSlug, summary } from './format';
import { PERSON } from '../test/fixtures';

describe('summary', () => {
  it('laisse un texte court intact', () => {
    expect(summary('Court.')).toBe('Court.');
    expect(summary(undefined)).toBe('');
  });

  it('coupe un texte long sur un mot', () => {
    const text = 'Un narrateur insomniaque rencontre un vendeur de savon, et ensemble ils fondent un club de combat clandestin.';
    const result = summary(text, 60);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result).toBe('Un narrateur insomniaque rencontre un vendeur de savon, et…');
  });
});

describe('movieSlug', () => {
  it('fait des mots de la ponctuation et garde les accents translitteres', () => {
    expect(movieSlug("L'Internat")).toBe('l-internat');
    expect(movieSlug('Henry Danger: The Movie')).toBe('henry-danger-the-movie');
    expect(movieSlug("Ishqa'n De Lekhe")).toBe('ishqa-n-de-lekhe');
    expect(movieSlug('...Et pour quelques dollars de plus')).toBe('et-pour-quelques-dollars-de-plus');
    expect(movieSlug('Été Indien')).toBe('ete-indien');
    expect(movieSlug('Hundertzwölf')).toBe('hundertzwolf');
  });

  it('retombe sur detail quand rien ne se translittere', () => {
    expect(movieSlug('戏台')).toBe('detail');
    expect(movieSlug('')).toBe('detail');
  });
});

describe('isIndexable', () => {
  it('exige un synopsis', () => {
    expect(isIndexable({ overview: 'Un film.' })).toBe(true);
    expect(isIndexable({ overview: '  ' })).toBe(false);
    expect(isIndexable({})).toBe(false);
  });
});

describe('personAge', () => {
  it('donne l age actuel ou l age au deces', () => {
    expect(personAge('1969-08-18', '2019-08-17')).toBe(49);
    expect(personAge('1969-08-18', '2019-08-18')).toBe(50);
    expect(personAge(null)).toBeNull();
  });
});

describe('filmography', () => {
  it('fusionne les doublons, trie du plus recent au plus ancien, sans date a la fin', () => {
    const films = filmography(PERSON.movie_credits);
    expect(films.map((film) => film.id)).toEqual([800, 550, 700, 600]);
    expect(films[2].character).toBe('Derek / Narrateur');
    expect(filmography(undefined)).toEqual([]);
  });
});

describe('knownFor', () => {
  it('garde les films les plus votes', () => {
    expect(knownFor(PERSON.movie_credits, 2).map((film) => film.id)).toEqual([550, 700]);
  });
});

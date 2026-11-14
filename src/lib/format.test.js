import { describe, expect, it } from 'vitest';
import { personAge } from './dates';
import { filmography, fullTitle, isIndexable, knownFor, monthMeta, movieMeta, movieSlug, summary } from './format';
import dayjs from './dayjs';
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

describe('metadonnees', () => {
  it('compose le titre complet', () => {
    expect(fullTitle('Fight Club (1999)')).toBe('Fight Club (1999) – Movies Calendar');
    expect(fullTitle(undefined)).toBe('Movies Calendar');
  });

  it('decrit une fiche film', () => {
    const meta = movieMeta({ id: 550, title: 'Fight Club', overview: 'Le narrateur...', release_date: '1999-10-15', poster_path: '/p.jpg' });
    expect(meta).toEqual({
      title: 'Fight Club (1999)',
      description: 'Le narrateur...',
      path: '/movie/550/fight-club',
      image: 'https://image.tmdb.org/t/p/w500/p.jpg',
      type: 'video.movie',
      noindex: false,
    });
    expect(movieMeta({ id: 1, title: 'X', overview: '' })).toMatchObject({ title: 'X', image: null, noindex: true });
  });

  it('nomme les mois comme dayjs le faisait', () => {
    for (let m = 0; m < 12; m++) {
      const date = dayjs(new Date(2026, m, 15));
      expect(monthMeta(date.format('YYYY-MM'), '2000-01').label).toBe(date.format('MMMM YYYY'));
    }
  });

  it('donne l accueil comme adresse du mois courant', () => {
    expect(monthMeta('2026-11', '2026-11').path).toBe('/');
    expect(monthMeta('2026-10', '2026-11')).toMatchObject({
      path: '/?mois=2026-10',
      title: 'Films les plus populaires en octobre 2026',
    });
  });
});

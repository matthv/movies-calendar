import { describe, expect, it } from 'vitest';
import { isIndexable, movieSlug, summary } from './format';

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

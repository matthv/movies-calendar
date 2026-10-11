import { describe, expect, it } from 'vitest';
import { summary } from './format';

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

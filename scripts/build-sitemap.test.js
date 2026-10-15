import { describe, expect, it, vi } from 'vitest';
import { monthRange, monthsAround, sitemapPaths, sitemapXml } from './build-sitemap.mjs';
import { mockTmdb } from '../src/test/fixtures';

const TODAY = new Date(2026, 9, 11);

describe('sitemap', () => {
  it('liste les mois autour d aujourd hui, a cheval sur les annees', () => {
    const months = monthsAround(TODAY, 10, 3);
    expect(months[0]).toBe('2025-12');
    expect(months.at(-1)).toBe('2027-01');
    expect(months).toHaveLength(14);
  });

  it('calcule le dernier jour du mois', () => {
    expect(monthRange('2028-02')).toEqual(['2028-02-01', '2028-02-29']);
    expect(monthRange('2026-12')).toEqual(['2026-12-01', '2026-12-31']);
  });

  it('ajoute les films de chaque mois, sans doublon', async () => {
    const fetchSpy = mockTmdb({
      'discover/movie': { results: [
        { id: 1, title: 'Été Indien', overview: 'Un été.' },
        { id: 2, title: 'Autre', overview: 'Un autre.' },
        { id: 3, title: 'Sans synopsis', overview: '' },
      ] },
    });
    const paths = await sitemapPaths({ apiKey: 'k', today: TODAY, delay: 0 });

    expect(paths[0]).toBe('/');
    expect(paths).not.toContain('/?mois=2026-10');
    expect(paths).toContain('/?mois=2026-09');
    expect(paths).toContain('/movie/1/ete-indien');
    expect(paths.filter((path) => path.startsWith('/movie/'))).toHaveLength(2);
    expect(paths).not.toContain('/movie/3/sans-synopsis');
    expect(fetchSpy).toHaveBeenCalledTimes(19);
  });

  it('garde les pages de mois si TMDB echoue', async () => {
    mockTmdb({});
    const warn = vi.fn();
    const paths = await sitemapPaths({ apiKey: 'k', today: TODAY, delay: 0, warn });

    expect(paths).toHaveLength(19);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/HTTP 404/));
  });

  it('produit un XML avec des URLs absolues echappees', () => {
    const xml = sitemapXml(['/', '/?mois=2026-09&x=1']);
    expect(xml).toContain('<loc>https://www.movies-calendar.com/</loc>');
    expect(xml).toContain('<loc>https://www.movies-calendar.com/?mois=2026-09&amp;x=1</loc>');
  });
});

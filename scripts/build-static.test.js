import { describe, expect, it, vi } from 'vitest';
import {
  collectSite, escapeHtml, monthRange, monthsAround, prerenderFiles, renderPage, sitemapPaths, sitemapXml,
} from './build-static.mjs';
import { MOVIE, mockTmdb } from '../src/test/fixtures';

const TODAY = new Date(2026, 9, 11);

const TEMPLATE = `<!doctype html>
<html lang="fr">
  <head>
    <meta name="description" content="Les films les plus populaires, mois par mois, avec The Movie Database.">
    <title>Movies Calendar</title>
    <script type="module" crossorigin src="/assets/index-abc.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

const DISCOVER = [
  { id: 1, title: 'Été Indien', overview: 'Un été.', release_date: '2026-10-02' },
  { id: 550, title: 'Fight Club', overview: 'Le narrateur...', release_date: '1999-10-15' },
  { id: 3, title: 'Sans synopsis', overview: '', release_date: '2026-10-03' },
];

// Only October 2026 has movies
const discover = (params) => ({ results: params.get('primary_release_date.gte') === '2026-10-01' ? DISCOVER : [] });

function mockSite() {
  return mockTmdb({
    'discover/movie': discover,
    'movie/1': { ...DISCOVER[0], credits: { cast: [], crew: [] } },
    'movie/550': MOVIE,
  });
}

describe('mois et sitemap', () => {
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

  it('ajoute les films indexables de chaque mois, sans doublon', async () => {
    const fetchSpy = mockSite();
    const site = await collectSite({ apiKey: 'k', today: TODAY, delay: 0 });
    const paths = sitemapPaths(site);

    expect(paths[0]).toBe('/');
    expect(paths).not.toContain('/?mois=2026-10');
    expect(paths).toContain('/?mois=2026-09');
    expect(paths).toContain('/movie/1/ete-indien');
    expect(paths.filter((path) => path.startsWith('/movie/'))).toEqual(['/movie/1/ete-indien', '/movie/550/fight-club']);
    // 19 months, then the details of the two indexable movies, once each
    expect(fetchSpy).toHaveBeenCalledTimes(21);
  });

  it('garde un film dont le detail echoue, sans le pre-rendre', async () => {
    mockTmdb({ 'discover/movie': discover, 'movie/550': MOVIE });
    const warn = vi.fn();
    const site = await collectSite({ apiKey: 'k', today: TODAY, delay: 0, warn });

    expect(sitemapPaths(site)).toContain('/movie/1/ete-indien');
    expect(Object.keys(prerenderFiles(TEMPLATE, site))).not.toContain('movie/1/ete-indien.html');
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/movie 1: .*HTTP 404/));
  });

  it('garde les pages de mois si TMDB echoue', async () => {
    mockTmdb({});
    const warn = vi.fn();
    const site = await collectSite({ apiKey: 'k', today: TODAY, delay: 0, warn });

    expect(site.complete).toBe(false);
    expect(sitemapPaths(site)).toHaveLength(19);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/HTTP 404/));
  });

  it('produit un XML avec des URLs absolues echappees', () => {
    const xml = sitemapXml(['/', '/?mois=2026-09&x=1']);
    expect(xml).toContain('<loc>https://www.movies-calendar.com/</loc>');
    expect(xml).toContain('<loc>https://www.movies-calendar.com/?mois=2026-09&amp;x=1</loc>');
  });
});

describe('pre-rendu', () => {
  it('echappe le HTML', () => {
    expect(escapeHtml('<b>"Tom & Jerry\'s"</b>')).toBe('&lt;b&gt;&quot;Tom &amp; Jerry&#39;s&quot;&lt;/b&gt;');
  });

  it('remplit le gabarit sans toucher aux bundles', () => {
    const html = renderPage(TEMPLATE, { title: 'A <b>', description: 'Desc', path: '/movie/1/a' }, '<p>x</p>');

    expect(html).toContain('<title>A &lt;b&gt; – Movies Calendar</title>');
    expect(html).toContain('<meta name="description" content="Desc">');
    expect(html).toContain('<link rel="canonical" href="https://www.movies-calendar.com/movie/1/a">');
    expect(html).toContain('<meta property="og:image" content="https://www.movies-calendar.com/logo-big.png">');
    expect(html).toContain('<div id="root"><p>x</p></div>');
    expect(html).toContain('src="/assets/index-abc.js"');
    expect(html.match(/<title>/g)).toHaveLength(1);
  });

  it('refuse un gabarit inattendu', () => {
    expect(() => renderPage('<html></html>', { path: '/' }, '')).toThrow(/not found/);
  });

  it('ecrit une page par film et par mois, et l accueil', async () => {
    mockSite();
    const files = prerenderFiles(TEMPLATE, await collectSite({ apiKey: 'k', today: TODAY, delay: 0 }));

    const fightClub = files['movie/550/fight-club.html'];
    expect(fightClub).toContain('<title>Fight Club (1999) – Movies Calendar</title>');
    expect(fightClub).toContain('<link rel="canonical" href="https://www.movies-calendar.com/movie/550/fight-club">');
    expect(fightClub).toContain('<h1>Fight Club</h1>');
    expect(fightClub).toContain('<p>Le narrateur...</p>');
    expect(fightClub).toContain('<p>David Fincher</p>');
    expect(fightClub).toContain('<li>Edward Norton (Narrator)</li>');
    expect(fightClub).toContain('Sortie en France : 10/11/1999');
    expect(fightClub).toContain('<a href="/?mois=1999-10">Films les plus populaires en octobre 1999</a>');

    expect(files['home.html']).toContain('<link rel="canonical" href="https://www.movies-calendar.com/">');
    expect(files['home.html']).toContain('<h1>Les films les plus populaires en octobre 2026</h1>');
    expect(files['home.html']).toContain('<a href="/movie/1/ete-indien">Été Indien</a> (2026)');
    expect(files['mois/2026-09.html']).toContain('<link rel="canonical" href="https://www.movies-calendar.com/?mois=2026-09">');
    expect(Object.keys(files).filter((file) => file.startsWith('mois/'))).toHaveLength(19);
    expect(Object.keys(files).filter((file) => file.startsWith('movie/'))).toHaveLength(2);
  });
});

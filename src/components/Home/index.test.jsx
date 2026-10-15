import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import Home from '.';
import { GENRES, MOVIES, mockTmdb } from '../../test/fixtures';

function BrowserControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="url">{location.pathname + location.search}</output>
      <button type="button" onClick={() => navigate(-1)}>Précédent navigateur</button>
    </>
  );
}

function renderHome(url = '/') {
  const fetchSpy = mockTmdb({
    'genre/movie/list': { genres: GENRES },
    'discover/movie': { results: MOVIES },
  });
  render(
    <MemoryRouter initialEntries={[url]}>
      <BrowserControls />
      <Home />
    </MemoryRouter>
  );
  const lastDiscoverStart = () => fetchSpy.mock.calls
    .map(([u]) => new URL(u))
    .filter((u) => u.pathname.endsWith('discover/movie'))
    .at(-1).searchParams.get('primary_release_date.gte');
  return { lastDiscoverStart };
}

describe('Home', () => {
  it('affiche le film mis en avant puis recharge au changement de mois', async () => {
    const { lastDiscoverStart } = renderHome();

    expect(await screen.findByText('Premier')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '73%' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Janv.' }));
    expect(await screen.findByRole('heading', { name: /en janvier/ })).toBeInTheDocument();
    expect(lastDiscoverStart()).toMatch(/^\d{4}-01-01$/);
  });

  it('lit le mois depuis l URL', async () => {
    const { lastDiscoverStart } = renderHome('/?mois=2020-03');

    expect(await screen.findByRole('heading', { level: 1, name: 'Les films les plus populaires en mars 2020' })).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(lastDiscoverStart()).toBe('2020-03-01');
    expect(document.title).toBe('Films les plus populaires en mars 2020 – Movies Calendar');
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://www.movies-calendar.com/?mois=2020-03');
  });

  it('ignore un mois invalide dans l URL', async () => {
    renderHome('/?mois=n-importe-quoi');
    expect(await screen.findByText('Premier')).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://www.movies-calendar.com/');
  });

  it('revient au mois et a l annee precedents avec l historique', async () => {
    const { lastDiscoverStart } = renderHome('/?mois=2020-03');
    const url = () => screen.getByLabelText('url').textContent;
    await screen.findByRole('heading', { name: /en mars/ });

    await userEvent.click(screen.getByRole('button', { name: 'Juin' }));
    expect(url()).toBe('/?mois=2020-06');
    await userEvent.click(screen.getByRole('button', { name: 'Année précédente' }));
    expect(url()).toBe('/?mois=2019-01');

    await userEvent.click(screen.getByRole('button', { name: 'Janv.' }));
    expect(url()).toBe('/?mois=2019-01');

    await userEvent.click(screen.getByRole('button', { name: 'Précédent navigateur' }));
    expect(await screen.findByRole('heading', { name: /en juin/ })).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(lastDiscoverStart()).toBe('2020-06-01');

    await userEvent.click(screen.getByRole('button', { name: 'Précédent navigateur' }));
    expect(await screen.findByRole('heading', { name: /en mars/ })).toBeInTheDocument();
    expect(lastDiscoverStart()).toBe('2020-03-01');
  });

  it('charge plus de films jusqu a 49', async () => {
    const page = (n) => Array.from({ length: 20 }, (_, i) => ({
      id: n * 100 + i, title: `Film ${n}-${i}`, overview: '', vote_average: 5, genre_ids: [], poster_path: null, backdrop_path: null,
    }));
    mockTmdb({
      'genre/movie/list': { genres: GENRES },
      // Page 2 repeats a movie of page 1, as TMDB does when popularity moves
      'discover/movie': (params) => {
        const n = Number(params.get('page'));
        const results = page(n);
        if (n === 2) results[0] = page(1)[5];
        return { results, total_pages: 165 };
      },
    });
    render(<MemoryRouter><Home /></MemoryRouter>);

    const cards = () => document.querySelectorAll('.list .card').length;
    expect(await screen.findByRole('link', { name: 'Détail de Film 1-1' })).toBeInTheDocument();
    expect(cards()).toBe(18);

    await userEvent.click(screen.getByRole('button', { name: 'Plus de films' }));
    await screen.findByRole('link', { name: 'Détail de Film 2-1' });
    expect(cards()).toBe(36);

    await userEvent.click(screen.getByRole('button', { name: 'Plus de films' }));
    await screen.findByRole('link', { name: 'Détail de Film 3-1' });
    expect(cards()).toBe(48);
    expect(screen.queryByRole('button', { name: 'Plus de films' })).toBeNull();
  });
});

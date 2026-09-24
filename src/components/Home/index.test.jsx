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

    expect(await screen.findByRole('heading', { name: /en mars/ })).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(lastDiscoverStart()).toBe('2020-03-01');
  });

  it('ignore un mois invalide dans l URL', async () => {
    renderHome('/?mois=n-importe-quoi');
    expect(await screen.findByText('Premier')).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear()))).toBeInTheDocument();
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
});

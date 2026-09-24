import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Home from '.';
import { GENRES, MOVIES, mockTmdb } from '../../test/fixtures';

describe('Home', () => {
  it('affiche le film mis en avant puis recharge au changement de mois', async () => {
    const fetchSpy = mockTmdb({
      'genre/movie/list': { genres: GENRES },
      'discover/movie': { results: MOVIES },
    });
    render(<MemoryRouter><Home /></MemoryRouter>);

    expect(await screen.findByText('Premier')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '73%' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Janv.' }));
    expect(await screen.findByRole('heading', { name: /en janvier/ })).toBeInTheDocument();
    const discover = fetchSpy.mock.calls.map(([url]) => new URL(url)).filter((url) => url.pathname.endsWith('discover/movie'));
    expect(discover.at(-1).searchParams.get('primary_release_date.gte')).toMatch(/^\d{4}-01-01$/);
  });
});

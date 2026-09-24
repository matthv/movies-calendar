import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { AppRoutesContent } from '../../routes';
import { GENRES, MOVIE, MOVIES, mockTmdb } from '../../test/fixtures';

describe('Search', () => {
  it('navigue vers la fiche au clic sur un resultat et ferme la recherche', async () => {
    mockTmdb({
      'genre/movie/list': { genres: GENRES },
      'discover/movie': { results: MOVIES },
      'search/movie': { results: [{ id: 550, title: 'Fight Club', poster_path: null }] },
      'movie/550': MOVIE,
    });
    render(<MemoryRouter><AppRoutesContent /></MemoryRouter>);

    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }));
    await userEvent.type(screen.getByPlaceholderText('Rechercher un film'), 'fight');
    await userEvent.click(await screen.findByRole('link', { name: /Fight Club/ }));

    expect(await screen.findByRole('heading', { name: 'Fight Club', level: 1 })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Rechercher un film')).not.toBeInTheDocument();
  });
});

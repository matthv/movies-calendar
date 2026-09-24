import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import MovieList from './movie_list';
import { GENRES, MOVIES } from '../../test/fixtures';

const renderList = (genres) => render(
  <MemoryRouter><MovieList movies={MOVIES} genres={genres} /></MemoryRouter>
);

describe('MovieList', () => {
  it('ne plante pas si les genres ne sont pas encore charges', () => {
    renderList([]);
    expect(screen.getByText('Deuxième film')).toBeInTheDocument();
  });

  it('ignore un genre inconnu et affiche les autres', () => {
    renderList(GENRES);
    expect(screen.getAllByText('Action')).toHaveLength(1);
    expect(screen.getAllByText('Drame')).toHaveLength(2);
  });

  it('ecarte le premier film (mis en avant) et le dernier', () => {
    renderList(GENRES);
    expect(screen.queryByText('Premier')).not.toBeInTheDocument();
    expect(screen.queryByText('Dernier')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Détail de Deuxième film' })).toHaveAttribute('href', '/movie/2/deuxieme-film');
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import MovieList, { gridMovies } from './movie_list';
import { GENRES, MOVIES } from '../../test/fixtures';

const renderList = (genres) => render(
  <MemoryRouter><MovieList movies={MOVIES} genres={genres} complete /></MemoryRouter>
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

  it('ecarte le premier film, mis en avant', () => {
    renderList(GENRES);
    expect(screen.queryByText('Premier')).not.toBeInTheDocument();
    expect(screen.getByText('Dernier')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Détail de Deuxième film' })).toHaveAttribute('href', '/movie/2/deuxieme-film');
  });

  it('remplit des rangees completes tant que la liste n est pas complete', () => {
    const movies = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    expect(gridMovies(movies, false)).toHaveLength(18);
    expect(gridMovies(movies, true)).toHaveLength(19);
    expect(gridMovies(movies.slice(0, 4), false)).toHaveLength(0);
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Movie from '.';
import { MOVIE, mockTmdb } from '../../test/fixtures';

describe('Movie', () => {
  it('affiche la fiche complete', async () => {
    mockTmdb({ 'movie/550': MOVIE });
    render(<Movie id="550" />);

    expect(await screen.findByRole('heading', { name: 'Fight Club' })).toBeInTheDocument();
    expect(screen.getByText('David Fincher')).toBeInTheDocument();
    expect(screen.getByText('Jim Uhls')).toBeInTheDocument();
    expect(screen.getByText('2h19')).toBeInTheDocument();
    expect(screen.getByText('10/11/1999')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '84%' })).toBeInTheDocument();
    expect(screen.getByText(/63.000.000 \$/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Images' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Regarder la Bande annonce/ })).toBeInTheDocument();

    expect(document.title).toBe('Fight Club (1999) – Movies Calendar');
    expect(document.querySelector('meta[name="description"]').content).toBe('Le narrateur...');
    expect(document.querySelector('link[rel="canonical"]').href).toBe('https://www.movies-calendar.com/movie/550/fight-club');
    expect(document.querySelector('meta[property="og:image"]').content).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
  });
});

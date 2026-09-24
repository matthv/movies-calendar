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
  });
});

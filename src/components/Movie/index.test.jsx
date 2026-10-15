import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import Movie from '.';
import { MOVIE, PERSON, mockTmdb } from '../../test/fixtures';

const PROLIFIC = {
  ...PERSON,
  movie_credits: {
    cast: [
      ...PERSON.movie_credits.cast,
      ...Array.from({ length: 6 }, (_, i) => ({ id: 900 + i, title: `Film ${i}`, release_date: '2010-01-01', vote_count: 1 })),
    ],
  },
};

const BIG_CAST = Array.from({ length: 15 }, (_, i) => ({
  credit_id: `c${i}`, id: 1000 + i, name: `Acteur ${i + 1}`, character: `Role ${i + 1}`, profile_path: null,
}));

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
    expect(document.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('demande de ne pas indexer une fiche sans synopsis', async () => {
    mockTmdb({ 'movie/550': { ...MOVIE, overview: '' } });
    render(<Movie id="550" />);

    expect(await screen.findByRole('heading', { name: 'Fight Club' })).toBeInTheDocument();
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex');
  });

  it('montre 12 acteurs puis tout le casting', async () => {
    mockTmdb({ 'movie/550': { ...MOVIE, credits: { ...MOVIE.credits, cast: BIG_CAST } } });
    render(<Movie id="550" />);

    expect(await screen.findAllByRole('button', { name: /Voir la fiche de/ })).toHaveLength(12);
    await userEvent.click(screen.getByRole('button', { name: 'Voir tout le casting (15)' }));
    expect(screen.getAllByRole('button', { name: /Voir la fiche de/ })).toHaveLength(15);
    expect(screen.queryByRole('button', { name: /Voir tout le casting/ })).toBeNull();
  });

  it('ouvre la fiche d un acteur avec des liens vers ses films', async () => {
    mockTmdb({
      'movie/550': MOVIE,
      'person/819': (params) => (params.get('language') === 'en-US' ? { biography: 'American actor.' } : PROLIFIC),
    });
    render(<MemoryRouter><Movie id="550" /></MemoryRouter>);

    await userEvent.click(await screen.findByRole('button', { name: 'Voir la fiche de Edward Norton' }));
    const dialog = await screen.findByRole('dialog');
    expect(await within(dialog).findByText(/American actor\./)).toBeInTheDocument();
    expect(within(dialog).getByText(/Né\(e\) le 18\/08\/1969 à Boston/)).toBeInTheDocument();
    expect(within(dialog).getAllByRole('link')).toHaveLength(8);
    expect(within(dialog).getByRole('link', { name: /American History X/ })).toHaveAttribute('href', '/movie/700/american-history-x');

    await userEvent.click(within(dialog).getByRole('button', { name: 'Toute la filmographie (10)' }));
    expect(within(dialog).getAllByRole('link')).toHaveLength(10);
  });
});

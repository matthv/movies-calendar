import MovieItem from './movie_item';

// Genres may load after the movies, and ids can be unknown: skip those.
function genreNames(genreIds, genres) {
  return (genreIds || [])
    .map((id) => genres.find((genre) => genre.id === id)?.name)
    .filter(Boolean);
}

export default function MovieList({ movies, genres }) {
  if (movies.length === 0) {
    return <div className="container">Pas de résultats</div>;
  }

  // The first movie is featured by MovieDetail; dropping the last one keeps
  // a full grid of 18 cards.
  return (
    <div className="list">
      <div className="container">
        <div className="row">
          {movies.slice(1, -1).map((movie) => (
            <MovieItem movie={movie} key={movie.id} genres={genreNames(movie.genre_ids, genres)} />
          ))}
        </div>
      </div>
    </div>
  );
}

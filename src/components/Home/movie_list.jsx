import MovieItem from './movie_item';

// Genres may load after the movies, and ids can be unknown: skip those.
function genreNames(genreIds, genres) {
  return (genreIds || [])
    .map((id) => genres.find((genre) => genre.id === id)?.name)
    .filter(Boolean);
}

// The grid has 2 or 3 columns: while more movies can be loaded, show a
// multiple of 6 so every row is full. Once complete, show them all.
export function gridMovies(movies, complete) {
  const rest = movies.slice(1);
  return complete ? rest : rest.slice(0, Math.floor(rest.length / 6) * 6);
}

export default function MovieList({ movies, genres, complete }) {
  if (movies.length === 0) {
    return <div className="container">Pas de résultats</div>;
  }

  // The first movie is featured by MovieDetail
  return (
    <div className="list">
      <div className="container">
        <div className="row">
          {gridMovies(movies, complete).map((movie) => (
            <MovieItem movie={movie} key={movie.id} genres={genreNames(movie.genre_ids, genres)} />
          ))}
        </div>
      </div>
    </div>
  );
}

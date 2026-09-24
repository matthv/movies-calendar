import MovieItem from './movie_item';

// Les genres peuvent arriver apres les films, ou un id peut etre inconnu :
// on ignore simplement ceux qu'on ne trouve pas.
function genreNames(genreIds, genres) {
  return (genreIds || [])
    .map((id) => genres.find((genre) => genre.id === id)?.name)
    .filter(Boolean);
}

export default function MovieList({ movies, genres }) {
  if (movies.length === 0) {
    return <div className="container">Pas de résultats</div>;
  }

  // Le premier film est deja mis en avant par MovieDetail ; le dernier est
  // ecarte pour garder une grille pleine de 18 cartes (3 colonnes).
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

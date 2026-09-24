import { Link } from 'react-router';
import { IMAGE_URL } from '../../api/moviedb';
import { moviePath } from '../../lib/format';

export default function MovieItem({ movie, genres }) {
  const imageUrl = movie.backdrop_path ? `${IMAGE_URL}w500${movie.backdrop_path}` : '/img-default.jpg';

  return (
    <div className="col-md-6 col-lg-4">
      <div className="card mb-3">
        <img className="card-img-top" src={imageUrl} alt={movie.title} loading="lazy" />
        <div className="card-body">
          <div className="card-title title">{movie.title}</div>
          <Link to={moviePath(movie)} className="btn btn-pink" aria-label={`Détail de ${movie.title}`}>
            <i className="fa-solid fa-eye"></i>
          </Link>
        </div>
        <div className="card-footer">
          {genres.map((genre) => (
            <span className="badge" key={genre}>{genre}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

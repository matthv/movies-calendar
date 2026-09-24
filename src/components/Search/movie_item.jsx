import { Link } from 'react-router';
import { IMAGE_URL } from '../../api/moviedb';
import { moviePath } from '../../lib/format';

export default function MovieItem({ movie, onSelect }) {
  const imageUrl = movie.poster_path ? `${IMAGE_URL}w92${movie.poster_path}` : '/poster-default.jpg';

  return (
    <li className="list-group-item">
      <Link to={moviePath(movie)} className="d-flex" onClick={onSelect}>
        <img width="20" className="align-self-center me-3" src={imageUrl} alt={movie.title} />
        <div className="flex-grow-1">
          <h5 className="mt-0">{movie.title}</h5>
        </div>
      </Link>
    </li>
  );
}

import { Link } from 'react-router';
import { IMAGE_URL } from '../../api/moviedb';
import { moviePath } from '../../lib/format';
import Average from '../Average';

export default function MovieDetail({ movie }) {
  if (!movie) {
    return <div className="container">Chargement…</div>;
  }
  const imageUrl = movie.poster_path ? `${IMAGE_URL}w300${movie.poster_path}` : '/poster-default.jpg';
  const backgroundUrl = movie.backdrop_path ? `${IMAGE_URL}w1280${movie.backdrop_path}` : '/img-default.jpg';

  return (
    <div className="movie-detail">
      <img className="img-background" src={backgroundUrl} alt="" />
      <div className="filter"></div>
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="media d-flex">
              <img className="align-self-start me-3" src={imageUrl} alt={movie.title} />
              <div className="media-body flex-grow-1">
                <div className="mt-2 title">{movie.title}</div>
                <p className="description">{movie.overview}</p>
                {movie.vote_average ? (
                  <div className="average float-start">
                    <div className="bg-circle">
                      <Average percentage={movie.vote_average * 10} strokeWidth={5} />
                    </div>
                    Note des utilisateurs
                  </div>
                ) : null}
                <div className="float-md-end">
                  <Link to={moviePath(movie)} className="btn btn-pink">
                    <i className="fa-solid fa-eye"></i> Détail du film
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

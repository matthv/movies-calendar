import { useEffect, useState } from 'react';
import dayjs from '../../lib/dayjs';
import { capitalize } from '../../lib/format';
import { fetchGenres, fetchMoviesOfMonth } from '../../api/moviedb';
import MovieList from './movie_list';
import MovieDetail from './movie_detail';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);

export default function Home() {
  // dayjs est immuable : chaque changement produit une nouvelle date
  const [currentDate, setCurrentDate] = useState(() => dayjs().startOf('month'));
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchGenres(controller.signal)
      .then(setGenres)
      .catch((error) => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const start = currentDate.startOf('month').format('YYYY-MM-DD');
    const end = currentDate.endOf('month').format('YYYY-MM-DD');
    fetchMoviesOfMonth(start, end, controller.signal)
      .then(setMovies)
      .catch((error) => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, [currentDate]);

  const changeYear = (delta) => setCurrentDate(currentDate.add(delta, 'year').month(0));

  return (
    <div className="Home">
      <div className="container">
        <div className="row select-year">
          <div className="col-sm-12">
            <i className="fa-solid fa-chevron-left" role="button" aria-label="Année précédente" onClick={() => changeYear(-1)}></i>
            <span>{currentDate.format('YYYY')}</span>
            <i className="fa-solid fa-chevron-right" role="button" aria-label="Année suivante" onClick={() => changeYear(1)}></i>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="btn-group select-month" role="group">
              {MONTHS.map((month) => (
                <button key={month}
                        type="button"
                        className={`btn ${currentDate.month() === month ? 'btn-on' : 'btn-off'}`}
                        onClick={() => setCurrentDate(currentDate.month(month))}>
                  {capitalize(dayjs().month(month).format('MMM'))}
                </button>
              ))}
            </div>
          </div>
          <div className="col-sm-12">
            <h2>Les plus populaires en {currentDate.format('MMMM')}</h2>
          </div>
        </div>
      </div>
      <MovieDetail movie={movies[0]} />
      <MovieList movies={movies} genres={genres} />
    </div>
  );
}

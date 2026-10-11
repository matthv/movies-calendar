import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import dayjs from '../../lib/dayjs';
import { capitalize } from '../../lib/format';
import { fetchGenres, fetchMoviesOfMonth } from '../../api/moviedb';
import { usePageMeta } from '../../lib/page_meta';
import MovieList from './movie_list';
import MovieDetail from './movie_detail';

const MONTHS = Array.from({ length: 12 }, (_, i) => i);
const PARAM = 'mois';
const PARAM_FORMAT = 'YYYY-MM';

function parseMonth(value) {
  const date = value ? dayjs(value, PARAM_FORMAT, true) : null;
  return date?.isValid() ? date.startOf('month') : dayjs().startOf('month');
}

export default function Home() {
  // The month lives in the URL so the browser back/forward buttons work.
  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam = searchParams.get(PARAM);
  const currentDate = useMemo(() => parseMonth(monthParam), [monthParam]);
  const setCurrentDate = (date) => {
    if (!date.isSame(currentDate, 'month')) setSearchParams({ [PARAM]: date.format(PARAM_FORMAT) });
  };
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

  const monthLabel = currentDate.format('MMMM YYYY');
  usePageMeta({
    title: `Films les plus populaires en ${monthLabel}`,
    description: `Les films les plus populaires sortis en ${monthLabel} : affiches, notes et bandes-annonces, avec The Movie Database.`,
    path: currentDate.isSame(dayjs(), 'month') ? '/' : `/?${PARAM}=${currentDate.format(PARAM_FORMAT)}`,
  });

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
            <h1 className="h2 month-title">Les films les plus populaires en {monthLabel}</h1>
          </div>
        </div>
      </div>
      <MovieDetail movie={movies[0]} />
      <MovieList movies={movies} genres={genres} />
    </div>
  );
}

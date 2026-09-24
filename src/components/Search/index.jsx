import { useEffect, useRef, useState } from 'react';
import { searchMovies } from '../../api/moviedb';
import MovieItem from './movie_item';

const DEBOUNCE_MS = 300;

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const input = useRef(null);

  useEffect(() => {
    if (isOpen) input.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!term.trim()) {
      setMovies([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchMovies(term, controller.signal)
        .then(setMovies)
        .catch((error) => { if (error.name !== 'AbortError') console.error(error); });
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [term]);

  const close = () => setIsOpen(false);

  return (
    <div>
      <button type="button" className="btn btn-search" aria-label="Rechercher" onClick={() => setIsOpen(!isOpen)}>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
      </button>
      {isOpen && (
        <div className="main-search">
          <div className="container">
            <div className="row">
              <div className="col-sm-12 mt-4">
                <div className="float-end">
                  <button type="button" className="btn btn-close-search" aria-label="Fermer" onClick={close}>
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
              <div className="col-sm-8 offset-sm-2">
                <form className="search-form" onSubmit={(event) => event.preventDefault()}>
                  <input ref={input}
                         type="text"
                         className="search"
                         name="search"
                         placeholder="Rechercher un film"
                         value={term}
                         onChange={(event) => setTerm(event.target.value)}
                  />
                </form>
                <div className="row">
                  <div className="col-sm-12">
                    <div className="card">
                      <ul className="list-group list-group-flush">
                        {movies.map((movie) => (
                          <MovieItem movie={movie} key={movie.id} onSelect={close} />
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Link } from 'react-router';
import { fetchPerson, IMAGE_URL } from '../../api/moviedb';
import { formatDate, personAge } from '../../lib/dates';
import { filmography, knownFor, moviePath } from '../../lib/format';

function Film({ film, onSelect }) {
  const poster = film.poster_path ? `${IMAGE_URL}w185${film.poster_path}` : '/poster-default.jpg';
  return (
    <Link className="film" to={moviePath(film)} onClick={onSelect}>
      <img src={poster} alt="" loading="lazy" />
      <span className="title">{film.title}</span>
      <span className="year">{film.release_date?.slice(0, 4) || 'Date inconnue'}</span>
      {film.character && <span className="role">{film.character}</span>}
    </Link>
  );
}

function Lifespan({ person }) {
  const age = personAge(person.birthday, person.deathday);
  if (!person.birthday) return null;
  return (
    <p className="lifespan">
      Né(e) le {formatDate(person.birthday)}
      {person.place_of_birth && ` à ${person.place_of_birth}`}
      {person.deathday ? `, décédé(e) le ${formatDate(person.deathday)} (${age} ans)` : ` (${age} ans)`}
    </p>
  );
}

function PersonBody({ person, onHide }) {
  const [showAll, setShowAll] = useState(false);
  const all = filmography(person.movie_credits);
  const films = showAll ? all : knownFor(person.movie_credits);
  const photo = person.profile_path ? `${IMAGE_URL}w185${person.profile_path}` : '/character-default.jpg';

  return (
    <>
      <div className="person-header">
        <img src={photo} alt={person.name} />
        <div>
          <Lifespan person={person} />
          {person.biography && (
            <p className="biography">
              {person.biography}
              {person.biographyLanguage === 'en' && <em> (en anglais)</em>}
            </p>
          )}
        </div>
      </div>
      {all.length > 0 && (
        <>
          <h3>{showAll ? 'Filmographie' : 'Films les plus connus'}</h3>
          <div className="filmography">
            {films.map((film) => <Film key={film.id} film={film} onSelect={onHide} />)}
          </div>
          {films.length < all.length && (
            <button type="button" className="btn btn-pink mt-3" onClick={() => setShowAll(true)}>
              Toute la filmographie ({all.length})
            </button>
          )}
        </>
      )}
    </>
  );
}

export default function PersonModal({ personId, onHide }) {
  const [state, setState] = useState({ id: null, person: null, error: false });

  useEffect(() => {
    if (!personId) return undefined;
    const controller = new AbortController();
    fetchPerson(personId, controller.signal)
      .then((person) => setState({ id: personId, person, error: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ id: personId, person: null, error: true });
      });
    return () => controller.abort();
  }, [personId]);

  const current = state.id === personId ? state : { person: null, error: false };

  return (
    <Modal show={Boolean(personId)} onHide={onHide} size="lg" scrollable className="person-modal">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>{current.person?.name || (current.error ? 'Fiche indisponible' : 'Chargement…')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {current.error && <p>Impossible de charger cette fiche pour le moment.</p>}
        {current.person && <PersonBody key={personId} person={current.person} onHide={onHide} />}
      </Modal.Body>
    </Modal>
  );
}

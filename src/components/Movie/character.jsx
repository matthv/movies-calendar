import { IMAGE_URL } from '../../api/moviedb';

export default function Character({ character, onSelect }) {
  const imageUrl = character.profile_path
    ? `${IMAGE_URL}w185${character.profile_path}`
    : '/character-default.jpg';

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <button type="button"
              className="card character"
              aria-label={`Voir la fiche de ${character.name}`}
              onClick={() => onSelect(character.id)}>
        <img className="card-img-top" src={imageUrl} alt="" loading="lazy" />
        <span className="card-text name">{character.name}</span>
        <span className="card-text role">{character.character}</span>
      </button>
    </div>
  );
}

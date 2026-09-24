import { IMAGE_URL } from '../../api/moviedb';

export default function Character({ character }) {
  const imageUrl = character.profile_path
    ? `${IMAGE_URL}w300${character.profile_path}`
    : '/character-default.jpg';

  return (
    <div className="col-sm-12 col-md-6">
      <div className="card character p-4">
        <img className="card-img-top" src={imageUrl} alt={character.name} loading="lazy" />
        <p className="card-text mt-4">
          <strong>{character.name}</strong>
        </p>
        <p className="card-text">{character.character}</p>
      </div>
    </div>
  );
}

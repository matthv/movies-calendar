import { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import dayjs from '../../lib/dayjs';
import { formatNumber } from '../../lib/format';
import { fetchMovie, IMAGE_URL } from '../../api/moviedb';
import Average from '../Average';
import Character from './character';
import Trailer from './trailer';
import LightboxImages from './lightbox_images';

const WRITER_JOBS = ['Screenplay', 'Writer', 'Story'];

const BACKGROUND_VIDEO_OPTS = {
  width: '100%',
  height: '500',
  playerVars: { autoplay: 1, fs: 1, loop: 1, controls: 0, disablekb: 1, rel: 0 },
};

const formatDate = (date) => (date ? dayjs(date, 'YYYY-MM-DD').format('DD/MM/YYYY') : null);

function formatRuntime(minutes) {
  if (!minutes) return null;
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
}

function toSlides(images, size) {
  return (images || []).map((image) => ({
    thumb: `${IMAGE_URL}w300${image.file_path}`,
    img: `${IMAGE_URL}${size}${image.file_path}`,
  }));
}

function Names({ items }) {
  return items.map((item) => <div key={item.credit_id || item.id || item.name}>{item.name}</div>);
}

export default function Movie({ id }) {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    fetchMovie(id, controller.signal)
      .then(setMovie)
      .catch((error) => { if (error.name !== 'AbortError') console.error(error); });
    return () => controller.abort();
  }, [id]);

  if (!movie) {
    return <div className="movie container">Chargement…</div>;
  }

  const crew = movie.credits?.crew || [];
  const cast = (movie.credits?.cast || []).slice(0, 6);
  const videos = movie.videos?.results || [];
  const mainVideo = videos[0]?.key;
  const releaseFr = movie.releases?.countries?.find((country) => country.iso_3166_1 === 'FR');
  const keywords = movie.keywords?.keywords || [];
  const genres = movie.genres || [];
  const companies = movie.production_companies || [];
  const directors = crew.filter((person) => person.job === 'Director');
  // The same person can be credited for both Screenplay and Story
  const writers = crew
    .filter((person) => WRITER_JOBS.includes(person.job))
    .filter((person, i, all) => all.findIndex((other) => other.id === person.id) === i);
  const posters = toSlides(movie.images?.posters, 'w780');
  const photos = toSlides(movie.images?.backdrops, 'w1280');
  const imageUrl = movie.poster_path ? `${IMAGE_URL}w300${movie.poster_path}` : '/poster-default.jpg';

  return (
    <div className="movie">
      <div className="movie-detail">
        <div className="video-background">
          {mainVideo && (
            <YouTube id="main-video"
                     videoId={mainVideo}
                     opts={BACKGROUND_VIDEO_OPTS}
                     onReady={(event) => event.target.mute()}
                     onEnd={(event) => event.target.playVideo()} />
          )}
        </div>
        <div className="filter"></div>
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="media d-flex">
                <img className="align-self-start me-3" src={imageUrl} alt={movie.title} />
                <div className="media-body flex-grow-1">
                  <h1 className="mt-2">{movie.title}</h1>
                  <div className="movie-resume">
                    <div className="row">
                      <div className="col-sm-4 mb-4">
                        <label>Titre original</label>
                        {movie.original_title}
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Réalisation</label>
                        <Names items={directors} />
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Scénario</label>
                        <Names items={writers} />
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Durée</label>
                        {formatRuntime(movie.runtime)}
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Pays d'origine</label>
                        {movie.production_countries?.[0]?.name}
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Date de sortie</label>
                        {formatDate(movie.release_date)}
                      </div>
                      <div className="col-sm-4 mb-4">
                        <label>Date de sortie en France</label>
                        {formatDate(releaseFr?.release_date)}
                      </div>
                    </div>
                    <Trailer videoId={mainVideo} name="Regarder la Bande annonce" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="movie-numbers">
        <div className="container">
          <div className="row text-center">
            <div className="col-sm-4">
              <label>Note des utilisateurs</label>
              <div className="small-average">
                <Average percentage={movie.vote_average * 10} />
              </div>
            </div>
            <div className="col-sm-4">
              <label>Budget</label>
              {`${formatNumber(movie.budget)} $`}
            </div>
            <div className="col-sm-4">
              <label>Recettes</label>
              {`${formatNumber(movie.revenue)} $`}
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-sm-12 col-md-9">
            {movie.overview && <h2>Synopsis</h2>}
            <p>{movie.overview}</p>
            {cast.length > 0 && <h2>Casting</h2>}
            <div className="row">
              {cast.map((character) => (
                <Character character={character} key={character.credit_id} />
              ))}
            </div>
            <div className="row">
              <div className="col-sm-12">
                {(posters.length > 0 || photos.length > 0) && <h2>Images</h2>}
                {posters.length > 0 && (
                  <div className="images">
                    <h3>Affiches</h3>
                    <LightboxImages images={posters} />
                  </div>
                )}
                {photos.length > 0 && (
                  <div className="photos mt-3">
                    <h3>Photos</h3>
                    <LightboxImages images={photos} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-3 sidebar">
            {companies.length > 0 && <label>Sociétés de production</label>}
            <Names items={companies} />
            {genres.length > 0 && <label>Genres</label>}
            <Names items={genres} />
            {videos.length > 0 && <label>Toutes les videos</label>}
            <div className="videos">
              {videos.slice(0, 5).map((video) => (
                <YouTube key={video.key} videoId={video.key} opts={{ width: '100%' }} />
              ))}
            </div>
            {keywords.length > 0 && <label>Mots clés</label>}
            <Names items={keywords} />
          </div>
        </div>
      </div>
    </div>
  );
}

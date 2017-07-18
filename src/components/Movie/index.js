import React, { Component } from 'react';
import MoviesDB from '../../actions/moviedb-api';
import _ from 'lodash';
import moment from 'moment';
import humanize from 'humanize-number';
import YouTube from 'react-youtube';
import CircularProgressbar from 'react-circular-progressbar';
import Character from './character';
import Trailer from './trailer';
import LightboxImages from './lightbox_images';

const base_url_image =  'https://image.tmdb.org/t/p/';

class Movie extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: null,
      original_title: null,
      vote_average: null,
      overview: null,
      budget: 0,
      revenue: 0,
      runtime: 0,
      genres: [],
      average: 0,
      poster: null,
      backdrop: null,
      original_country: null,
      production_companies: [],
      release: null,
      release_fr: null,
      cast: [],
      crew: [],
      videos: [],
      main_video: null,
      images: [],
      keywords: []
    }
    this.movieDetail();
    window.scrollTo(0, 0);
  }

  movieDetail(){
    MoviesDB('MOVIE-DETAIL', {id: this.props.match.params.id, full_response: 'credits,releases,images,videos,keywords'}, (movie) => {
      let release_fr = _.find(movie.releases.countries, { iso_3166_1: 'FR' });
      this.setState({
        title: movie.title,
        original_title: movie.original_title,
        original_country: movie.production_countries.length ? movie.production_countries[0].name : null,
        vote_average: movie.vote_average,
        overview: movie.overview,
        budget: humanize(movie.budget, { delimiter: ' '}),
        revenue: humanize(movie.revenue, { delimiter: ' '}),
        runtime: movie.runtime ? moment().startOf('day').minutes(movie.runtime).format('H[h]mm') : null,
        genres: movie.genres,
        production_companies: movie.production_companies,
        release: movie.release_date ? moment(movie.release_date, 'YYYY-MM-DD').format('DD/MM/YYYY') : null,
        average: movie.vote_average,
        poster: movie.poster_path,
        backdrop: movie.backdrop_path,
        videos: movie.videos.results,
        main_video: movie.videos.results[0] ? movie.videos.results[0].key : null,
        images: movie.images,
        release_fr: release_fr ? moment(release_fr.release_date, 'YYYY-MM-DD').format('DD/MM/YYYY') : null,
        cast: movie.credits.cast,
        crew: movie.credits.crew,
        keywords: movie.keywords.keywords
      });
    })
  }

  renderVideo(key){
    let opts = {
      width: '100%',
      height: '500',
      playerVars: {
        autoplay: 1,
        fs: 1,
        loop: 1,
        controls: 0,
        disablekb: 1,
        showinfo: 0,
        rel: 0
      }
    };

    return (
      <YouTube
        id="main-video"
        videoId={key}
        opts={opts}
        onReady={this._onReady}
        onEnd={this._onEnd}
      />
    );
  }

  _onReady(event) {
    event.target.mute();
  }

  _onEnd(event) {
    event.target.playVideo();
  }

  renderProductionCompanies() {
    return this.state.production_companies.map((company, index) => {
      return (
        company ? <div key={index}>{company.name}</div> : ''
      )
    });
  }

  renderGenres() {
    return this.state.genres.map((genre, index) => {
      return (
        genre ? <div key={index}>{genre.name}</div> : ''
      )
    });
  }

  renderKeywords() {
    return this.state.keywords.map((keyword, index) => {
      return (
        keyword ?<div key={index}>{keyword.name}</div> : ''
      )
    });
  }

  renderCrew(job){
    return _.filter(this.state.crew, { 'job': job }).map((job) => {
      return (
        job ? <div key={job.credit_id}>{job.name}</div> : ''
      )
    })
  }

  renderCast() {
    return this.state.cast.map((character, index) => {
      return (index < 6) ?
        <Character character={character} key={character.cast_id} />
        : ''
    })
  }

  renderAverage() {
    return (
      <div className="small-average">
        <CircularProgressbar
          percentage={this.state.vote_average*10}
          strokeWidth="7"
          initialAnimation={true}
        />
      </div>
    )
  }

  renderTrailers() {
    const size = {width: '100%'};
    return this.state.videos.map((video, index) => {
      return (index < 5) ?
        <YouTube key={index} videoId={video.key} opts={size} />
        : '';
    })
  }

  renderImages() {
    let images = [];
    if(this.state.images.posters){
      this.state.images.posters.map((image) => {
        return images.push({
          thumb: `${base_url_image}w300${image.file_path}`,
          img: `${base_url_image}w780${image.file_path}`
        });
      });
      return (
        <div>
          {images.length ? <h3>Affiches</h3> : ''}
          <LightboxImages images={images} />
        </div>
      )
    }
  }

  renderPhotos() {
    let images = [];
    if(this.state.images.backdrops){
      this.state.images.backdrops.map((image) => {
        return images.push({
          thumb: `${base_url_image}w300${image.file_path}`,
          img: `${base_url_image}w1280${image.file_path}`
        });
      });
      return (
        <div>
          {images.length ? <h3>Photos</h3> : ''}
          <LightboxImages images={images} />
        </div>
      )
    }
  }

  render() {
    let image_url = this.state.poster ? `${base_url_image}w300${this.state.poster}` : `${process.env.PUBLIC_URL}/poster-default.jpg`;

    return (
      <div className="movie">
        <div className="movie-detail">
          <div className="video-background">
            {this.state.main_video ? this.renderVideo(this.state.main_video) : '' }
          </div>
          <div className="filter"></div>
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <div className="media">
                  <img className="d-flex align-self-start mr-3" src={image_url} alt={this.state.title} />
                  <div className="media-body">
                    <h1 className="mt-2">{this.state.title}</h1>
                    <div className="movie-resume">
                      <div className="row">
                        <div className="col-sm-4 mb-4">
                          <label>Titre original</label>
                          {this.state.original_title}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Réalisation</label>
                          {this.renderCrew('Director')}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Scénario</label>
                          {this.renderCrew('Story')}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Durée</label>
                          {this.state.runtime}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Pays d'origine</label>
                          {this.state.original_country}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Date de sortie</label>
                          {this.state.release}
                        </div>
                        <div className="col-sm-4 mb-4">
                          <label>Date de sortie en France</label>
                          {this.state.release_fr}
                        </div>
                      </div>
                      <Trailer video_id={this.state.main_video} name="Regarder la Bande annonce" />
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
                {this.renderAverage()}
              </div>
              <div className="col-sm-4">
                <label>Budget</label>
                {`${this.state.budget} $`}
              </div>
              <div className="col-sm-4">
                <label>Recettes</label>
                {`${this.state.revenue} $`}
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-sm-9">
              {this.state.overview ? <h2>Synopsis</h2> : ''}
              <p>{this.state.overview}</p>
              {this.state.cast.length ? <h2>Casting</h2> : '' }
              <div className="row">
                {this.renderCast()}
              </div>
              <div className="row">
                <div className="col-sm-12">
                  {this.state.images.length ? <h2>Images</h2> : '' }
                  <div className="images">
                    {this.renderImages()}
                  </div>
                  <div className="photos mt-3">
                    {this.renderPhotos()}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-sm-3 sidebar">
              {this.state.production_companies.length ? <label>Sociétés de production</label> : '' }
              {this.renderProductionCompanies()}
              {this.state.genres.length ? <label>Genres</label> : '' }
              {this.renderGenres()}
              {this.state.videos.length ? <label>Toutes les videos</label> : '' }
              <div className="videos">
                {this.renderTrailers()}
              </div>
              {this.state.keywords.length ? <label>Mots clés</label> : '' }
              {this.renderKeywords()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Movie;
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CircularProgressbar from 'react-circular-progressbar';
import slugify from 'slugify';

const base_url_image =  'https://image.tmdb.org/t/p/';

class MovieDetail extends Component {
  renderAverage() {
    let percentage = this.props.movie.vote_average*10;
    return (
      <div className="average float-left">
        <div className="bg-circle">
          <CircularProgressbar
            percentage={percentage}
            strokeWidth="5"
            initialAnimation={true}
          />
        </div>
        Note des utilisateurs
      </div>
    )
  }

  render() {
    if(!this.props.movie) {
      return (<div>Loading...</div>);
    }
    let movie = this.props.movie;
    let image_url = movie.poster_path ? `${base_url_image}w300${movie.poster_path}` : 'poster-default.jpg';
    let background_url = movie.backdrop_path ? `${base_url_image}w1280${movie.backdrop_path}` : 'img-default.jpg';
    let slug = slugify(movie.title.toLowerCase()) ? slugify(movie.title.toLowerCase()) : 'detail';

    return (
      <div className="movie-detail">
        <img className="img-background" src={background_url} alt={movie.title} />
        <div className="filter"></div>
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="media">
                <img className="d-flex align-self-start mr-3" src={image_url} alt={movie.title} />
                  <div className="media-body">
                    <div className="mt-2 title">{movie.title}</div>
                    <p className="description">{movie.overview}</p>
                    {movie.vote_average ? this.renderAverage() : '' }
                    <div className="float-right">
                      <Link to={`movie/${movie.id}/${slug}`} className="btn btn-pink">
                        <i className="fa fa-eye"></i> Détail du film
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
}

export default MovieDetail;
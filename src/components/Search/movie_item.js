import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import PropTypes from 'prop-types';

class MovieItem extends Component {

  static contextTypes = {
    router: PropTypes.object
  }

  handleOnClick(event) {
    event.preventDefault();
    this.context.router.history.push(event.target.parentElement.parentElement.getAttribute('href'));
  }

  render() {
    if(this.props.movie) {
      let movie = this.props.movie;
      let image_url = movie.poster_path ? `https://image.tmdb.org/t/p/w92/${movie.poster_path}` : `${process.env.PUBLIC_URL}/poster-default.jpg`;
      let slug = slugify(movie.title.toLowerCase()) ? slugify(movie.title.toLowerCase()) : 'detail';

      return (
        <li className="list-group-item">
          <Link to={`/movie/${movie.id}/${slug}`} className="media" onClick={() => this.handleOnClick()}>
            <img width="20" className="d-flex align-self-center mr-3" src={image_url} alt={movie.title} />
            <div className="media-body">
              <h5 className="mt-0">{movie.title}</h5>
            </div>
          </Link>
        </li>
      );
    }
  }
}

export default MovieItem;
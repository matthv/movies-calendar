import React, { Component } from 'react';
import MovieItem from './movie_item';
import _ from 'lodash';

class MovieList extends Component {

  movieGenres(genreIds) {
    let genres = [];
    genreIds.map((genre) => {
      return genres.push(_.find(this.props.genres, { id: genre }).name);
    });
    return genres;
  }

  render() {
    if(this.props.movies.length === 0) {
      return (<div>Pas de résultats</div>);
    }

    return (
      <div className="list">
        <div className="container">
          <div className="row">
            {
              this.props.movies.map((movie, index) => {
                return (index > 0 && index < this.props.movies.length - 1) ? <MovieItem movie={movie} key={movie.id} genres={this.movieGenres(movie.genre_ids)} /> : ''
              })
            }
          </div>
        </div>
      </div>
    );
  }
}

export default MovieList;
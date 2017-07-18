import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardImg, CardBlock, CardTitle, CardFooter } from 'reactstrap';
import slugify from 'slugify';

class MovieItem extends Component {
  render() {
    if(!this.props.movie) {
      return (<div>Loading...</div>);
    }
    let movie = this.props.movie;
    let image_url = movie.backdrop_path ? `https://image.tmdb.org/t/p/w500/${movie.backdrop_path}` : 'img-default.jpg';
    let slug = slugify(movie.title.toLowerCase()) ? slugify(movie.title.toLowerCase()) : 'detail';

    return (
      <div className="col-sm-4">
        <Card className="mb-3">
          <CardImg top src={image_url} alt={movie.title} />
          <CardBlock>
            <CardTitle className="title">{movie.title}</CardTitle>
            <Link to={`movie/${movie.id}/${slug}`} className="btn btn-pink">
              <i className="fa fa-eye"></i>
            </Link>
          </CardBlock>
          <CardFooter>
            {
              this.props.genres.map((genre, index) => {
                return <span className="badge badge-primary" key={index}>{genre}</span>
              })
            }
          </CardFooter>
        </Card>
      </div>
    );
  }
}

export default MovieItem;
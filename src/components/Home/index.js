import React, { Component } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import capitalize from 'capitalize';
import moment from 'moment';
import 'moment/locale/fr';
import MovieList from './movie_list';
import MovieDetail from './movie_detail';
import MoviesDB from '../../actions/moviedb-api';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current_date: moment().startOf('month'),
      movies: [],
      genres: [],
      selectedMovie: null
    }
    this.moviesGenres();
    this.moviesList();
  }

  goToBack() {
    this.setState({
      current_date: this.state.current_date.subtract(1, 'year').month(0)
    });
    this.moviesList();
  }

  goToNext() {
    this.setState({
      current_date: this.state.current_date.add(1, 'year').month(0)
    });
    this.moviesList();
  }

  showMonth(month) {
    this.setState({
      current_date: this.state.current_date.month(month)
    });
    this.moviesList();
  }

  moviesGenres(){
    MoviesDB('GENRES', {}, (list) => {
      this.setState({
        genres: list.genres
      });
    })
  }

  moviesList() {
    let start_date = this.state.current_date.startOf('month').format('YYYY-MM-DD');
    let end_date = this.state.current_date.endOf('month').format('YYYY-MM-DD');
    MoviesDB('LIST',{start_date: start_date, end_date: end_date}, (movies) => {
      this.setState({
        movies: movies.results,
        selectedMovie: movies.results[0]
      });
    })
  }

  renderBtn(i) {
    return (
      <Button key={i}
              color={this.state.current_date.month() === i ? 'on': 'off'}
              onClick={() => this.showMonth(i)}>
              {capitalize(moment().month(i).format('MMM'))}
      </Button>
    );
  }

  render() {
    var buttons = [];
    for (var i=0; i < 12; i++) {
      buttons.push(this.renderBtn(i));
    }

    return (
      <div className="Home">
        <div className="container">
          <div className="row select-year">
            <div className="col-sm-12">
              <i className="fa fa-chevron-left" aria-hidden="true" onClick={() => this.goToBack()}></i>
              <span>{this.state.current_date.format('YYYY')}</span>
              <i className="fa fa-chevron-right" aria-hidden="true" onClick={() => this.goToNext()}></i>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <ButtonGroup className="select-month">
                {buttons}
              </ButtonGroup>
            </div>
            <div className="col-sm-12">
              <h2>Les plus populaires en {this.state.current_date.format('MMMM')}</h2>
            </div>
          </div>
        </div>
        <MovieDetail movie={this.state.selectedMovie} />
        <MovieList movies={this.state.movies} genres={this.state.genres} />
      </div>
    );
  }
}

export default Home;

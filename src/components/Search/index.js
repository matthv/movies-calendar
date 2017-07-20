import React, { Component } from 'react';
import { Button, Form } from 'reactstrap';
import MoviesDB from '../../actions/moviedb-api';
import MovieItem from './movie_item';
import _ from 'lodash';

class Search extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.focus = this.focus.bind(this);
    this.movieSearch = _.debounce(this.movieSearch, 300);
    this.state = {
      isOpen: false,
      term: '',
      movies: [],
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  componentDidUpdate() {
    if(this.state.isOpen) this.focus();
  }

  focus() {
    this.search.focus();
  }

  onInputChange(term) {
    this.setState({term});
    this.movieSearch();
  }

  movieSearch(){
    MoviesDB('SEARCH', {query: this.state.term}, (movies) => {
      this.setState({
        movies: movies.results
      });
    })
  }

  render() {
    return (
      <div>
        <Button color="search" onClick={this.toggle}>
          <i className="fa fa-search" aria-hidden="true"></i>
        </Button>
        {
          this.state.isOpen ?
            <div className="main-search">
              <div className="container">
                <div className="row">
                  <div className="col-sm-12 mt-4">
                    <div className="float-right">
                      <Button color="close">
                        <i className="fa fa-times" aria-hidden="true" onClick={this.toggle}></i>
                      </Button>
                    </div>
                  </div>
                  <div className="col-sm-8 offset-sm-2">
                    <Form inline>
                      <input ref={(input) => { this.search = input; }}
                             type="text"
                             className="search"
                             name="search"
                             placeholder="Rechercher un film"
                             value={this.state.term}
                             onChange={event => this.onInputChange(event.target.value)}
                      />
                    </Form>
                    <div className="row">
                      <div className="col-sm-12">
                        <div className="card">
                          <ul className="list-group list-group-flush">
                            {
                              this.state.movies.map((movie) => {
                                return <MovieItem
                                  movie={movie}
                                  key={movie.id}
                                />
                              })
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            : ''
        }
      </div>
    );
  }
}

export default Search;
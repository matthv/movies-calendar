import React, { Component } from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem } from 'reactstrap';
import Search from '../Search/index';

class Layout extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <main>
        <Navbar className="header" toggleable>
          <div className="container">
            <NavbarToggler right onClick={this.toggle} />
            <NavbarBrand href="/">
              <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            </NavbarBrand>
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <Search />
                </NavItem>
              </Nav>
            </Collapse>
          </div>
        </Navbar>
        <div className="components">
          { this.props.children }
        </div>
        <footer>
          <div className="container">
            <div className="row">
              <div className="col-sm-4">
                Movies Calender - Developed by <a href="http://www.matthieuvideaud.fr" title="site Matthieu Videaud">Matthieu Videaud</a>
              </div>
              <div className="col-sm-4 text-center">
                <a href="https://github.com/matthv/movies-calendar" title="View Github Repo">
                  <i className="fa fa-github" aria-hidden="true"></i>View Code
                </a>
              </div>
              <div className="col-sm-4 text-right">
                Powered with
                <a href="https://github.com/facebookincubator/create-react-app" rel="noopener noreferrer" title="Create React App" target="_blank">
                  <img width="50" src={`${process.env.PUBLIC_URL}/create-react-app.svg`} alt="Create React App" />
                </a>
                <a href="https://www.themoviedb.org/" rel="noopener noreferrer" title="The Movie DB" target="_blank">
                  <img width="100" src={`${process.env.PUBLIC_URL}/the-movie-db.svg`} alt="The Movie DB" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main >
    );
  }
}

export default Layout;
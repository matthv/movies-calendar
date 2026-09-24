import { Link } from 'react-router';
import Search from '../Search';

export default function Layout({ children }) {
  return (
    <main>
      <nav className="navbar header navbar-expand">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/logo.png" alt="Movies Calendar" />
          </Link>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Search />
            </li>
          </ul>
        </div>
      </nav>
      <div className="components">
        {children}
      </div>
      <footer>
        <div className="container">
          <div className="row">
            <div className="col-sm-4">
              Movies Calendar - Developed by <a href="https://www.matthieuvideaud.fr" title="site Matthieu Videaud">Matthieu Videaud</a>
            </div>
            <div className="col-sm-4 text-center">
              <a href="https://github.com/matthv/movies-calendar" title="View Github Repo">
                <i className="fa-brands fa-github" aria-hidden="true"></i>View Code
              </a>
            </div>
            <div className="col-sm-4 text-end">
              Powered by
              <a href="https://www.themoviedb.org/" rel="noopener noreferrer" title="The Movie DB" target="_blank">
                <img width="100" src="/the-movie-db.svg" alt="The Movie DB" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './components/Home';
import Movie from './components/Movie';
import NotFound from './components/NotFound';

const Routes = () => (
  <Router>
    <Layout>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/movie/:id/:title" component={Movie} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Layout>
  </Router>
);

export default Routes;
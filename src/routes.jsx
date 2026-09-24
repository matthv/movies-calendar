import { BrowserRouter, Routes, Route, useParams } from 'react-router';

import Layout from './components/Layout';
import Home from './components/Home';
import Movie from './components/Movie';
import NotFound from './components/NotFound';

// Remount on id change, otherwise navigating movie to movie keeps stale data.
function MovieRoute() {
  const { id } = useParams();
  return <Movie key={id} id={id} />;
}

export function AppRoutesContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id/:title" element={<MovieRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AppRoutesContent />
    </BrowserRouter>
  );
}

import { usePageMeta } from '../../lib/page_meta';

export default function NotFound() {
  // A static SPA can't send a real 404 status, so keep these URLs out of the index
  usePageMeta({ title: 'Page introuvable', noindex: true });

  return (
    <div className="container">
      <h1>
        404 <small>Not Found :(</small>
      </h1>
    </div>
  );
}

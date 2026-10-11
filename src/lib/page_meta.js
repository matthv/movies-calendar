import { useEffect } from 'react';
import { SITE_URL } from './format';

const SITE_NAME = 'Movies Calendar';
const DEFAULT_DESCRIPTION = 'Les films les plus populaires, mois par mois, avec The Movie Database.';

function headElement(tag, key, value) {
  let element = document.head.querySelector(`${tag}[${key}="${value}"]`);
  if (!element) {
    element = document.createElement(tag);
    element.setAttribute(key, value);
    document.head.appendChild(element);
  }
  return element;
}

function setHead(tag, key, value, attribute, content) {
  if (content) headElement(tag, key, value).setAttribute(attribute, content);
  else document.head.querySelector(`${tag}[${key}="${value}"]`)?.remove();
}

// Updates the tags index.html already has instead of adding React 19 hoisted
// ones: hoisting would leave two <title> and two descriptions in the head.
export function usePageMeta({ title, description, path, image, type = 'website', noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} – ${SITE_NAME}` : SITE_NAME;
    const text = description || DEFAULT_DESCRIPTION;
    const url = path ? `${SITE_URL}${path}` : null;

    document.title = fullTitle;
    setHead('meta', 'name', 'description', 'content', text);
    setHead('meta', 'name', 'robots', 'content', noindex ? 'noindex' : null);
    setHead('link', 'rel', 'canonical', 'href', url);
    setHead('meta', 'property', 'og:title', 'content', fullTitle);
    setHead('meta', 'property', 'og:description', 'content', text);
    setHead('meta', 'property', 'og:url', 'content', url);
    setHead('meta', 'property', 'og:type', 'content', type);
    setHead('meta', 'property', 'og:image', 'content', image || `${SITE_URL}/logo-big.png`);
  }, [title, description, path, image, type, noindex]);
}

import { useEffect } from 'react';
import { DEFAULT_DESCRIPTION, SITE_URL, fullTitle } from './format';

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
    const pageTitle = fullTitle(title);
    const text = description || DEFAULT_DESCRIPTION;
    const url = path ? `${SITE_URL}${path}` : null;

    document.title = pageTitle;
    setHead('meta', 'name', 'description', 'content', text);
    setHead('meta', 'name', 'robots', 'content', noindex ? 'noindex' : null);
    setHead('link', 'rel', 'canonical', 'href', url);
    setHead('meta', 'property', 'og:title', 'content', pageTitle);
    setHead('meta', 'property', 'og:description', 'content', text);
    setHead('meta', 'property', 'og:url', 'content', url);
    setHead('meta', 'property', 'og:type', 'content', type);
    setHead('meta', 'property', 'og:image', 'content', image || `${SITE_URL}/logo-big.png`);
  }, [title, description, path, image, type, noindex]);
}

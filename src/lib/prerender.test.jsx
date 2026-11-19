import { afterEach, describe, expect, it } from 'vitest';
import { capturePrerender, prerenderedHtml } from './prerender';

const root = (html) => Object.assign(document.createElement('div'), { innerHTML: html });
const at = (url) => new URL(url, 'https://www.movies-calendar.com');

describe('prerender', () => {
  afterEach(() => capturePrerender(null));

  it('ne sert le contenu capture qu a l URL d origine', () => {
    capturePrerender(root(' <div class="prerender"><h1>Ojczyzna</h1></div> '), at('/movie/1/ojczyzna'));
    expect(prerenderedHtml(at('/movie/1/ojczyzna'))).toBe('<div class="prerender"><h1>Ojczyzna</h1></div>');
    expect(prerenderedHtml(at('/movie/2/autre'))).toBeNull();
    expect(prerenderedHtml(at('/movie/1/ojczyzna?x=1'))).toBeNull();
  });

  it('ne capture rien sous le shell generique', () => {
    capturePrerender(root(''), at('/movie/1/ojczyzna'));
    expect(prerenderedHtml(at('/movie/1/ojczyzna'))).toBeNull();
  });
});

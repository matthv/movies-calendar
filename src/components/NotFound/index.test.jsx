import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import NotFound from '.';

describe('NotFound', () => {
  it('demande aux moteurs de ne pas indexer la page', () => {
    render(<NotFound />);
    expect(document.title).toBe('Page introuvable – Movies Calendar');
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});

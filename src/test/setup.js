import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Le lecteur YouTube injecte un script tiers : sans objet dans jsdom
vi.mock('react-youtube', () => ({ default: () => null }));

window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

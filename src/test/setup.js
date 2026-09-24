import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// The YouTube player loads a third-party script, irrelevant in jsdom
vi.mock('react-youtube', () => ({ default: () => null }));

window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Garde le .env historique (REACT_APP_MOVIEDB_API_KEY) tel quel
  envPrefix: 'REACT_APP_',
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    env: { REACT_APP_MOVIEDB_API_KEY: 'test-key' },
  },
});

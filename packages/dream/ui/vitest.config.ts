import { defineConfig } from 'vitest/config';
import path from 'path';

const localReact = path.resolve(__dirname, 'node_modules/react');
const localReactDom = path.resolve(__dirname, 'node_modules/react-dom');

export default defineConfig({
  resolve: {
    alias: {
      'react': localReact,
      'react/jsx-runtime': path.join(localReact, 'jsx-runtime'),
      'react/jsx-dev-runtime': path.join(localReact, 'jsx-dev-runtime'),
      'react-dom': localReactDom,
      'react-dom/client': path.join(localReactDom, 'client'),
      'react-dom/server': path.join(localReactDom, 'server'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    deps: {
      // Inline ALL dependencies so vite's alias resolution applies to
      // everything, fixing React version mismatch with hoisted packages
      inline: [/.*/],
    },
  },
});

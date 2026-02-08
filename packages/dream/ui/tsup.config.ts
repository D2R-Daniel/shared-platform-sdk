import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'primitives/index': 'src/primitives/index.ts',
    'auth/index': 'src/auth/index.ts',
    'theme/index': 'src/theme/index.ts',
    'testing/index': 'src/testing/index.ts',
    'tailwind-preset': 'src/tailwind-preset.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
  ],
});

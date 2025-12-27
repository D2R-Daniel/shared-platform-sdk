import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'auth/index': 'src/auth/index.ts',
    'users/index': 'src/users/index.ts',
    'notifications/index': 'src/notifications/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});

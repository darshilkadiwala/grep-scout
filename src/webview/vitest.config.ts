import { resolve } from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname),
  test: {
    environment: 'node',
    include: ['utils/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@shared': resolve(__dirname, '../types'),
      '@constants': resolve(__dirname, '../constants'),
    },
  },
});

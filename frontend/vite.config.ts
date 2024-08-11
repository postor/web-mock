import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import router from 'vite-plugin-react-views'

export default defineConfig({
  plugins: [react(), router()],
  resolve: {
    alias: {
      // '@mono-test/other': path.resolve(__dirname, '../workspace-other/src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});
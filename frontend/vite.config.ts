import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import ViteReactAutoRoutePlugin from 'vite-react-auto-route-plugin'
import tailwindcss from 'tailwindcss'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss,
      ],
    }
  },
  plugins: [
    react(),
    ViteReactAutoRoutePlugin({
      root: './src/pages', // Optional customization
      getRoutesFile: /auto-get-routes\.ts/,
    }),],
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
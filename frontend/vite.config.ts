import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import ViteReactAutoRoutePlugin from 'vite-react-auto-route-plugin'
import tailwindcss from 'tailwindcss'
import EnvironmentPlugin from 'vite-plugin-environment'

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
    }),
    EnvironmentPlugin({
      WS_TINYBASE: process.env.WS_TINYBASE || 'ws://localhost:1234',
    }),
  ],
  resolve: {
    alias: {
      '@web-mock/common': path.resolve(__dirname, '../common/src'),
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
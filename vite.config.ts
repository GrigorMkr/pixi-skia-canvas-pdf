import { defineConfig } from 'vite';
import { resolve } from 'path';

const canvaskitPdfRoot = resolve(
  __dirname,
  'node_modules/html2pdf-skia/node_modules/@rollerbird/canvaskit-wasm-pdf',
);

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@rollerbird/canvaskit-wasm-pdf': canvaskitPdfRoot,
    },
  },
  optimizeDeps: {
    include: ['@rollerbird/canvaskit-wasm-pdf/bin/canvaskit-pdf.js'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
});

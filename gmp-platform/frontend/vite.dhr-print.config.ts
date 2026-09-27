import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(root, 'src') } },
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    outDir: '../backend/target/generated-resources/dhr-print', emptyOutDir: true,
    lib: { entry: 'src/dhr-print/main.tsx', name: 'DhrPrint', formats: ['iife'], fileName: () => 'renderer.js' },
  },
});

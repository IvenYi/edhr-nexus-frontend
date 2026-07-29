import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleLegacyWordDevImport } from './scripts/legacy-word-dev-import.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8081';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'legacy-word-dev-import',
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const handled = await handleLegacyWordDevImport(request, response, path.resolve(__dirname, '../..'));
          if (!handled) {
            next();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return undefined;
          if (id.includes('/node_modules/exceljs/')) return 'vendor-template-excel';
          if (id.includes('/node_modules/xlsx/')) return 'vendor-template-xlsx';
          if (id.includes('/node_modules/jszip/')) return 'vendor-template-import';
          if (id.includes('/node_modules/@xyflow/react/')) return 'vendor-flow';
          if (id.includes('/node_modules/@mui/icons-material/')) return 'vendor-mui-icons';
          if (id.includes('/node_modules/@mui/') || id.includes('/node_modules/@emotion/')) return 'vendor-mui';
          if (id.includes('/node_modules/@tanstack/react-query/')) return 'vendor-react-query';
          if (id.includes('/node_modules/react-router-dom/') || id.includes('/node_modules/@remix-run/router/')) return 'vendor-router';
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
});

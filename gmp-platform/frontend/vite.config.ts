import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleLegacyWordDevImport } from './scripts/legacy-word-dev-import.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDesignerDevTarget = process.env.TEMPLATE_DESIGNER_DEV_SERVER || 'http://localhost:3100';

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
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/template-designer-runtime': {
        target: templateDesignerDevTarget,
        changeOrigin: true,
        ws: true,
      },
    },
  },
});

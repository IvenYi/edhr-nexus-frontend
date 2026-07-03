import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDesignerDevTarget = process.env.TEMPLATE_DESIGNER_DEV_SERVER || 'http://localhost:3100';

export default defineConfig({
  plugins: [react()],
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

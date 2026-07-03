import { createHtmlPlugin } from 'vite-plugin-html';
import { fileURLToPath, URL } from 'node:url';
import { loadEnv } from 'vite';

export function getStartConfig(mode: string) {
  const { VITE_GLOBAL_HOST } = loadEnv(mode, process.cwd());
  return {
    plugins: [
      createHtmlPlugin({
        minify: true,
        pages: [
          {
            entry: '/start/main.ts',
            filename: 'index.html',
            template: 'index.html',
            injectOptions: {
              data: {
                injectScript: ``,
              },
            },
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@native': fileURLToPath(new URL('../native', import.meta.url)),
        '/@/apis': fileURLToPath(new URL('../src/apis', import.meta.url)),
        '@mobile': fileURLToPath(new URL('../src', import.meta.url)),
        '@start': fileURLToPath(new URL('../start', import.meta.url)),
        '@': fileURLToPath(new URL('../start/assets', import.meta.url)),
      },
    },
    server: {
      port: 8888,
      host: true,
      proxy: {
        '/gct-platform': VITE_GLOBAL_HOST,
        '/gct-apaas': VITE_GLOBAL_HOST,
        '/minio': VITE_GLOBAL_HOST,
        '/mobile': VITE_GLOBAL_HOST,
      },
    },
  };
}

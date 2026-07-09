import { createHtmlPlugin } from 'vite-plugin-html';
import { fileURLToPath, URL } from 'node:url';
import versionUpdatePlugin from './versionUpdatePlugin';
import compresssionBuild from 'rollup-plugin-compression';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import { resolve } from 'node:path';
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import';
import { loadEnv } from 'vite';
import { createHash } from 'crypto';

export function getPortalConfig(mode: string) {
  const pkgVersion = require('../../../package.json').version;
  const hash = createHash('md5').update(String(Date.now())).digest('hex').slice(0, 6);
  const version = `${pkgVersion}.${hash}`;
  const { VITE_GLOBAL_HOST } = loadEnv(mode, process.cwd());
  return {
    define: {
      // 定义全局变量
      __APP_VERSION__: JSON.stringify(version),
    },
    plugins: [
      createStyleImportPlugin({
        resolves: [VxeTableResolve()],
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve('./', 'src/assets/svg-icons'), resolve('../../', 'src/assets/icons')],
      }),
      createHtmlPlugin({
        minify: true,
        pages: [
          {
            entry: '/src/main.ts',
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
      versionUpdatePlugin({
        version: version,
      }),
      compresssionBuild({
        sourceName: `../../dist/build/src/projects/mobile-render`,
        type: 'zip',
        targetName: `../../dist/build/src/projects/mobile`,
        ignoreBase: true,
      }),
    ],
    resolve: {
      alias: {
        '@native': fileURLToPath(new URL('../native', import.meta.url)),
        '/@/apis': fileURLToPath(new URL('../src/apis', import.meta.url)),
        '@': fileURLToPath(new URL('../../../src', import.meta.url)),
        '/@': fileURLToPath(new URL('../../../src', import.meta.url)),
        '@mobile': fileURLToPath(new URL('../src', import.meta.url)),
        '/@page-designer': fileURLToPath(
          new URL('../../../src/projects/page-designer/src/', import.meta.url),
        ),
        '/@web-render': fileURLToPath(
          new URL('../../../src/projects/web-render/src/', import.meta.url),
        ),
      },
    },
    build: {
      outDir: '../../dist/build/src/projects/mobile-render/dist',
    },
    server: {
      port: 7777,
      host: true,
      proxy: {
        '/gct-platform': VITE_GLOBAL_HOST,
        '/gct-apaas': VITE_GLOBAL_HOST,
        '/minio': VITE_GLOBAL_HOST,
      },
    },
  };
}

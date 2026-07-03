import { resolve } from 'node:path';

import { execSync } from 'child_process';
import dayjs from 'dayjs';
import { readPackageJSON } from 'pkg-types';
import { defineConfig, loadEnv, mergeConfig, UserConfig } from 'vite';

import EnvConfigJson from '../../../../helper/env.config.json';
import { createPlugins } from '../plugins';
import { generateModifyVars } from '../utils/modifyVars';
import { commonConfig } from './common';

interface DefineOptions {
  overrides?: UserConfig;
  options?: {
    //
  };
}

function getGitBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' });
    return branch.trim();
  } catch (error) {
    console.error('Error getting git branch:', error);
    return 'unknown'; // 如果获取失败返回默认值
  }
}

function defineApplicationConfig(defineOptions: DefineOptions = {}) {
  const { overrides = {} } = defineOptions;

  const branch = getGitBranch();
  console.log(`Git Branch: ${branch}`);
  const envKey: string =
    Object.keys(EnvConfigJson).find((item) => branch.includes(item)) || 'paas-dev';
  const envHost = envKey ? EnvConfigJson[envKey] : '';

  return defineConfig(async ({ command, mode }) => {
    const root = process.cwd();
    const isBuild = command === 'build';
    const {
      VITE_USE_MOCK,
      VITE_BUILD_COMPRESS,
      VITE_ENABLE_ANALYZE,
      VITE_GLOBAL_PROXY = '/gct-platform,/gct-apaas,/minio,/gct-ipaas',
      VITE_GLOBAL_HOST,
    } = loadEnv(mode, root);

    const defineData = await createDefineData(root);
    const plugins = await createPlugins({
      isBuild,
      root,
      enableAnalyze: VITE_ENABLE_ANALYZE === 'true',
      enableMock: VITE_USE_MOCK === 'true',
      compress: VITE_BUILD_COMPRESS,
    });

    const pathResolve = (pathname: string) => resolve(root, '.', pathname);
    const applicationConfig: UserConfig = {
      server: {
        host: true,
        // port: 8088,
        proxy: {
          hostname: '0.0.0.0',
          ...(VITE_GLOBAL_PROXY ?? '')
            .split(',')
            .reduce((map: Record<string, string>, item: string) => {
              map[item] = envHost ?? VITE_GLOBAL_HOST;
              return map;
            }, {}),
        },
      },
      resolve: {
        alias: [
          {
            find: 'vue-i18n',
            replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
          },
          // /@/xxxx => src/xxxx
          {
            find: /\/@\//,
            replacement: pathResolve('src') + '/',
          },
          // /#/xxxx => types/xxxx
          {
            find: /\/#\//,
            replacement: pathResolve('types') + '/',
          },
          // @/xxxx => src/xxxx
          {
            find: /@\//,
            replacement: pathResolve('src') + '/',
          },
          // #/xxxx => types/xxxx
          {
            find: /#\//,
            replacement: pathResolve('types') + '/',
          },
        ],
      },
      define: defineData,
      build: {
        target: 'es2020',
        cssTarget: 'chrome80',
        rollupOptions: {
          output: {
            manualChunks: {
              // vue: ['vue', 'pinia', 'vue-router'],
              antd: ['@ant-design/icons-vue'],
              // monacoEditor: ['monaco-editor'], // 移除：使用 CDN 懒加载，已在 external 中配置
              ts: ['typescript'],
              iconParkVue: ['@icon-park/vue-next'],
              vxeTable: ['vxe-table'],
              nodeSql: ['node-sql-parser'],
              video: ['video.js'],
              pinyinPro: ['pinyin-pro'],
              googleLibphonenumber: ['google-libphonenumber'],
              vuePdfEmbed: ['vue-pdf-embed'],
              html2canvas: ['html2canvas'],
              jsplumpWebUI: ['@jsplumb/browser-ui'],
              esprima: ['esprima-next'],
            },
          },
        },
      },
      css: {
        preprocessorOptions: {
          less: {
            modifyVars: generateModifyVars(),
            javascriptEnabled: true,
          },
        },
      },
      plugins: [
        ...plugins,
        {
          name: 'proxy-file-fallback',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              // req.url += '.html';
              // console.log('asdsad');
              // console.log(req.url);
              if (
                req.url?.includes('/projects/app-designer/') &&
                !req.url?.includes('/projects/app-designer/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/app-designer\/([0-9a-z]+\/)([0-9a-z]{4}\/)?/,
                  '/projects/app-designer/',
                );
              } else if (
                req.url?.includes('/projects/page-designer/') &&
                !req.url?.includes('/projects/page-designer/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/page-designer\/[0-9a-z]+\/[0-9a-z]{4}\//,
                  '/projects/page-designer/',
                );
              } else if (
                req.url?.includes('/projects/online-form/') &&
                !req.url?.includes('/projects/online-form/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/online-form\/[0-9a-z]+\/[0-9a-z]{4}\//,
                  '/projects/online-form/',
                );
              } else if (
                req.url?.includes('/projects/web-render/') &&
                !req.url?.includes('/projects/web-render/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/web-render\/[0-9a-z]+\/[0-9a-z]{4}\//,
                  '/projects/web-render/',
                );
              } else if (
                req.url?.includes('/projects/web-sandbox/') &&
                !req.url?.includes('/projects/web-sandbox/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/web-sandbox\/[0-9a-z]+\/[0-9a-z]{4}\//,
                  '/projects/web-render/',
                );
              } else if (
                req.url?.includes('/projects/web-sandbox-app/') &&
                !req.url?.includes('/projects/web-sandbox-app/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/web-sandbox-app\/[0-9a-z]+\/[0-9a-z]{4}\//,
                  '/projects/web-render/',
                );
              } else if (
                req.url?.includes('/projects/web/') &&
                !req.url?.includes('/projects/web/src')
              ) {
                req.url = req.url.replace(/\/projects\/web\/[0-9a-z]+\//, '/projects/web-render/');
              } else if (
                req.url?.includes('/projects/bi-designer/') &&
                !req.url?.includes('/projects/bi-designer/src')
              ) {
                req.url = req.url.replace(
                  /\/projects\/bi-designer\/([0-9a-z]+\/)([0-9a-z]{4}\/)?/,
                  '/projects/bi-designer/',
                );
              }

              next();
            });
          },
        },
        {
          name: 'vite-plugin-host-config',
          configResolved(config) {
            envHost && (config.env.VITE_GLOBAL_HOST = envHost);
          },
        },
      ],
    };

    /** 增加base配置 */
    // let commonConfigPro = commonConfig;
    // if (command.startsWith('build:')) {
    //   const module = command.split(':')[1];
    //   console.log(module);
    //   if (module) {
    //     commonConfigPro = mergeConfig(commonConfig, { base: `/${module}/` });
    //   }
    // }
    // const mergedConfig = mergeConfig(commonConfigPro, applicationConfig);

    const mergedConfig = mergeConfig(commonConfig, applicationConfig);

    return mergeConfig(mergedConfig, overrides);
  });
}

async function createDefineData(root: string) {
  try {
    const pkgJson = await readPackageJSON(root);
    const { dependencies, devDependencies, name, version } = pkgJson;

    const __APP_INFO__ = {
      pkg: { dependencies, devDependencies, name, version },
      lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    return {
      __APP_INFO__: JSON.stringify(__APP_INFO__),
      __APP_TIMESTAMP__: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss')),
    };
  } catch (error) {
    return {};
  }
}

export { defineApplicationConfig };

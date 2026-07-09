import { defineConfig, mergeConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import legacy from '@vitejs/plugin-legacy';
import AutoImport from 'unplugin-auto-import/vite';
import removeCrossoriginPlugin from './helper/remove-crossorigin-plugin.js';
import progress from 'vite-plugin-progress';
import path from 'path';
import { systemJsTransformHtml } from '../../internal/vite-config/src/plugins/build';
import { getOptionsByModul } from './config/index';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => {
  const { VITE_APP_MODULE } = loadEnv(mode, process.cwd());
  const webpackoptions = getOptionsByModul(VITE_APP_MODULE)(mode);
  const baseConfig = {
    base: './',
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
          additionalData: `@use "@gct-paas/scss/style/global.scss" as *;$namespace: 'gct';`,
        },
      },
    },
    build: {
      rollupOptions: {
        external: [
          '@gct-paas/api',
          '@gct-paas/core',
          '@gct-paas/design',
          '@gct-paas/design-mobile',
          '@gct-paas/design-web',
          '@gct-paas/mobile',
          '@gct-paas/web',
          'axios',
          'dayjs',
          'lodash-es',
          'pinia',
          'qs',
          'sortablejs',
          'vue',
          'vue-i18n',
          'vue-router',
          'vuedraggable',
          'vue-grid-layout',
          // 'vant',
          'monaco-editor',
        ],
      },
    },
    plugins: [
      vue(),
      vueJsx(),
      UnoCSS({ hmrTopLevelAwait: false }),
      legacy({
        externalSystemJS: true,
        renderLegacyChunks: true,
        // 关键配置：只生成 legacy 版本
        renderModernChunks: false,
        targets: ['android >= 10'],
      }), // 添加Android 10的标识
      Components({
        dirs: [],
        resolvers: [VantResolver()],
      }),
      AutoImport({
        // exclude: [/\.[tj]sx?$/],
        dts: './src/auto-imports.d.ts',
        imports: ['vue', 'vue-router', 'pinia'],
      }),
      systemJsTransformHtml(
        path.resolve(
          process.cwd(),
          '../../dist/build/src/projects/mobile-render/dist/extras/system-imports.json',
        ),
      ),
      VueDevTools(),
      removeCrossoriginPlugin(),
      progress(),
    ],
  };
  const config = mergeConfig(baseConfig, webpackoptions);
  return config;
});

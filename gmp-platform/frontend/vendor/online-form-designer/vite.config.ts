import { defineApplicationConfig } from '@vben/vite-config';
import progress from 'vite-plugin-progress';
import { join, resolve } from 'node:path';
import { glob } from 'glob';
// import { visualizer } from "rollup-plugin-visualizer";

const formTemplateEntryModules = new Set(['web-render']);

const getEntryPath = () => {
  const pageEntry: Record<string, string> = {};
  const command = process.env.npm_lifecycle_event || 'dev';
  let need_module = '';
  const isNeedAll = command === 'build' || command === 'dev';
  if (!isNeedAll) {
    const index = command.lastIndexOf(':');
    need_module = command.substring(index + 1, command.length);
  }

  glob.sync('./src/projects/*/index.html').forEach((entry: string) => {
    const pathArr: string[] = entry.replace(/\\/g, '/').split('/');
    const name: string = pathArr[pathArr.length - 2];
    if (isNeedAll && formTemplateEntryModules.has(name)) {
      pageEntry[name] = join(process.cwd(), `/src/projects/${name}/index.html`);
    } else if (need_module == name) {
      pageEntry[name] = join(process.cwd(), `/src/projects/${name}/index.html`);
      // 表达式为公共模块
      !pageEntry['formula'] &&
        (pageEntry['formula'] = join(process.cwd(), `/src/projects/formula/index.html`));
    }
  });
  if (pageEntry['app-designer']) {
    pageEntry['preview'] = join(process.cwd(), `/src/projects/app-designer/preview.html`);
  }
  // if (command.startsWith('build:')) {
  //   const module = command.split(':')[1];
  //   pageEntry[module] = resolve(__dirname, `src/projects/${module}/index.html`);
  // } else if (command === 'dev') {
  //   glob.sync('./src/projects/**/index.html').forEach((entry: string) => {
  //     const pathArr: string[] = entry.replace(/\\/g, '/').split('/');
  //     const name: string = pathArr[pathArr.length - 2];
  //     pageEntry[name] = join(process.cwd(), `/src/projects/${name}/index.html`);
  //   });
  // }
  return pageEntry;
};
const getDistPath = (): string => {
  const command = process.env.npm_lifecycle_event || 'build';
  const index = command.lastIndexOf(':');
  return 'dist/' + command.substring(index + 1, command.length);
};
export default defineApplicationConfig({
  overrides: {
    css: {
      modules: {
        generateScopedName: '[name]__[local]--[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          silenceDeprecations: ['import', 'color-functions', 'global-builtin'],
          additionalData: `@use "@gct-paas/scss/style/global.scss" as *;`,
        },
      },
    },
    resolve: {
      alias: [
        {
          find: /\/@portal/,
          replacement: resolve('src') + '/projects/portal/src/',
        },
        {
          find: /\/@developer-center/,
          replacement: resolve('src') + '/projects/developer-center/src/',
        },
        {
          find: /\/@backend-management/,
          replacement: resolve('src') + '/projects/backend-management/src/',
        },
        {
          find: /\/@tenant-center/,
          replacement: resolve('src') + '/projects/tenant-center/src/',
        },
        {
          find: /\/@app-designer/,
          replacement: resolve('src') + '/projects/app-designer/src/',
        },
        {
          find: /\/@page-designer/,
          replacement: resolve('src') + '/projects/page-designer/src/',
        },
        {
          find: /\/@web-render/,
          replacement: resolve('src') + '/projects/web-render/src/',
        },
        {
          find: /\/@tenant-center/,
          replacement: resolve('src') + '/projects/tenant-center/src/',
        },
        {
          find: /@mobile/,
          replacement: resolve('packages') + '/mobile/src/',
        },
        {
          find: /@native/,
          replacement: resolve('packages') + '/mobile/native/',
        },
        {
          find: /\/@online-form/,
          replacement: resolve('src') + '/projects/online-form/src/',
        },
        {
          find: /\/@ipaas/,
          replacement: resolve('src') + '/projects/ipaas/src/',
        },
        {
          find: /\/@bi-designer/,
          replacement: resolve('src') + '/projects/bi-designer/src/',
        },
      ],
    },
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'qrcode',
        '@iconify/iconify',
        // 'ant-design-vue/es/locale/zh_CN',
        // 'ant-design-vue/es/locale/en_US',
        'highlight.js/lib/languages/json',
        'vant',
        '@qx-chitanda/scss-utils',
        'json-format',
        'highlight.js/lib/languages/javascript',
        '@highlightjs/vue-plugin',
        '@antv/x6-vue-shape',
        '@antv/x6-plugin-minimap',
        '@antv/x6-plugin-scroller',
        '@antv/layout',
        'marked',
        'vant/es/utils',
        'dayjs/plugin/utc',
        'dayjs/plugin/timezone',
        'dayjs/plugin/quarterOfYear',
        'dayjs/plugin/toArray',
        'dayjs/plugin/isoWeek',
        '@gct-paas/design',
        'vant/es',
        'xe-utils',
        'vue-pdf-embed',
        '@panzoom/panzoom',
        'exceljs',
        '@vueuse/shared',
        '@videojs-player/vue',
        'video.js',
        '@antv/x6-plugin-dnd',
        '@antv/x6-plugin-snapline',
        '@antv/x6-plugin-keyboard',
        '@antv/x6-plugin-selection',
        'ant-design-vue/es/date-picker/locale/zh_CN',
        'js-base64',
        'bwip-js',
        'cropperjs',
        '@vue/compiler-sfc',
        '@wecom/jssdk',
        // 'monaco-editor', // 移除：使用 CDN 懒加载，不需要预构建
      ],
      exclude: ['@antv/x6'],
    },
    build: {
      minify: false,
      emptyOutDir: false,
      outDir: getDistPath(),
      rollupOptions: {
        external: [
          '@gct-paas/api',
          '@gct-paas/core',
          '@gct-paas/core-mobile',
          '@gct-paas/core-web',
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
          'vue-grid-layout',
          'vue-i18n',
          'vue-router',
          'vuedraggable',
          'vant',
          'ant-design-vue',
          'monaco-editor', // 使用 CDN 懒加载，不打包进构建产物
        ],
        input: getEntryPath(),
        output: {
          // chunkFileNames: 'static/[name]-js/[name]-[hash].js',
          // entryFileNames: 'static/[name]-js/[name]-[hash].js',
          // assetFileNames: 'static/[ext]/name-[hash].[ext]',
        },
      },
    },
    plugins: [
      progress() as any,
      // visualizer() as any
    ],
  },
}) as any;

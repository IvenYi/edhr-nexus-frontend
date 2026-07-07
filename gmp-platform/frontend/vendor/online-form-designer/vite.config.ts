import { defineApplicationConfig } from '@vben/vite-config';
import progress from 'vite-plugin-progress';
import { join, resolve } from 'node:path';
import { glob } from 'glob';
// import { visualizer } from "rollup-plugin-visualizer";

const formTemplateEntryModules = new Set(['web-render']);

const isHostedDesignerOnlyBuild = () => process.env.VITE_ONLINE_FORM_HOSTED_ONLY === 'true';

const hostedDesignerShimPath = (fileName: string) =>
  resolve('src') + `/projects/online-form/src/hosted-shims/${fileName}`;

const hostedDesignerOnlyAliasEntries = () => {
  if (!isHostedDesignerOnlyBuild()) return [];

  return [
    {
      source: '@/components/registerGlobComp',
      replacement: hostedDesignerShimPath('register-glob-comp.ts'),
    },
    {
      source: '/@/components/registerGlobComp',
      replacement: hostedDesignerShimPath('register-glob-comp.ts'),
    },
    {
      source: '@/layouts/registerGlobLayout',
      replacement: hostedDesignerShimPath('register-glob-layout.ts'),
    },
    {
      source: '@/logics/initAppConfig',
      replacement: hostedDesignerShimPath('init-app-config.ts'),
    },
    {
      source: '@/logics/error-handle',
      replacement: hostedDesignerShimPath('error-handle.ts'),
    },
    {
      source: '/@/router/guard',
      replacement: hostedDesignerShimPath('router-guard.ts'),
    },
    {
      source: '/@online-form/router',
      replacement: hostedDesignerShimPath('online-form-router.ts'),
    },
    {
      source: '@gct/nocode-base',
      replacement: hostedDesignerShimPath('nocode-base.ts'),
    },
    {
      source: '@gct/nocode-web-render',
      replacement: hostedDesignerShimPath('nocode-web-render.ts'),
    },
    {
      source: '@/utils/http/axios',
      replacement: hostedDesignerShimPath('http-axios.ts'),
    },
    {
      source: '/@/utils/http/axios',
      replacement: hostedDesignerShimPath('http-axios.ts'),
    },
    {
      source: '/@/utils/http/axios/index',
      replacement: hostedDesignerShimPath('http-axios.ts'),
    },
    {
      source: '/@/store/modules/user',
      replacement: hostedDesignerShimPath('user-store.ts'),
    },
    {
      source: '/@/store/modules/permission',
      replacement: hostedDesignerShimPath('permission-store.ts'),
    },
    {
      source: '/@/hooks/web/useRouter',
      replacement: hostedDesignerShimPath('use-router.ts'),
    },
    {
      source: '@/components/Expression',
      replacement: hostedDesignerShimPath('expression.ts'),
    },
    {
      source: '@/components/Expression/index',
      replacement: hostedDesignerShimPath('expression.ts'),
    },
    {
      source: '/@/components/Expression',
      replacement: hostedDesignerShimPath('expression.ts'),
    },
    {
      source: '/@/components/Expression/index',
      replacement: hostedDesignerShimPath('expression.ts'),
    },
    {
      source: '/@online-form/views/designer/hooks/usePrint',
      replacement: hostedDesignerShimPath('use-print.ts'),
    },
    {
      source: '@/locales/setupI18n',
      replacement: hostedDesignerShimPath('setup-i18n.ts'),
    },
    {
      source: '/@/locales/setupI18n',
      replacement: hostedDesignerShimPath('setup-i18n.ts'),
    },
    {
      source: '../base/field-config.vue',
      replacement: hostedDesignerShimPath('hosted-field-config.vue'),
    },
    {
      source: '/@online-form/views/designer/modules/base/field-config.vue',
      replacement: hostedDesignerShimPath('hosted-field-config.vue'),
    },
    {
      source: '/@online-form/views/__cell_widgets__/cell-widget-props.vue',
      replacement: hostedDesignerShimPath('hosted-cell-widget-props.vue'),
    },
    {
      source: '/@online-form/views/__cell_widgets__/cell-widget-style.vue',
      replacement: hostedDesignerShimPath('hosted-cell-widget-style.vue'),
    },
    {
      source: '/@online-form/views/__cell_widgets__/index',
      replacement: hostedDesignerShimPath('widget-index.ts'),
    },
    {
      source: './reverse-modeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '../../hooks/reverse-modeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '../../../hooks/reverse-modeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '../../designer/hooks/reverse-modeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '/@online-form/views/designer/hooks/reverse-modeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '/@online-form/views/designer/hooks/reverse-modeling/index',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '/@online-form/views/designer/hooks/reverse-modeling/useReverseModeling',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '/@online-form/views/designer/hooks/reverse-modeling/utils',
      replacement: hostedDesignerShimPath('reverse-modeling.ts'),
    },
    {
      source: '/@/hooks/platform',
      replacement: hostedDesignerShimPath('platform.ts'),
    },
    {
      source: '/@online-form/views/render/__components__/index',
      replacement: hostedDesignerShimPath('render-components.ts'),
    },
    {
      source: '@gct/runtime-web',
      replacement: hostedDesignerShimPath('runtime-web.ts'),
    },
  ];
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hostedDesignerOnlyAliases = () =>
  hostedDesignerOnlyAliasEntries().map(({ source, replacement }) => ({
    find: new RegExp(`^${escapeRegExp(source)}$`),
    replacement,
  }));

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
      !isHostedDesignerOnlyBuild() &&
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

function designerBuildHeartbeat() {
  let timer: ReturnType<typeof setInterval> | undefined;
  let transformed = 0;
  let startedAt = 0;
  const isDesignerBuild = () => process.env.npm_lifecycle_event === 'build:online-form';
  const log = (message: string) => console.log(`[designer-build] ${message}`);
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };

  return {
    name: 'gct:designer-build-heartbeat',
    apply: 'build',
    buildStart() {
      if (!isDesignerBuild()) return;
      startedAt = Date.now();
      log('start online-form build');
      timer = setInterval(() => {
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        log(`running ${seconds}s, transformed ${transformed} source modules`);
      }, 30_000);
      timer.unref?.();
    },
    transform(_code: string, id: string) {
      if (isDesignerBuild() && !id.includes('/node_modules/')) {
        transformed += 1;
      }
      return null;
    },
    generateBundle(_options: unknown, bundle: Record<string, unknown>) {
      if (isDesignerBuild()) {
        log(`generate bundle files: ${Object.keys(bundle).length}`);
      }
    },
    buildEnd(error?: Error) {
      if (isDesignerBuild() && error) {
        log(`failed: ${error.message}`);
        stop();
      }
    },
    closeBundle() {
      if (!isDesignerBuild()) return;
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      log(`completed in ${seconds}s, transformed ${transformed} source modules`);
      stop();
    },
  };
}

function hostedDesignerOnlyModuleAlias() {
  return {
    name: 'gct:hosted-designer-only-module-alias',
    enforce: 'pre',
    resolveId(source: string) {
      if (!isHostedDesignerOnlyBuild()) return null;
      const entry = hostedDesignerOnlyAliasEntries().find((item) => item.source === source);
      return entry?.replacement ?? null;
    },
  };
}

function designerBuildImportTrace() {
  const enabled = () => process.env.VITE_TRACE_DESIGNER_IMPORTS === 'true';
  const seen = new Set<string>();
  const maxLogs = 220;
  const targetImports = [
    /^@\/components\/registerGlobComp$/,
    /^\/@\/components\/registerGlobComp$/,
    /^\/@\/hooks\/web\/useRouter$/,
    /^\/@\/store\/modules\/(permission|user)$/,
    /^@\/utils\/http\/axios$/,
    /^\/@\/utils\/http\/axios$/,
    /^@mobile/,
    /^@native/,
    /^\/@web-render/,
    /^\/@page-designer/,
    /^\/@app-designer/,
    /packages\/mobile/,
    /src\/components\/registerGlobComp\.ts/,
    /src\/hooks\/web\/useRouter\.ts/,
    /src\/store\/modules\/(permission|user)\.ts/,
    /src\/utils\/Dialog\.ts/,
    /src\/utils\/http\/axios/,
    /src\/projects\/web-render/,
    /src\/projects\/page-designer/,
    /src\/projects\/app-designer/,
  ];

  return {
    name: 'gct:designer-build-import-trace',
    apply: 'build',
    resolveId(source: string, importer?: string) {
      if (!enabled() || !importer) return null;
      if (!targetImports.some((pattern) => pattern.test(source))) return null;

      const key = `${source} <- ${importer}`;
      if (!seen.has(key) && seen.size < maxLogs) {
        seen.add(key);
        console.log(`[designer-build:trace] ${source} <- ${importer}`);
      }
      return null;
    },
    moduleParsed(moduleInfo: {
      id: string;
      importedIds?: string[];
      dynamicallyImportedIds?: string[];
      importers?: string[];
      dynamicImporters?: string[];
    }) {
      if (!enabled()) return;
      const targetDeps = [
        ...(moduleInfo.importedIds ?? []),
        ...(moduleInfo.dynamicallyImportedIds ?? []),
      ].filter((id) => targetImports.some((pattern) => pattern.test(id)));

      for (const dep of targetDeps) {
        const key = `${moduleInfo.id} -> ${dep}`;
        if (!seen.has(key) && seen.size < maxLogs) {
          seen.add(key);
          console.log(`[designer-build:trace] ${moduleInfo.id} -> ${dep}`);
        }
      }

      if (!targetImports.some((pattern) => pattern.test(moduleInfo.id))) return;

      const importers = [...(moduleInfo.importers ?? []), ...(moduleInfo.dynamicImporters ?? [])]
        .slice(0, 3)
        .join(' | ');
      const key = `${moduleInfo.id} <- ${importers}`;
      if (!seen.has(key) && seen.size < maxLogs) {
        seen.add(key);
        console.log(`[designer-build:trace] ${moduleInfo.id} <- ${importers || 'unknown importer'}`);
      }
    },
  };
}

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
        ...hostedDesignerOnlyAliases(),
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
    server: {
      watch: {
        ignored: ['**/dist/**', '**/.turbo/**', '**/node_modules/**'],
      },
    },
    build: {
      minify: false,
      emptyOutDir: true,
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
      hostedDesignerOnlyModuleAlias() as any,
      progress() as any,
      designerBuildHeartbeat() as any,
      designerBuildImportTrace() as any,
      // visualizer() as any
    ],
  },
}) as any;

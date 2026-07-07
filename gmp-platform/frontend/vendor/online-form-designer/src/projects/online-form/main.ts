import 'uno.css';
import '@/design/index.less';
// import 'ant-design-vue/dist/antd.less';
// import 'ant-design-vue/dist/antd.variable.min.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import Antd from 'ant-design-vue';
import { App, createApp } from 'vue';

import { i18n, setupI18n } from '@/locales/setupI18n';
import { setupRouter } from '/@online-form/router';
import { setupStore } from '/@/store';
import { usePathQueryStore } from '/@/store/modules/pathQuery';

async function importStandaloneModule<T = any>(modulePath: string): Promise<T> {
  return import(/* @vite-ignore */ modulePath) as Promise<T>;
}

async function loadRootComponent(hostedDesignerMode: boolean) {
  if (hostedDesignerMode) {
    return (await import('./HostedApp.vue')).default;
  }
  return (await importStandaloneModule('/src/projects/online-form/App.vue')).default;
}

function isHostedDesignerMode() {
  const hashQuery = window.location.hash.split('?')[1] || '';
  return new URLSearchParams(hashQuery).get('hosted') === '1';
}

function createVueApp(rootComponent: any, rootProps?: any): App<Element> {
  const app = createApp(rootComponent, rootProps);

  // 配置 store
  setupStore(app);

  app.use(i18n);

  return app;
}

async function registerStandaloneGlobals(app: App<Element>) {
  const [{ registerGlobComp }, { registerGlobLayout }] = await Promise.all([
    importStandaloneModule('/src/components/registerGlobComp.ts'),
    importStandaloneModule('/src/layouts/registerGlobLayout.ts'),
  ]);

  registerGlobComp(app);
  registerGlobLayout(app);

  const { OverlayContainer } = await import('@gct/runtime-web');
  OverlayContainer.createVueApp = createVueApp;
}

function registerHostedDesignerGlobals(app: App<Element>) {
  app.use(Antd);
}

async function bootstrap() {
  const hostedDesignerOnlyBuild = import.meta.env.VITE_ONLINE_FORM_HOSTED_ONLY === 'true';
  const hostedDesignerMode = hostedDesignerOnlyBuild || isHostedDesignerMode();
  const AppComponent = await loadRootComponent(hostedDesignerMode);
  const app = createVueApp(AppComponent);

  if (hostedDesignerMode) {
    registerHostedDesignerGlobals(app);
  } else {
    await registerStandaloneGlobals(app);
  }

  // Configure store
  // 配置 store
  // setupStore(app);

  // Initialize internal system configuration
  // 初始化内部系统配置
  if (!hostedDesignerMode) {
    const { initAppConfigStore } = await importStandaloneModule('/src/logics/initAppConfig.ts');
    initAppConfigStore('online-form');
  }

  // Register global components
  // 注册全局组件
  // registerGlobComp(app);

  // 注册全局布局
  // registerGlobLayout(app);

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app, { loadRemote: !hostedDesignerMode });

  if (!hostedDesignerMode) {
    const { AsyncGctOnlineComponents } = await importStandaloneModule(
      '/src/projects/online-form/src/views/render/__components__/index.ts',
    );
    await AsyncGctOnlineComponents.init(true);
  }

  // Configure routing
  // 配置路由
  const router = setupRouter(app);

  // router-guard
  // 路由守卫
  if (!hostedDesignerMode) {
    const { setupRouterGuard } = await importStandaloneModule('/src/router/guard/index.ts');
    setupRouterGuard(router);
  }

  // Configure global error handling
  // 配置全局错误处理
  if (!hostedDesignerMode) {
    const { setupErrorHandle } = await importStandaloneModule('/src/logics/error-handle/index.ts');
    setupErrorHandle(app);
  }

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  const usePathQuery = usePathQueryStore();
  usePathQuery.initQuery();

  /**
   * 加载平台配置信息
   */
  if (!hostedDesignerMode) {
    const { usePlatformSetting } = await importStandaloneModule('/src/hooks/platform/index.ts');
    const { loadPlatformSetting } = usePlatformSetting();
    loadPlatformSetting(true);
  }

  app.mount('#app');
}

bootstrap();

import 'uno.css';
import '@/design/index.less';
// import 'ant-design-vue/dist/antd.less';
// import 'ant-design-vue/dist/antd.variable.min.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import { App, createApp } from 'vue';

import VueGridLayout from 'vue-grid-layout';
import { registerGlobComp } from '@/components/registerGlobComp';
import { setupGlobDirectives } from '@/directives';
import { i18n, setupI18n } from '@/locales/setupI18n';
import { setupErrorHandle } from '@/logics/error-handle';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { setupRouter } from '/@portal/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import AppComponent from './App.vue';

import { useEnv } from '/@/hooks/develop/useEnv';
import { registerGlobLayout } from '@/layouts/registerGlobLayout';

//自定义全局样式
import '/@/design/custom.less';
import { OverlayContainer } from '@gct/runtime-web';

function createVueApp(rootComponent: any, rootProps?: any): App<Element> {
  const app = createApp(rootComponent, rootProps);
  // 配置 store
  setupStore(app);

  // 注册全局组件
  registerGlobComp(app);

  // 注册全局布局
  registerGlobLayout(app);
  // 注册全局指令
  setupGlobDirectives(app);
  app.use(i18n);
  app.use(VueGridLayout);
  return app;
}
async function bootstrap() {
  const app = createApp(AppComponent);
  // Configure store
  // 配置 store
  setupStore(app);

  const { checkIsTestEnv } = useEnv();
  checkIsTestEnv();

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore('portal');

  // Register global components
  // 注册全局组件
  registerGlobComp(app);

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app, { loadRemote: false });

  // Configure routing
  // 配置路由
  const router = setupRouter(app);

  // router-guard
  // 路由守卫
  setupRouterGuard(router);

  // Register global directive
  // 注册全局指令
  setupGlobDirectives(app);

  // Configure global error handling
  // 配置全局错误处理
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.use(VueGridLayout);
  app.mount('#app');
}
OverlayContainer.createVueApp = createVueApp;

bootstrap();

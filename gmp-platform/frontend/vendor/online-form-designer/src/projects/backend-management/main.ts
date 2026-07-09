import 'uno.css';
import '@/design/index.less';
// import 'ant-design-vue/dist/antd.less';
// import 'ant-design-vue/dist/antd.variable.min.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import { App, createApp } from 'vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { registerGlobLayout } from '@/layouts/registerGlobLayout';
import { setupGlobDirectives } from '@/directives';
import { i18n, setupI18n } from '@/locales/setupI18n';
import { setupErrorHandle } from '@/logics/error-handle';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { setupRouter } from '/@backend-management/router';
import { setupRouterGuard } from '/@/router/guard';
import { usePlatformSetting } from '/@/hooks/platform';
import { setupStore } from '/@/store';
//自定义全局样式
import '/@/design/custom.less';
import { OverlayContainer } from '@gct/runtime-web';
import AppComponent from './App.vue';

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
  return app;
}
async function bootstrap() {
  const app = createVueApp(AppComponent);
  // Configure store
  // 配置 store
  setupStore(app);

  /**
   * 加载平台配置信息
   */
  const { loadPlatformSetting } = usePlatformSetting();
  loadPlatformSetting();

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore('backend-management', { permissionMode: 'PLATFORM_ROLE' });

  // Register global components
  // 注册全局组件
  // registerGlobComp(app);

  // 注册全局布局
  // registerGlobLayout(app);

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app);

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

  app.mount('#app');
}
OverlayContainer.createVueApp = createVueApp;

bootstrap();

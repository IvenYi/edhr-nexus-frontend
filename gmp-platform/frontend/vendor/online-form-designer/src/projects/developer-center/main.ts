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
import { setupI18n, i18n } from '@/locales/setupI18n';
import { setupErrorHandle } from '@/logics/error-handle';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { setupRouter } from '/@developer-center/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { usePlatformSetting } from '/@/hooks/platform';

import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import hljsJson from 'highlight.js/lib/languages/json';
// import hljsVuePlugin from '@highlightjs/vue-plugin';

//自定义全局样式
import '/@/design/custom.less';

import 'github-markdown-css/github-markdown.css';

import AppCom from './App.vue';
import { OverlayContainer } from '@gct/runtime-web';
import RuntimeDesign from '@gct/runtime-design';
import RuntimeMobileRender from '@gct/runtime-mobile-render';

hljs.registerLanguage('json', hljsJson);

function createVueApp(rootComponent: any, rootProps?: any): App<Element> {
  const app = createApp(rootComponent, rootProps);

  app.use(RuntimeDesign);
  app.use(RuntimeMobileRender);
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
  const app = createVueApp(AppCom);

  // Configure store
  // 配置 store
  // setupStore(app);

  /**
   * 加载平台配置信息
   */
  const { loadPlatformSetting } = usePlatformSetting();
  loadPlatformSetting();

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore('developer-center');

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
  // setupGlobDirectives(app);

  // Configure global error handling
  // 配置全局错误处理
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.mount('#app');
}
OverlayContainer.createVueApp = createVueApp;
bootstrap();

import 'uno.css';
import '/@/design/index.less';
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
import { initAppConfigStore, setProjectName } from '@/logics/initAppConfig';
import { setupRouter } from '/@app-designer/router';
import { setupRouterGuard } from '/@/router/guard';
import { setupStore } from '/@/store';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useAppInfoStore } from '/@/store/modules/app-info';
import AppComponent from './App.vue';
import { usePlatformSetting } from '/@/hooks/platform';
import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
import { useBranch } from '/@/hooks/develop/useBranch';

import 'github-markdown-css/github-markdown.css';

/*黑色主题*/
import 'highlight.js/styles/atom-one-dark.css';
/*白色主题*/
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from '@highlightjs/vue-plugin';
//自定义全局样式
import '/@/design/custom.less';
import { OverlayContainer } from '@gct/runtime-web';
import RuntimeDesign from '@gct/runtime-design';
import RuntimeMobileRender from '@gct/runtime-mobile-render';

import { AsyncGctOnlineComponents } from '/@online-form/views/render/__components__/index';
import { ProjectName } from '@gct/runtime';

hljs.registerLanguage('javascript', javascript);

const { loadBranchesForAppDesigner } = useBranch();

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

async function bootstrap(rootComponent: any = AppComponent) {
  const app = createVueApp(rootComponent);

  setProjectName(ProjectName.APP_DESIGNER);

  // 初始化设计器参数
  const usePathQuery = usePathQueryStore();
  usePathQuery.initQuery();

  // 加载分支信息
  await loadBranchesForAppDesigner();

  // 初始化AppInfo
  const appInfoStore = useAppInfoStore();
  await appInfoStore.loadAppInfo();

  /**
   * 加载平台配置信息
   */
  const { loadPlatformSetting } = usePlatformSetting();
  loadPlatformSetting(true);

  /** 加载全局配置 */

  const { loadGlobalSetting } = useGlobalSetting();
  loadGlobalSetting();
  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore(ProjectName.APP_DESIGNER);

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app);

  AsyncGctOnlineComponents.init(true);

  // Configure routing
  // 配置路由
  const router = setupRouter(app);

  // router-guard
  // 路由守卫
  setupRouterGuard(router);

  // Configure global error handling
  // 配置全局错误处理
  setupErrorHandle(app);

  // https://next.router.vuejs.org/api/#isready
  // await router.isReady();

  app.use(hljsVuePlugin);

  app.mount('#app');
}

OverlayContainer.createVueApp = createVueApp;

bootstrap();

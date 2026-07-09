import 'uno.css';
import '@/design/index.less';
// import 'ant-design-vue/dist/antd.less';
// import 'ant-design-vue/dist/antd.variable.min.css';
import 'virtual:svg-icons-register';
import { createApp, App } from 'vue';
import { registerGlobComp } from '@/components/registerGlobComp';
import { setupI18n, i18n } from '@/locales/setupI18n';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { setupStore } from '/@/store';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useQueryStore } from '/@/store/modules/query';
import Appconfig from './App.vue';
import { setupGlobDirectives } from '@/directives';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { usePlatformSetting } from '/@/hooks/platform';
import { registerWidgets } from '/@page-designer/components/widgets';
import { AsyncGctComponents } from './src/components/pcModule';
import { AsyncGctComponents as AsyncMobileGctComponents } from './src/components/mobileModuleDesign';
import { AsyncGctComponents as AsyncPadGctComponents } from './src/components/padModuleDesign';
import { OverlayContainer } from '@gct/runtime-web';
import { install as installCore } from '@gct-paas/core';
import { install as installDesign } from '@gct-paas/design';
import Designer from './src/designer';
import Views from './src/views';
import KIT from './src/_kit';

import RuntimeDesign from '@gct/runtime-design';
import RuntimeMobileRender from '@gct/runtime-mobile-render';
import { setupErrorHandle } from '/@/logics/error-handle';

//自定义全局样式
import '/@/design/custom.less';
// import '/@/design/vxe.scss';

installCore();
installDesign();

async function bootstrap() {
  const app = OverlayContainer.createVueApp(Appconfig);

  app.use(_gct.storeUtil.pinia as any);

  // Configure store
  // 配置 store
  setupStore(app);

  // Initialize internal system configuration
  // 初始化内部系统配置
  initAppConfigStore('page-designer');
  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  await setupI18n(app);
  //注册lowcode gct组件(懒加载)
  AsyncGctComponents.init(true);
  AsyncMobileGctComponents.init();
  AsyncPadGctComponents.init();
  // Register global components
  // 注册全局组件
  // registerGlobComp(app);
  // 注册设计器组件
  registerWidgets(app);
  // Register global directive
  // 注册全局指令
  setupGlobDirectives(app);
  // 配置全局错误处理
  setupErrorHandle(app);

  // 初始化设计器参数pid
  const useQuery = useQueryStore();
  useQuery.initQuery();
  // 初始化设计器参数aid
  const usePathQuery = usePathQueryStore();
  usePathQuery.initQuery();

  // 加载app信息

  try {
    const appInfoStore = useAppInfoStore();
    await appInfoStore.loadAppInfo();
  } catch (error) {
    console.error(error);
  }

  /**
   * 加载平台配置信息
   */
  const { loadPlatformSetting } = usePlatformSetting();
  await loadPlatformSetting(true);

  const appDom = document.getElementById('app');
  console.debug('Page Designer: 挂载到页面', appDom);
  app.mount(appDom!);
  console.debug('Page Designer: 挂载完成');
  return app;
}
OverlayContainer.createVueApp = function createVueApp(
  rootComponent: any,
  rootProps?: any,
): App<Element> {
  const app = createApp(rootComponent, rootProps);

  app.use(RuntimeDesign);
  app.use(RuntimeMobileRender);

  app.use(i18n);
  app.use(Designer);
  app.use(Views);
  app.use(KIT);
  registerGlobComp(app);
  return app;
};

console.debug('Page Designer: 脚本加载');

// iframe 模式直接启动
console.debug('Page Designer: iframe 挂载');
bootstrap();

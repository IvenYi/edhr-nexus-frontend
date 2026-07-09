import 'uno.css';
import '/@/design/index.less';
// import 'ant-design-vue/dist/antd.min.css';
// import 'ant-design-vue/dist/antd.variable.min.css';
// Register icon sprite
import 'virtual:svg-icons-register';

import { createApp, App } from 'vue';

import * as Antd from 'ant-design-vue';
import * as Icons from '@ant-design/icons-vue';
import { ColorPicker } from '@/components/ColorPicker';
import { i18n } from './local-i18n';
import { createRouter, createWebHashHistory } from 'vue-router';
import { createPinia } from 'pinia';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import AppComponent from './App.vue';
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import hljsJson from 'highlight.js/lib/languages/json';

//自定义全局样式
import '/@/design/custom.less';
// import '/@/design/vxe.scss';
import { OverlayController } from '../../../packages/runtime-web/src/utils/overlay-controller/overlay-controller';
import { OverlayContainer } from '../../../packages/runtime-web/src/utils/overlay-container/overlay-container';
import { install as installCore } from '@gct-paas/core';
import { GctRuntime } from '@gct/runtime';
import { basicRoutes } from './src/router/routes';
import {
  Column,
  Edit,
  Grid,
  Icon,
  Table,
  Tooltip,
  Validator,
  VxeTableExportModule,
} from 'vxe-table';
import '/@/design/vxe.scss';

hljs.registerLanguage('json', hljsJson);
installCore();

const APP_INST = 'app_inst';

if (!window.gct) {
  window.gct = new GctRuntime();
}
if (!window.gct.openUtil) {
  window.gct.openUtil = new OverlayController();
}

function createVueApp(rootComponent: any, rootProps?: any): App<Element> {
  const app = createApp(rootComponent, rootProps);
  // 配置 store
  app.use(createPinia());

  app.provide(APP_INST, app);
  app.use(Antd.default).use(ColorPicker);

  Object.keys(Icons).forEach((key) => {
    app.component(key, Icons[key]);
  });
  app
    .use(Column)
    .use(Table)
    .use(Icon)
    .use(Tooltip)
    .use(Edit)
    .use(Grid)
    .use(Validator)
    .use(VxeTableExportModule);

  app.use(i18n);

  return app;
}

async function bootstrap() {
  const app = createVueApp(AppComponent);

  // const coreModule = await System.import('@gct-paas/core');
  // const designModule = await System.import('@gct-paas/design');

  // coreModule.install();
  // designModule.install();

  window.app = app;

  // 初始化设计器参数
  const usePathQuery = usePathQueryStore();
  usePathQuery.initQuery();

  // Initialize internal system configuration

  // Multilingual configuration
  // 多语言配置
  // Asynchronous case: language files may be obtained from the server side
  // 异步案例：语言文件可能从服务器端获取
  // Configure routing
  // 配置路由;
  const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_PUBLIC_PATH),
    routes: basicRoutes as any,
    strict: true,
    scrollBehavior: () => ({ left: 0, top: 0 }),
  });
  app.use(router);
  window.$router = router;

  // https://next.router.vuejs.org/api/#isready
  await router.isReady();

  const appDom = document.getElementById('app');
  console.debug('Web Render: 挂载到页面', appDom);
  app.mount(appDom!);
  console.debug('Web Render: 挂载完成');
  return app;
}

OverlayContainer.createVueApp = createVueApp;

console.debug('Web Render: 脚本加载');

const win = window as any;
if (win.__POWERED_BY_WUJIE__) {
  let instance;
  console.debug('Web Render: 无界挂载');
  win.__WUJIE_MOUNT = async () => {
    console.debug('Web Render: 无界 mount');
    instance = await bootstrap();
    console.debug('Web Render: 无界 mount 完成');
  };
  win.__WUJIE_UNMOUNT = () => {
    console.debug('Web Render: 无界 unmount');
    instance.unmount();
  };
  win.__WUJIE.mount();
} else {
  console.debug('Web Render: 非无界挂载');
  bootstrap();
}

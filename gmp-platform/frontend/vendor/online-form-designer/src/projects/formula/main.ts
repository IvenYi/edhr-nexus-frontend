import { createApp } from 'vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { i18n, setupI18n } from '@/locales/setupI18n';
import { setupStore } from '/@/store';

import { App } from './App';

function createVueApp(rootComponent: any, rootProps?: any) {
  const app = createApp(rootComponent, rootProps);
  // 配置 store
  setupStore(app);
  // 注册全局组件
  registerGlobComp(app);
  app.use(i18n);
  return app;
}

async function bootstrap() {
  const app = createVueApp(App);
  await setupI18n(app);
  app.mount('#app');
}

bootstrap();

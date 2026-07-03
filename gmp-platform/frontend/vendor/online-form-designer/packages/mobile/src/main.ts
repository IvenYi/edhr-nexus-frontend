import './assets/main.less';
import '@gct-paas/scss/style/index.scss';

import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';
import 'vant/es/image-preview/style';
import 'uno.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@vant/touch-emulator';
import App from './App.vue';
import router from './router';
import registerGlobComp from './components/index';
import { AsyncGctComponents } from '/@page-designer/components/mobileModule';
import RenderComponents from '/@page-designer/_kit/mobile-render-index';
import { initStart } from './router/runStart';
import 'virtual:svg-icons-register';
import { i18n, setupI18n } from '@mobile/locales/setupI18n';
import { useEnv } from './utils/useEnv';
import { APP_INST, GctRuntime, PlatformType } from '@gct/runtime';
import RuntimeRender from '@gct/runtime-render';
import RuntimeMobileRender from '@gct/runtime-mobile-render';
import { install as installCore } from '@gct-paas/core';
import { CurrentTenant } from './stores/loginHooks';

const { checkIsTestEnv } = useEnv();

// 避免重复初始化全局对象
if (!window.gct) {
  window.gct = new GctRuntime();
}
window.gct.platform = PlatformType.PDA;

installCore();

if (window._gct) {
  _gct.store.setTenantId(CurrentTenant.value.id);
}

async function bootstrap() {
  // new VConsole({ theme: 'dark' });
  AsyncGctComponents.init();
  const app = createApp(App);

  app.provide(APP_INST, app);

  app.use(createPinia());
  app.use(router);
  app.use(registerGlobComp);
  app.use(RenderComponents);
  app.use(RuntimeRender);
  app.use(RuntimeMobileRender);
  initStart().then(async () => {
    await Promise.all([setupI18n(app), checkIsTestEnv()]);
    app.config.globalProperties.$t = (key: any, value: any) => i18n.global.t(key, value);
    app.config.globalProperties.__APP_VERSION__ = __APP_VERSION__;
    app.mount('#app');
  });
}
bootstrap();

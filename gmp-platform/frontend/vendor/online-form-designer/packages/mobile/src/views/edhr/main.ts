import '../../assets/main.less';
import 'vant/es/toast/style';
import 'vant/es/dialog/style';
import 'vant/es/notify/style';
import 'vant/es/floating-bubble/style';
import 'vant/es/image-preview/style';
import 'uno.css';
import 'vxe-table/styles/cssvar.scss';
import './index.less';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import '@vant/touch-emulator';
import App from './App.vue';
import router from '@mobile/router/edhr';
import vImage from '../../components/vImage.vue';
import { initStart } from '@mobile/router/runStart';
import 'virtual:svg-icons-register';
import { i18n, setupI18n } from '@mobile/locales/setupI18n';
import { useEnv } from '@mobile/utils/useEnv';
import { useSingleApp } from '@mobile/utils/useSingleApp';
import { GctRuntime } from '@gct/runtime';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
import GctIcon from '@mobile/components/icon/index.vue';
import { AntPopover } from '@mobile/components/ant';
import VueGridLayout from 'vue-grid-layout';
import { Grid, Column, Table, Icon, Edit } from 'vxe-table';

import { setToastDefaultOptions, setNotifyDefaultOptions } from 'vant';

setToastDefaultOptions({
  zIndex: 999999,
});

setNotifyDefaultOptions({
  zIndex: 999999,
});

const { checkIsTestEnv } = useEnv();
const { initSingleApp } = useSingleApp();

// 避免重复初始化全局对象
if (!window.gct) {
  window.gct = new GctRuntime();
}

async function bootstrap() {
  const app = createApp(App);
  app.use(createPinia());
  app.use(router);
  app.use(VueGridLayout);
  app.component('VImage', vImage);
  app.component('GctIcon', GctIcon);
  app.component('APopover', AntPopover);
  app.use(Column).use(Table).use(Grid).use(Icon).use(Edit);
  initStart().then(async () => {
    await initSingleApp();
    await setupI18n(app);
    // 加载app比路由先加载信息
    if (!window.location.href.includes('#/login')) {
      try {
        const { loadBusinessSetting } = useBusinessSetting();
        await loadBusinessSetting();
      } catch (error) {}
    }
    app.config.globalProperties.$t = (key: any, value: any) => i18n.global.t(key, value);
    await checkIsTestEnv();
    app.mount('#app');
  });
}
bootstrap();

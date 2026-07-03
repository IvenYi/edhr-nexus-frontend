import { createApp } from 'vue';
import RuntimeDesign from '@gct/runtime-design';
import RuntimeRender from '@gct/runtime-render';
import RuntimeRenderWeb from '@gct/runtime-render-web';
import RuntimeMobileRender from '@gct/runtime-mobile-render';
import { setupI18n } from '@/locales/setupI18n';
import { PreviewApp } from './preview-app';
import { IconNext } from '/@/components/Icon';

async function run(): Promise<void> {
  const app = createApp(PreviewApp);

  app.component('IconNext', IconNext);

  app.use(RuntimeDesign);
  app.use(RuntimeRender);
  app.use(RuntimeRenderWeb);
  app.use(RuntimeMobileRender);

  await setupI18n(app);
  app.mount('#app');
}

run();

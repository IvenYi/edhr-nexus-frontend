import type { App } from 'vue';
import basicPage from './basic-page/index.vue';
import treeSiderPage from './tree-sider-page/index.vue';
import basicPageRender from './basic-page-render/index.vue';

export function registerGlobLayout(app: App) {
  app.component('BasicPage', basicPage);
  app.component('TreeSiderPage', treeSiderPage);
  app.component('BasicPageRender', basicPageRender);
}

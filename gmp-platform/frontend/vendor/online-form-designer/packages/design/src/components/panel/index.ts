import { App } from 'vue';
import { PanelContent } from './panel-content/panel-content';

export default {
  install(app: App) {
    app.component(PanelContent.name!, PanelContent);
  },
};

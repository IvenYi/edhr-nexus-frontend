import { App } from 'vue';
import { MaterialContent } from './material-content/material-content';

export default {
  install(app: App) {
    app.component(MaterialContent.name!, MaterialContent);
  },
};

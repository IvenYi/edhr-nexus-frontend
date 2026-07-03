import { App } from 'vue';
import { GctEditForm } from './gct-edit-form';

export default {
  install(app: App) {
    app.component(GctEditForm.name!, GctEditForm);
  },
};

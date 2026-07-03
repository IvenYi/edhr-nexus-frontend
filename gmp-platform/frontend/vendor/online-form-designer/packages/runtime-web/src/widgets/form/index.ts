import { App } from 'vue';
import { AppFormItem } from './form-item/form-item';
import { AppForm } from './form';

export default {
  install(app: App) {
    app.component(AppForm.name, AppForm);
    app.component(AppFormItem.name, AppFormItem);
  },
};

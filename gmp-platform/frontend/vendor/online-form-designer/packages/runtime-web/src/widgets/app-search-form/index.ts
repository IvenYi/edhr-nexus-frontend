import { App } from 'vue';
import { AppSearchForm } from './app-search-form';

export default {
  install(app: App) {
    app.component(AppSearchForm.name, AppSearchForm);
  },
};

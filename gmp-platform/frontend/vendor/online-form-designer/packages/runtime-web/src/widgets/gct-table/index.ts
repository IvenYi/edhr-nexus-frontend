import { App } from 'vue';
import { GctTable } from './gct-table';

export default {
  install(app: App) {
    app.component(GctTable.name!, GctTable);
  },
};

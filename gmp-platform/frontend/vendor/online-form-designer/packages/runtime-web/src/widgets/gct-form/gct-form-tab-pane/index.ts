import { App } from 'vue';
import { GctFormTabPaneProvider } from './gct-form-tab-pane.provider';
import { GctFormTabPane } from './gct-form-tab-pane';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('tab-pane', () => new GctFormTabPaneProvider());

    // 表单分组组件
    app.component(GctFormTabPane.name!, GctFormTabPane);
  },
};

export { GctFormTabPaneModel } from './gct-form-tab-pane.model';

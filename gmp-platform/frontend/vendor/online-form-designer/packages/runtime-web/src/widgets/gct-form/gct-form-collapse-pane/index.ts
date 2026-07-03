import { App } from 'vue';
import { GctFormCollapsePaneProvider } from './gct-form-collapse-pane.provider';
import { GctFormCollapsePane } from './gct-form-collapse-pane';
import { GctFormCollapsePaneModel } from './gct-form-collapse-pane.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('collapse-pane', () => new GctFormCollapsePaneProvider());

    // 表单折叠面板项组件
    app.component(GctFormCollapsePane.name!, GctFormCollapsePane);
  },
};

export { GctFormCollapsePaneModel };

import { App } from 'vue';
import { GctFormTabProvider } from './gct-form-tab.provider';
import { GctFormTab } from './gct-form-tab';
import { GctFormTabModel } from './gct-form-tab.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('tab', () => new GctFormTabProvider());

    // 表单分组组件
    app.component(GctFormTab.name!, GctFormTab);
  },
};

export { GctFormTabModel };

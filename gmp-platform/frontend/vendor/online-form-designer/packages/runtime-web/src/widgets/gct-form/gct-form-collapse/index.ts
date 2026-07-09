import { App } from 'vue';
import { GctFormCollapseProvider } from './gct-form-collapse.provider';
import { GctFormCollapse } from './gct-form-collapse';
import { GctFormCollapseModel } from './gct-form-collapse.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('collapse', () => new GctFormCollapseProvider());

    // 表单折叠面板组件
    app.component(GctFormCollapse.name!, GctFormCollapse);
  },
};

export { GctFormCollapseModel };

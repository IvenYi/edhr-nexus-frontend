import { App } from 'vue';
import { GctFormHiddenItemProvider } from './gct-form-hidden-item.provider';
import { GctFormHiddenItemModel } from './gct-form-hidden-item.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('hidden', () => new GctFormHiddenItemProvider());
  },
};

export { GctFormHiddenItemModel };

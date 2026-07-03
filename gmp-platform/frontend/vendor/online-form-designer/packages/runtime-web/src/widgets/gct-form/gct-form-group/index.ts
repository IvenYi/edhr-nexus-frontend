import { App } from 'vue';
import { GctFormGroupProvider } from './gct-form-group.provider';
import { GctFormGroup } from './gct-form-group';
import { GctFormGroupModel } from './gct-form-group.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('container', () => new GctFormGroupProvider());

    // 表单分组组件
    app.component(GctFormGroup.name!, GctFormGroup);
  },
};

export { GctFormGroupModel };

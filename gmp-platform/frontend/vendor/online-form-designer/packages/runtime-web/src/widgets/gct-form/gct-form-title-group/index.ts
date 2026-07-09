import { App } from 'vue';
import { FormContainerType } from '@gct/runtime';
import { GctFormTitleGroupProvider } from './gct-form-title-group.provider';
import { GctFormTitleGroup } from './gct-form-title-group';
import { GctFormTitleGroupModel } from './gct-form-title-group.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register(
      FormContainerType.FORM_TITLE_GROUP,
      () => new GctFormTitleGroupProvider(),
    );

    // 表单分组组件
    app.component(GctFormTitleGroup.name!, GctFormTitleGroup);
  },
};

export { GctFormTitleGroupModel };

import { App } from 'vue';
// 导入编辑器
import ChildListEditor from './child-list-editor';
import ContentTagStyle from './content-tag-style';
import CustomExpMenuEditor from './custom-exp-menu-editor';
import FieldInfoEditor from './field-info-editor';
import ModelFieldSelect from './model-field-select';
import StylePosition from './style-position';
import StyleFont from './style-font';
import StyleSpacing from './style-spacing';
import StyleBorder from './style-border';
import SystemPageSelect from './system-page-select';

export default {
  install(app: App) {
    // 注册编辑器
    app.use(ChildListEditor);
    app.use(ContentTagStyle);
    app.use(CustomExpMenuEditor);
    app.use(FieldInfoEditor);
    app.use(ModelFieldSelect);
    app.use(StylePosition);
    app.use(StyleFont);
    app.use(StyleSpacing);
    app.use(StyleBorder);
    app.use(SystemPageSelect);
  },
};

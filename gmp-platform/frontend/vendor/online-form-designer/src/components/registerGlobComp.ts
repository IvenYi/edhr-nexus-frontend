import type { App } from 'vue';
import * as Antd from 'ant-design-vue';
import * as Icons from '@ant-design/icons-vue';
import { BasicModal } from './Modal';
import { BasicDrawer } from './Drawer';
import { BasicTable, TableAction } from './Table';
import I18nSelectInput from './I18nSelect/src/i18n-select-input.vue';
import RelationshipDiagramConfig from './relationship-diagram-config';
import { IconNextPicker } from './Icon';
import ColModal from '/@page-designer/components/widgets/web/layout/grid/component/col-modal.vue';
import DataRulesContainer from '/@web-render/views/user-group/components/modal/data-role-setting/data-rules-container.vue';
import SortsEditor from '/@page-designer/designer/panels/prop-editor/basic/sorts-editor.vue';
import { IconNext } from '/@/components/Icon';
import WujieVue from 'wujie-vue3';
import { FieldUpload } from '/@/components/FieldUpload';
import GctRuntimeRender from '@gct/runtime-render';
import GctRuntimeRenderWeb from '@gct/runtime-render-web';
import '@gct-paas/scss/style/index.scss';

// import XEUtils from 'xe-utils';
import {
  // 全局对象
  // VXETable,
  // 表格功能
  // Filter,
  Edit,
  // Menu,
  // Export,
  // Keyboard,
  Validator,
  // 可选组件
  Icon,
  Column,
  // Colgroup,
  Grid,
  Tooltip,
  // Toolbar,
  // Pager,
  // Form,
  // FormItem,
  // FormGather,
  // Checkbox,
  // CheckboxGroup,
  // Radio,
  // RadioGroup,
  // RadioButton,
  // Switch,
  // Input,
  // Select,
  // Optgroup,
  // Option,
  // Textarea,
  // Button,
  // Modal,
  // List,
  // Pulldown,
  // 表格
  Table,
  VxeTableExportModule,
} from 'vxe-table';
import '/@/design/vxe.scss';
// import 'vxe-table/styles/cssvar.scss';
import { APP_INST } from '@gct/runtime';
import GctRuntimeWeb from '@gct/runtime-web';
import ModelPicker from '/@/components/ModelPicker';
import RdoNameText from '/@/components/RdoNameText';
import { ColorPicker } from './ColorPicker';
import ModelFieldSelect from './ModelFieldSelect';
import { setupGlobDirectives, NoCopyPaste } from '../directives';
import { registerGctWordRuntime } from '../logics/initWordConfig';

const modalConfirm = Antd.Modal.confirm;
Antd.Modal.confirm = (arg) => {
  arg.autoFocusButton = null;
  return modalConfirm(arg);
};
/**模态框的自动收集焦点功能 */
Antd.Modal.props.focusTriggerAfterClose.default = false;
export function registerGlobComp(app: App) {
  app.provide(APP_INST, app);

  // gct-runtime-web 注册
  app.use(GctRuntimeWeb);
  app.use(GctRuntimeRender);
  app.use(GctRuntimeRenderWeb);
  app.use(RelationshipDiagramConfig);
  // ant-design-vue 注册
  app.use(Antd.default).use(ColorPicker);
  const OriginalInput = app.component('AInputPassword');
  /**所有的密码输入框自动执行禁止复制粘贴逻辑 */
  app.component('AInputPassword', {
    ...OriginalInput,
    mounted() {
      // 如果原组件有 mounted 钩子，则先调用原来的 mounted
      if (OriginalInput && (OriginalInput as any).mounted) {
        (OriginalInput as any).mounted.call(this);
      }
      // 自动调用 no-copy-paste 指令的 mounted 钩子
      // 这里直接使用导入的 NoCopyPaste 指令对象来执行 mounted 行为
      this.$nextTick(() => {
        const el = this.$el;
        if (el && NoCopyPaste && typeof NoCopyPaste.mounted === 'function') {
          NoCopyPaste.mounted(el);
        }
      });
    },
  });
  // 注册 vben 相关组件
  app.use(BasicModal);
  app.use(BasicDrawer);
  // 全局注册所有图标
  Object.keys(Icons).forEach((key) => {
    app.component(key, Icons[key]);
  });
  app.use(ModelPicker);
  app.use(RdoNameText);
  app.use(ModelFieldSelect);
  app.use(FieldUpload);
  app.component('IconNextPicker', IconNextPicker);
  app.component('BasicTable', BasicTable);
  app.component('TableAction', TableAction);
  app.component('I18nSelectInput', I18nSelectInput);
  app.component('ColModal', ColModal);
  app.component('IconNext', IconNext);
  app.component('DataRulesContainer', DataRulesContainer);
  app.component('SortsEditor', SortsEditor);

  app.use(WujieVue);

  app
    .use(Column)
    .use(Table)
    .use(Icon)
    .use(Tooltip)
    .use(Edit)
    .use(Grid)
    .use(Validator)
    .use(VxeTableExportModule);

  // 注册全局指令
  setupGlobDirectives(app);
  // 注册eDHR Word的运行时能力
  registerGctWordRuntime(app);
}

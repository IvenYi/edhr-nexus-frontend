import vImage from './vImage.vue';
import SvgIcon from './icon/index.vue';
import { PadSvgIcon } from './pad-svg-icon/pad-svg-icon';
import type { App } from 'vue';
import {
  // 全局对象
  // VXETable,
  // 表格功能
  // Filter,
  Edit,
  // Menu,
  // Export,
  // Keyboard,
  // Validator,
  // 可选组件
  Icon,
  Column,
  // Colgroup,
  Grid,
  // Tooltip,
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
} from 'vxe-table';
import 'vxe-table/styles/cssvar.scss';
import Vant from 'vant';
import 'vant/lib/index.css';
import { registerWidgets } from './gctMenu-widgets';
import { registerTabbarViews } from './tabbar-views';
import { setupGlobDirectives } from '../directives/index';

export default function registerGlobComp(app: App) {
  // eslint-disable-next-line vue/component-definition-name-casing
  app.component('vImage', vImage);
  // eslint-disable-next-line vue/component-definition-name-casing
  app.component('gct-icon', SvgIcon);
  // eslint-disable-next-line vue/component-definition-name-casing
  app.component('icon-next', SvgIcon);
  app.component('pad-svg-icon', PadSvgIcon);
  app.use(Vant);
  app.use(Column).use(Table).use(Grid).use(Icon).use(Edit);
  /**注册自定义首页的组件 */
  registerWidgets(app);
  registerTabbarViews(app);
  app.use(setupGlobDirectives);
}

export function registerVxeTableGlobComp(app: App) {
  app.use(Column).use(Table).use(Grid).use(Icon).use(Edit);
}

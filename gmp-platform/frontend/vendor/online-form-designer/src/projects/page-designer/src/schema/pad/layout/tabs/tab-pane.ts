import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { tabPane } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import commonStyle from '../../../common-config/common-style';
import { displayEditor, displayProps } from '../../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: tabPane = {
  id: '',
  name: 'sys.pageDesigner.tabs',
  compName: 'sys.pageDesigner.tabsTitle',
  compKey: 'sys.pageDesigner.tabs',
  type: FormComponents.TabPane,
  platform: Platform.PAD,
  alias: 'sys.pageDesigner.tabs',
  icon: 'icon-biaoqianye',
  children: [],
  props: {
    title: '${sys.pageDesigner.tabs}',
    forceRender: false,
    ...displayProps,
  },
  i18n: {},
  style: {},
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.tabsTitle',
    group: PropGroup.BASIC,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
  },
  {
    component: 'switch-editor',
    name: 'forceRender',
    label: 'sys.pageDesigner.forceRender',
    group: PropGroup.OPTIONS,
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'number-editor',
    name: 'width',
    label: 'sys.width',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.height',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'color-radio-editor',
    name: 'background',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'margin',
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
/**设计时配置信息 */
export const designerConfig: LowCodeWidget.DesignerConfig = {
  basicProps: {
    key_label: 'sys.pageDesigner.tabs',
    alias_hidden: true,
  },
};

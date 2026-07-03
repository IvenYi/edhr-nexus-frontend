import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
} from '/@page-designer/enum';
import { Divider } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Divider = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.divider',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.Divider,
  icon: 'gct-iconfont icon-fengexianzujian',
  children: [],
  props: {
    title: '${sys.pageDesigner.divider}',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E3EB',
    ...displayProps,
  },
  i18n: {},
  ignoringStyle: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'height'],
  style: {
    backgroundColor: '#FFFFFF',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'divider-editor',
    name: {
      borderStyle: 'borderStyle',
      borderWidth: 'borderWidth',
      borderColor: 'borderColor',
    },
    label: '',
    group: PropGroup.DIVIDER,
    _config: {},
  },
  ...displayEditor,
];

export const styleEditorList: LowCodeWidget.StyleEditor[] = [
  {
    component: 'position-editor',
    name: 'position',
    label: 'sys.pageDesigner.position',
    group: StyleGroup.LAYOUT,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (widget: Divider) => {
  widget.children = [];
};

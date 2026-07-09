import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
} from '/@page-designer/enum';
import { Collapse } from '/@page-designer/types/mobile';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: Collapse = {
  id: '',
  platform: Platform.WEB,
  name: 'sys.pageDesigner.collapse',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.Collapse,
  icon: 'icon-Collapse',
  children: [],
  props: {
    title: '${sys.pageDesigner.collapse}',
    icon: '',
    color: '',
    isSupportFold: '1',
    defaultFold: true,
    titleChildren: [],
    explain: '',
    showExplain: false,
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
    component: 'text-editor',
    name: 'title',
    label: 'sys.pageDesigner.title',
    group: PropGroup.COLLAPSE,
    _config: {
      i18n: true,
      showCount: true,
      maxlength: 32,
    },
  },
  {
    component: 'icon-editor',
    name: { icon: 'icon', iconColor: 'color' },
    label: 'sys.pageDesigner.collapseIcon',
    group: PropGroup.COLLAPSE,
    _config: {
      showColor: true,
      defaultColor: '#3370FF',
    },
  },
  {
    component: 'collapse-editor',
    name: { support: 'isSupportFold', defaultFold: 'defaultFold' },
    label: 'sys.pageDesigner.isCollapse',
    group: PropGroup.COLLAPSE,
  },
  {
    component: 'switch-editor',
    name: 'showExplain',
    label: 'sys.pageDesigner.explain',
    group: PropGroup.COLLAPSE,
    hidden: (widget) => {
      return widget.platform === Platform.MOBILE;
    },
  },
  {
    component: 'texteare-editor',
    name: 'explain',
    label: '',
    group: PropGroup.COLLAPSE,
    hidden: (widget) => {
      return !widget.props.showExplain;
    },
    _config: {
      i18n: true,
    },
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
    component: 'font-editor',
    name: 'labelFont',
    label: '',
    group: StyleGroup.STYLE,
    _config: {
      label: 'sys.pageDesigner.titleText',
    },
  },
  {
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
  },
  {
    component: 'border-radius-editor',
    group: StyleGroup.BORDER,
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },
];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (widget: Collapse) => {
  widget.children = [
    { children: [] },
    {
      children: [],
    },
  ];
};

import {
  Platform,
  PropGroup,
  FormComponents,
  DisplayEnums,
  StyleGroup,
} from '/@page-designer/enum';
import { SpaceOccupation } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: SpaceOccupation = {
  id: '',
  platform: Platform.PAD,
  name: 'sys.pageDesigner.spaceOccupation',
  alias: '',
  display: DisplayEnums.BLOCK,
  type: FormComponents.SpaceOccupation,
  icon: 'gct-iconfont icon-zhanweizujian',
  children: [],
  props: {
    title: '${sys.pageDesigner.spaceOccupation}',
    height: 12,
    ...displayProps,
  },
  i18n: {},
  ignoringStyle: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'height'],
  style: {
    backgroundColor: '#F7F8FA',
  },
  events: {},
  formItem: false,
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: '',
    name: 'size',
    label: 'sys.pageDesigner.size',
    group: PropGroup.SPACE_OCCUPATION,
  },
  {
    component: 'number-editor',
    name: 'height',
    label: 'sys.pageDesigner.height',
    formItemClass: 'in-row-editor',
    group: PropGroup.SPACE_OCCUPATION,
    _config: {
      min: 8,
      max: 10000,
      addonAfter: 'px',
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
    component: 'color-editor',
    name: 'backgroundColor',
    label: 'sys.pageDesigner.backgroundColor',
    group: StyleGroup.BACKGROUND,
  },
  {
    component: 'margin-editor',
    group: StyleGroup.MARGIN,
    _config: {
      hiddenMarginOrPadding: 'padding',
    },
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

export const beforeCreate = (widget: SpaceOccupation) => {
  widget.children = [];
};

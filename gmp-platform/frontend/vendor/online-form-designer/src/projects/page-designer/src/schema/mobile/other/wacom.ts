import { Platform, FormComponents, StyleGroup } from '/@page-designer/enum';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: LowCodeWidget.BasicSchema = {
  id: '',
  platform: Platform.MOBILE,
  name: 'sys.pageDesigner.wacom',
  alias: '',
  type: FormComponents.Wacom,
  icon: 'icon-juxing',
  children: [],
  props: {
    ...displayProps,
  },
  style: {
    borderRight: {
      borderStyle: 'solid',
      borderColor: '#D1D1D1',
      borderWidth: '1',
    },
    borderTop: {
      borderStyle: 'solid',
      borderColor: '#D1D1D1',
      borderWidth: '1',
    },
    borderLeft: {
      borderStyle: 'solid',
      borderColor: '#D1D1D1',
      borderWidth: '1',
    },
    borderBottom: {
      borderStyle: 'solid',
      borderColor: '#D1D1D1',
      borderWidth: '1',
    },
    borderAll: {
      borderStyle: 'solid',
      borderColor: '#D1D1D1',
      borderWidth: '1',
    },
    // width: '500',
    // height: '500',
  },
  events: {},
  formItem: false,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [...displayEditor];

export const eventList: LowCodeWidget.EventsType[] = [];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};
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

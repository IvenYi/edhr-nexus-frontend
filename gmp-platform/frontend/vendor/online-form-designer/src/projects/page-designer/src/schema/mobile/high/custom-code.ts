import { Platform, PropGroup, FormComponents, StyleGroup } from '/@page-designer/enum';
import { CustomCode } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { displayEditor, displayProps } from '../../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: CustomCode = {
  id: '',
  platform: Platform.MOBILE,
  name: 'Vue3',
  alias: '',
  type: FormComponents.CustomCode,
  icon: 'icon-vue3',
  props: {
    code: undefined,
    runtimeCode: '',
    ...displayProps,
  },
  style: {},
  events: {},
  i18n: {},
  formItem: false,
  ignoringStyle: [],
};
export const propEditorList: LowCodeWidget.PropEditor[] = [
  {
    component: 'gct-vue-editor',
    name: { code: 'code', runtimeCode: 'runtimeCode' },
    label: '',
    group: PropGroup.Vue3,
  },
  ...displayEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [];

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
  },
  {
    component: 'border-editor',
    group: StyleGroup.BORDER,
  },

];

export const beforeCreate = (widget: CustomCode) => {

}

export const runCallback: LowCodeWidget.RunCallback = (_node) => { };


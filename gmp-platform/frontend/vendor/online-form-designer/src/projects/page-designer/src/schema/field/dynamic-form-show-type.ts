import { FormComponents } from '/@page-designer/enum';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../common-config/formItem-editor-config';
import commonFieldEditorConfig from '../common-config/common-field-editor-config';
import { displayEditor  } from '../common-config/display-editor-config';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.DynamicFormShowType,
  icon: '',
  props: {
    ...formItemProps,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  ...displayEditor
];

export const eventList: LowCodeWidget.EventsType[] = [];
export const styleEditorList: LowCodeWidget.StyleEditor[] = [];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

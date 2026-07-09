import { FormComponents, StyleGroup, PropGroup, Platform } from '/@page-designer/enum';
import { ESOP } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import getAutofillEditor from '../../common-config/autofill-editor-config';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<ESOP, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.ESOP,
  icon: '',
  props: {
    dragger: true,
    ...formItemProps,
    required: false,
    fieldRequired: false,
    enableAutofill: false,
    autofillRules: [],
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  // ...commonFieldEditorConfig.uploadDraggerEditor,
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...getAutofillEditor({ groupName: PropGroup.FIELD_CONFIG }),
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'onValidator',
    title: 'sys.pageDesigner.onValidator',
    params: ['value'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
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
    label: 'sys.name',
    group: StyleGroup.STYLE,
  },
];
// export const runCallback: LowCodeWidget.RunCallback = (_node) => {
//   _node.designerCache = undefined;
//   return _node;
// };

// export const beforeCreate = (_node: Input) => {};

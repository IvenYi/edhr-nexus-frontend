import { PropGroup, FormComponents, StyleGroup, Platform } from '/@page-designer/enum';
import { UploadFile } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';
import getAutofillEditor from '../../common-config/autofill-editor-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<UploadFile, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.UploadFile,
  icon: '',
  props: {
    maxSize: 10,
    maxCount: 1,
    template: '',
    dragger: true,
    ...formItemProps,
    required: false,
    fieldRequired: false,
    displayType: 'concise',
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
  {
    component: 'input-attr-editor',
    name: '',
    label: 'sys.pageDesigner.inputAttr',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      needFieldAttrs: ['required', 'readonly'],
      getFilterAttrs: (widget) => {
        if (widget.materialType == MaterialEnum.MaterialTableField) {
          return ['disabled'];
        }
        return [];
      },
    },
    hidden(widget: UploadFile) {
      return (
        widget.props.bindFieldKey ||
        widget.props.fieldReadonly ||
        ![
          MaterialEnum.MaterialFormField,
          MaterialEnum.MaterialTableField,
          MaterialEnum.MaterialSubTableField,
          MaterialEnum.MaterialSubTableModalField,
        ].includes(widget.materialType as MaterialEnum)
      );
    },
  },
  // ...commonFieldEditorConfig.uploadDraggerEditor,
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  // {
  //   component: 'upload-template-editor',
  //   name: 'template',
  //   label: 'sys.pageDesigner.filetemplate',
  //   group: PropGroup.BASIC,
  // },
  ...getAutofillEditor({ groupName: PropGroup.FIELD_CONFIG }),
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'onValidator',
    title: 'sys.pageDesigner.onValidator',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return widget.platform !== Platform.WEB;
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
  // {
  //   component: 'color-editor',
  //   name: 'backgroundColor',
  //   label: 'sys.pageDesigner.backgroundColor',
  //   group: StyleGroup.BACKGROUND,
  // },
  // {
  //   component: 'margin-editor',
  //   group: StyleGroup.MARGIN,
  // },
  // {
  //   component: 'border-radius-editor',
  //   group: StyleGroup.BORDER,
  // },
  // {
  //   component: 'border-editor',
  //   group: StyleGroup.BORDER,
  // },
];
// export const runCallback: LowCodeWidget.RunCallback = (_node) => {
//   _node.designerCache = undefined;
//   return _node;
// };

// export const beforeCreate = (_node: Input) => {};

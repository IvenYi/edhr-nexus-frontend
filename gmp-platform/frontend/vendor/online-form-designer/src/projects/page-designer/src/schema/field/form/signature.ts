import { PropGroup, FormComponents, StyleGroup, Platform } from '/@page-designer/enum';
import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';
import { Signature } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Signature, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Signature,
  icon: 'icon-qianming1',
  props: {
    required: false,
    fieldRequired: false,
    multiple: false,
    signatureType: SignatureTypeEnum.SIGNATURE_ONLY,
    ...formItemProps,
    fieldType: undefined,
    displayStyle: SignatureStyleEnum.VERTICAL,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
  ignoringStyle: ['height'],
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  {
    component: 'select-editor',
    name: 'signatureType',
    label: 'sys.pageDesigner.signatureType',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      showSearch: true,
      options: Object.keys(SignatureTypeEnum).map((key) => {
        return {
          label: 'sys.pageDesigner.' + SignatureTypeEnum[key],
          value: SignatureTypeEnum[key],
        };
      }),
    },
  },
  {
    component: 'datetime-style-editor',
    name: 'displayStyle',
    label: 'sys.pageDesigner.displayStyle',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return widget.props.signatureType !== SignatureTypeEnum.SIGNATURE_DATETIME;
    },
  },
  {
    component: 'date-style-editor',
    name: 'displayStyle',
    label: 'sys.pageDesigner.displayStyle',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return widget.props.signatureType !== SignatureTypeEnum.SIGNATURE_DATE;
    },
  },
  // ...commonFieldEditorConfig.placeholderEditor,
  ...commonFieldEditorConfig.validatorEditor,
  // ...commonFieldEditorConfig.explainEditor,
  // 填写说明开关
  {
    component: 'switch-editor',
    name: 'showExplain',
    label: 'sys.pageDesigner.explain',
    formItemStyle: { marginBottom: '12px' },
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      if (
        widget.props.bindFieldKey ||
        widget.props.fieldReadonly ||
        widget.materialType === MaterialEnum.MaterialFormField
      ) {
        return true;
      }
      return widget.platform === Platform.MOBILE;
    },
  },
  // 填写说明内容
  {
    component: 'texteare-editor',
    name: 'explain',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return !widget.props.showExplain;
    },
    _config: {
      i18n: true,
    },
  },
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onChange',
    title: 'sys.pageDesigner.onChange',
    params: ['value', 'valueData', 'formData'],
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
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

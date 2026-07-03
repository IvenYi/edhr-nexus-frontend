import {
  PropGroup,
  FormComponents,
  CURRENCY_ENUM,
  CURRENCY_LANG_ENUM,
  TIMETYPE_ENUM,
  TIMETYPE_LANG_ENUM,
  StyleGroup,
  TagTypeEnum,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { InputDouble } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';
import { deviceEvent } from '../../common-config/common-event-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<InputDouble, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.InputDouble,
  icon: '',
  props: {
    ...formItemProps,
    defaultValue: undefined,
    placeholder: '${sys.inputText}',
    notAutoFix: false,
    required: false,
    fieldRequired: false,
    maxValue: undefined,
    minValue: undefined,
    maxValueExpression: '',
    minValueExpression: '',
    getFocus: false,
    clearable: false,
    fieldType: undefined,
    displayCurrency: false,
    separator: false,
    currency: CURRENCY_ENUM['￥'],
    displayTimeType: TIMETYPE_ENUM['d:h:m:s'],
    bindCompStyleType: BindCmpStyleEnum.CMP_NUMBER,
    multiFieldDisplay: false,
    multiFieldConfig: [],
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly', 'getFocus']),
  ...commonFieldEditorConfig.placeholderEditor,
  // 默认值
  {
    component: 'double-number-editor',
    name: 'defaultValue',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      supportGlobData: true,
      min: (widget) => {
        return widget?.props?.minValue;
      },
      max: (widget) => {
        return widget?.props?.maxValue;
      },
    },
    formField: true,
    hidden(widget: InputDouble) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
  },
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: BindCmpStyleTypeEnum.BindNum,
    filterOptionsCallback: (item: BindCmpStyleEnum) => item !== BindCmpStyleEnum.CMP_TIME,
  }),
  // 显示币种
  // {
  //   component: 'checkbox-editor',
  //   name: 'displayCurrency',
  //   label: '',
  //   group: PropGroup.FIELD_CONFIG,
  //   hidden(widget) {
  //     return widget.props.bindFieldKey;
  //   },
  // },
  // 显示时间内容
  {
    component: 'select-editor',
    name: 'displayTimeType',
    label: 'sys.pageDesigner.timeType',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return widget.props.bindCompStyleType !== BindCmpStyleEnum.CMP_TIME;
    },
    _config: {
      showSearch: true,
      placeholder: 'sys.pageDesigner.timeType',
      clearable: false,
      options: Object.keys(TIMETYPE_ENUM).map((key) => {
        return {
          label: 'sys.component.time.' + TIMETYPE_LANG_ENUM[key],
          value: TIMETYPE_ENUM[key],
        };
      }),
    },
  },
  // 显示币种内容
  {
    component: 'select-editor',
    name: 'currency',
    label: '',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return widget.props.bindCompStyleType !== BindCmpStyleEnum.CMP_CURRENCY;
    },
    _config: {
      showSearch: true,
      placeholder: 'sys.chooseText',
      clearable: false,
      options: Object.keys(CURRENCY_ENUM).map((key) => {
        return { label: 'sys.pageDesigner.' + CURRENCY_LANG_ENUM[key], value: CURRENCY_ENUM[key] };
      }),
    },
  },
  // 千分位开关
  {
    component: 'switch-editor',
    name: 'separator',
    label: 'sys.pageDesigner.separator',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget) {
      return widget.props.bindCompStyleType !== BindCmpStyleEnum.CMP_CURRENCY;
      // return !widget.props.displayCurrency;
    },
  },
  // 自动修复错误数字
  {
    component: 'checkbox-editor',
    name: 'notAutoFix',
    label: 'sys.pageDesigner.dataValidator',
    group: PropGroup.FIELD_CONFIG,
  },
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
  ...commonFieldEditorConfig.mutiFieldEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType !== MaterialEnum.MaterialTableField ||
        (widget.materialType === MaterialEnum.MaterialTableField &&
          widget.platform !== Platform.WEB)
      );
    },
  },
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
    name: 'onEnter',
    title: 'sys.pageDesigner.onEnter',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'onBlur',
    title: 'sys.pageDesigner.onBlur',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'onFocus',
    title: 'sys.pageDesigner.onFocus',
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  ...deviceEvent,
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
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
  },
  {
    component: 'boolean-editor',
    name: 'tagStyleOpen',
    label: 'sys.pageDesigner.tagStyle',
    group: StyleGroup.STYLE,
    _config: {
      showType: 'checkbox',
      options: [
        {
          label: 'sys.pageDesigner.configureContentAsLabelStyle',
          value: true,
        },
      ],
    },
    changeCallback: (widget, value) => {
      if (value && !widget.style.tagStyle) {
        widget.style.tagStyle = {
          color: '',
          tagType: TagTypeEnum.RADIUS,
        };
      }
    },
  },
  {
    component: 'tag-editor',
    name: 'tagStyle',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      return !widget.style.tagStyleOpen;
    },
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
export const runCallback: LowCodeWidget.RunCallback = (_node: InputDouble) => {};

// export const beforeCreate = (_node: InputNumber) => {};

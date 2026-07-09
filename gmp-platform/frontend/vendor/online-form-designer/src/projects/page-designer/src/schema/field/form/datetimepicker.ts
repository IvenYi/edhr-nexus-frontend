import {
  PropGroup,
  FormComponents,
  DateRangeEnums,
  StyleGroup,
  TagTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { DateTimepicker } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { deviceEvent } from '../../common-config/common-event-config';
import { DatepickerTypes } from '../../common';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<DateTimepicker, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.DateTimepicker,
  icon: '',
  props: {
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    clearable: true,
    startDate: '',
    endDate: '',
    separator: '-',
    format: 'YYYY-MM-DD HH:mm:ss',
    defaultSysDate: undefined,
    range: undefined,
    dateType: 'YYYY-MM-DD HH:mm:ss',
    ...formItemProps,
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
  ...commonFieldEditorConfig.getInputAttrEditor(['required', 'readonly']),
  ...commonFieldEditorConfig.placeholderEditor,
  // 日期类型格式
  {
    component: 'data-type-format-editor',
    name: '',
    label: 'sys.pageDesigner.dataTimeFormat',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      initPickerType: 'YYYY-MM-DD HH:mm:ss',
      options: DatepickerTypes[FormComponents.DateTimepicker].map((i) => {
        return { value: i.value, label: i.label };
      }),
    },
    hidden(widget) {
      return widget.props.bindFieldKey || widget.props.fieldReadonly;
    },
  },
  // 日期范围
  {
    component: 'select-editor',
    name: 'range',
    label: 'sys.pageDesigner.ranges',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      options: Object.keys(DateRangeEnums).map((key) => {
        return { label: DateRangeEnums[key], value: key };
      }),
    },
    hidden(widget) {
      return widget.props.bindFieldKey || widget.props.fieldReadonly;
    },
  },

  // 默认值
  {
    component: 'select-editor',
    name: 'defaultSysDate',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      supportGlobData: true,
      options: [
        { label: 'sys.none', value: FieldSysVarDefaultValueEnum.NULL },
        { label: 'sys.sysDateTime', value: FieldSysVarDefaultValueEnum.SYS_DATE_TIME },
      ],
    },
    formField: true,
    hidden(widget: DateTimepicker) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
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
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
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
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

import {
  PropGroup,
  FormComponents,
  StyleGroup,
  TagTypeEnum,
  CURRENCY_ENUM,
  CURRENCY_LANG_ENUM,
  BindCmpStyleTypeEnum,
  BindCmpStyleEnum,
  TIMETYPE_ENUM,
  TIMETYPE_LANG_ENUM,
  Platform,
} from '/@page-designer/enum';
import { Agg } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { DatepickerTypes } from '../../common';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Agg, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.AGG,
  icon: '',
  props: {
    returnType: '',
    ...formItemProps,
    bindCompStyleType: undefined,
    fieldType: undefined,
    precision: 0,
    displayCurrency: false,
    currency: CURRENCY_ENUM['￥'],
    displayTimeType: TIMETYPE_ENUM['d:h:m:s'],
    separator: undefined,
    format: undefined,
    dateType: undefined,
    timeType: undefined,
    readonly: true,
    multiFieldDisplay: false,
    multiFieldConfig: [],
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const aggBasicPropEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: (widget) => {
      return BindCmpStyleTypeEnum.BindNum;
    },
    hiddenCallback: (widget) => {
      return [FIELD_TYPE.DATE, FIELD_TYPE.TIME, FIELD_TYPE.DATE_TIME].includes(
        widget.props.returnType,
      );
    },
    filterOptionsCallback: (item: BindCmpStyleEnum, widget) => {
      if (widget.props.returnType === FIELD_TYPE.DECIMAL) {
        return item !== BindCmpStyleEnum.CMP_TIME;
      }
      return true;
    },
  }),

  // 显示币种
  // {
  //   component: 'checkbox-editor',
  //   name: 'displayCurrency',
  //   label: '',
  //   group: PropGroup.FIELD_CONFIG,
  //   hidden(widget) {
  //     return ['date', 'time', 'date_time'].includes(widget.props.returnType);
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

  // 日期类型格式
  {
    component: 'data-type-format-editor',
    name: '',
    label: 'sys.pageDesigner.dateTypeFormat',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      initPickerType: 'YYYY-MM-DD',
      options: DatepickerTypes[FormComponents.Datepicker].map((i) => {
        return { value: i.value, label: i.label };
      }),
    },
    hidden(widget) {
      return 'date' !== widget.props.returnType;
    },
  },

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
      return 'date_time' !== widget.props.returnType;
    },
  },

  // 时间类型
  {
    component: 'select-editor',
    name: 'timeType',
    label: 'sys.pageDesigner.timeType',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      options: DatepickerTypes[FormComponents.Timepicker].map((i) => {
        return { value: i.value, label: i.label };
      }),
    },
    changeCallback(widget, v) {
      widget.props.format = v;
    },
    hidden(widget) {
      return 'time' !== widget.props.returnType;
    },
  },
];

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,

  ...aggBasicPropEditorList,

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
      console.log(value, widget);
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
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

// export const beforeCreate = (_node: Input) => {};

import {
  Platform,
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  StyleGroup,
  TagTypeEnum,
  CURRENCY_ENUM,
  CURRENCY_LANG_ENUM,
  TIMETYPE_ENUM,
  TIMETYPE_LANG_ENUM,
} from '/@page-designer/enum';
import { Expression } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { FIELD_TYPE, MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Expression, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.EXPRESSION,
  icon: '',
  props: {
    returnType: '',
    bindCompStyleType: undefined,
    ...formItemProps,
    fieldType: undefined,
    precision: 0,
    displayCurrency: false,
    separator: false,
    currency: CURRENCY_ENUM['￥'],
    displayTimeType: TIMETYPE_ENUM['d:h:m:s'],
    readonly: true,
    isRealCompute: false,
    /**关联关系配置 */
    ruleConfig: undefined,
    expType: '',
    truelabel: '真',
    falselabel: '假',
    multiFieldDisplay: false,
    multiFieldConfig: [],
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const expressionBasicPropEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: (widget) => {
      if (widget.props.returnType === FIELD_TYPE.BOOLEAN) {
        return BindCmpStyleTypeEnum.BindBool;
      }
      return BindCmpStyleTypeEnum.BindNum;
    },
    hiddenCallback: (widget) => {
      return ![
        FIELD_TYPE.BOOLEAN,
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.LONG,
      ].includes(widget.props.returnType);
    },
    filterOptionsCallback: (item: BindCmpStyleEnum, widget) => {
      if (widget.props.returnType === FIELD_TYPE.DECIMAL) {
        return item !== BindCmpStyleEnum.CMP_TIME;
      }
      return true;
    },
  }),
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
];

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,

  ...expressionBasicPropEditorList,

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
        widget.materialType === MaterialEnum.MaterialTableSelectField ||
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
    hidden: (widget) => {
      return widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN;
    },
  },
  {
    component: 'tag-editor',
    name: 'tagStyle',
    group: StyleGroup.STYLE,
    hidden: (widget) => {
      if (widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) return true;
      return !widget.style.tagStyleOpen;
    },
  },
];
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

// export const beforeCreate = (_node: Input) => {};

import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  StyleGroup,
  TagTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { MaterialEnum, FIELD_TYPE } from '/@/enums/appEnum';
import { Textarea } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { changeCmpData } from '../../utils';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { deviceEvent } from '../../common-config/common-event-config';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Textarea, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Textarea,
  icon: '',
  props: {
    defaultValue: undefined,
    placeholder: '${sys.inputText}',
    required: false,
    fieldRequired: false,
    reg: '',
    regHint: '',
    regSwitch: true,
    getFocus: false,
    clearable: false,
    maxlength: undefined,
    minlength: undefined,
    ...formItemProps,
    bindCompStyleType: BindCmpStyleEnum.CMP_TEXTAREA,
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
    component: 'text-editor',
    name: 'defaultValue',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      i18n: true,
      showCount: true,
      supportGlobData: true,
      maxlength: (widget) => {
        return widget?.props?.maxlength;
      },
    },
    formField: true,
    hidden(widget: Textarea) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
  },
  {
    component: 'bind-cmp-type-editor',
    name: 'bindCompStyleType',
    label: 'sys.pageDesigner.bindCmpStyleLabel',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      bindCmpStyleKey: (widget: Textarea) => {
        if (widget.props.fieldType === FIELD_TYPE.LONG_TEXT && widget.props.readonly) {
          return BindCmpStyleTypeEnum.BindLongText;
        } else {
          return BindCmpStyleTypeEnum.BindText;
        }
      },
    },
    hidden(widget: Textarea) {
      return widget.materialType !== MaterialEnum.MaterialFormField;
    },
    changeCallback(widget) {
      changeCmpData(widget);
    },
  },
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...commonFieldEditorConfig.regexEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
  ...commonFieldEditorConfig.mutiFieldEditor,
];

export const eventList: LowCodeWidget.EventsType[] = [
  {
    name: 'onClick',
    title: 'sys.pageDesigner.onClick',
    params: ['value', 'valueData', 'formData'],
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
export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

export const beforeCreate = (_node: Textarea) => {
  if (
    _node.materialType === MaterialEnum.MaterialTableField ||
    _node.materialType === MaterialEnum.MaterialSubTableField
  ) {
    //表格下面长文本还是显示单选
    _node.props.bindCompStyleType = BindCmpStyleEnum.CMP_TEXT;
    _node.type = FormComponents.Input;
  }
};

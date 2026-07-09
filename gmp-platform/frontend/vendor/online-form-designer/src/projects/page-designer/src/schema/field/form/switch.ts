import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  StyleGroup,
  TagTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { Switch } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
import { getBooleanList } from '/@page-designer/components/widgets/hooks/hooks';
import { deviceEvent } from '../../common-config/common-event-config';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Switch, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Switch,
  icon: '',
  props: {
    defaultValue: undefined,
    ...formItemProps,
    bindCompStyleType: BindCmpStyleEnum.CMP_BOOLEAN,
    embeddedSearch: true,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
};

export const propEditorList: LowCodeWidget.PropEditor[] = [
  ...commonFieldEditorConfig.basicFieldEditor,
  ...commonFieldEditorConfig.getInputAttrEditor(['readonly']),
  {
    component: 'input-attr-editor',
    name: '',
    label: 'sys.pageDesigner.inputAttr',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      needFieldAttrs: ['readonly'],
    },
  },
  // 布尔的默认值
  {
    component: 'select-editor',
    name: 'defaultValue',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      clearable: false,
      supportGlobData: true,
      options: async (widget) => {
        if (!widget.props.modelKey || !widget.props.field) return [];

        const { valueList } = await getBooleanList({
          modelKey: widget.props.modelKey,
          fieldKey: widget.props.field,
        });

        return valueList;
      },
    },
    formField: true,
    hidden(widget: Switch) {
      return (
        widget.props.bindFieldKey ||
        widget.props.readonly ||
        widget.props.fieldReadonly ||
        widget.props.field === 'operating_state_'
      );
    },
  },
  ...commonFieldEditorConfig.getBindCmpTypeEditor({
    name: 'bindCompStyleType',
    type: BindCmpStyleTypeEnum.BindBool,
  }),
  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
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
    hidden: (widget) => {
      return widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN;
    },
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
      if (widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_BOOLEAN) return true;
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
  ...deviceEvent,
];

export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

// export const beforeCreate = (_node: Input) => {};

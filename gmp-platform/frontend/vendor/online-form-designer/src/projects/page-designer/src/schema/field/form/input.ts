import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  BindCmpStyleTypeEnum,
  StyleGroup,
  TagTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { Input } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { MaterialEnum, FIELD_TYPE } from '/@/enums/appEnum';
import { changeCmpData } from '../../utils';
import { deviceEvent } from '../../common-config/common-event-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Input, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Input,
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
    bindCompStyleType: BindCmpStyleEnum.CMP_TEXT,
    fieldType: undefined,
    embeddedSearch: true,
    searchTooltip: false,
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
    hidden(widget: Input) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
  },
  {
    component: 'bind-cmp-type-editor',
    name: 'bindCompStyleType',
    label: 'sys.pageDesigner.bindCmpStyleLabel',
    group: PropGroup.FIELD_CONFIG,
    _config: {
      bindCmpStyleKey: (widget: Input) => {
        if (widget.props.fieldType === FIELD_TYPE.LONG_TEXT && widget.props.readonly) {
          return BindCmpStyleTypeEnum.BindLongText;
        } else {
          return BindCmpStyleTypeEnum.BindText;
        }
      },
    },
    hidden(widget: Input) {
      return widget.materialType !== MaterialEnum.MaterialFormField;
    },
    changeCallback(widget, value) {
      changeCmpData(widget);
    },
  },
  ...commonFieldEditorConfig.validatorEditor,
  {
    component: 'switch-editor',
    name: 'searchTooltip',
    label: 'sys.pageDesigner.searchTooltip',
    group: PropGroup.FIELD_CONFIG,
    hidden: (widget) => {
      return (
        (widget.platform !== Platform.WEB && widget.platform !== Platform.PAD) ||
        widget.props.fieldType !== FIELD_TYPE.TEXT ||
        [MaterialEnum.MaterialSubTableField, MaterialEnum.MaterialSubTableModalField].includes(
          widget.materialType,
        )
      );
    },
  },
  {
    component: 'switch-editor',
    name: 'edhrLabelMode',
    label: '标签模式',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
  },
  {
    component: 'switch-editor',
    name: 'edhrColorMode',
    label: '颜色选择器',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
  },
  {
    component: 'select-editor',
    name: 'edhrDefaultColor',
    label: '默认颜色',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    _config: {
      showSearch: true,
      options() {
        return [
          {
            label: '蓝色',
            value: '#026ac8',
          },
          {
            label: '白色',
            value: '#fff',
          },
        ];
      },
    },
  },

  {
    component: 'switch-editor',
    name: 'edhrLabelExampleMode',
    label: '示例模式',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
  },
  {
    component: 'switch-editor',
    name: 'edhrIsExample',
    label: '是否是示例',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
  },
  {
    component: 'ref-form-editor',
    name: 'edhrLabelExampleRefForm',
    label: '示例表单',
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    required: false,
    _config: {
      bindModelKey: 'edhrLabelExampleModelKey',
    },
    hidden: (widget) => {
      return !widget.props.edhrLabelExampleMode;
    },
    onMounted(widget) {
      if (!widget.props?.edhrLabelExampleRefForm) return;
      const { excludeSubTableFormWidget } = useDesigner();
      const formWidget = excludeSubTableFormWidget.value.find(
        (item) => item.id === widget.props?.edhrLabelExampleRefForm,
      );
      if (!formWidget) {
        widget.props.edhrLabelExampleRefForm = '';
      }
    },
  },
  {
    component: 'select-editor',
    name: 'edhrLabelNameField',
    label: '示例字段-标签名称',
    required: false,
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    _config: {
      showSearch: true,
      options: async (widget) => {
        const data =
          (await getFieldMetaList({ modelKey: widget.props.edhrLabelExampleModelKey })) || [];
        return data.map((e) => {
          return {
            ...e,
            label: e.name,
            value: e.key,
          };
        });
      },
    },
    hidden: (widget) => {
      return !widget.props.edhrLabelExampleMode;
    },
  },
  {
    component: 'select-editor',
    name: 'edhrLabelStyleField',
    label: '示例字段-标签样式',
    required: false,
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    _config: {
      showSearch: true,
      options: async (widget) => {
        const data =
          (await getFieldMetaList({ modelKey: widget.props.edhrLabelExampleModelKey })) || [];
        return data.map((e) => {
          return {
            ...e,
            label: e.name,
            value: e.key,
          };
        });
      },
    },
    hidden: (widget) => {
      return !widget.props.edhrLabelExampleMode;
    },
  },
  {
    component: 'select-editor',
    name: 'edhrLabelStyleColorField',
    label: '示例字段-标签样式颜色',
    required: false,
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    _config: {
      showSearch: true,
      options: async (widget) => {
        const data =
          (await getFieldMetaList({ modelKey: widget.props.edhrLabelExampleModelKey })) || [];
        return data.map((e) => {
          return {
            ...e,
            label: e.name,
            value: e.key,
          };
        });
      },
    },
    hidden: (widget) => {
      return !widget.props.edhrLabelExampleMode;
    },
  },
  {
    component: 'select-editor',
    name: 'edhrLabelNameColorField',
    label: '示例字段-标签名称颜色',
    required: false,
    group: PropGroup.FIELD_CONFIG,
    kit: ['eDHR'],
    _config: {
      showSearch: true,
      options: async (widget) => {
        const data =
          (await getFieldMetaList({ modelKey: widget.props.edhrLabelExampleModelKey })) || [];
        return data.map((e) => {
          return {
            ...e,
            label: e.name,
            value: e.key,
          };
        });
      },
    },
    hidden: (widget) => {
      return !widget.props.edhrLabelExampleMode;
    },
  },
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
    params: ['value', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
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

export const beforeCreate = (_node: Input) => {};

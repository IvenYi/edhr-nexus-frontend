import { FormComponents, Platform, PropGroup, StyleGroup, TagTypeEnum } from '/@page-designer/enum';
import { Transaction } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Transaction, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Transaction,
  icon: '',
  props: {
    multiple: false,
    clearable: true,
    defaultValue: undefined,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    bindModelKey: '',
    ...formItemProps,
    fieldType: undefined,
    isCustomField: false,
    customFieldFilter: [],
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
  {
    component: 'switch-editor',
    name: 'isCustomField',
    label: 'sys.pageDesigner.customField',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget: Transaction) {
      return widget.props.readonly || widget.props.fieldReadonly;
    },
    changeCallback: (widget, value) => {
      widget.props.defaultValue = undefined;
    },
  },
  {
    component: 'select-editor',
    name: 'customFieldFilter',
    label: 'sys.pageDesigner.fieldValue',
    group: PropGroup.FIELD_CONFIG,
    required: true,
    hidden: (widget) => {
      return widget.props.readonly || widget.props.fieldReadonly || !widget.props.isCustomField;
    },
    _config: {
      multiple: true,
      supportGlobData: true,
      options: async (widget) => {
        const data =
          (await getDesignerCommonTableEntityModelList({
            type: 'TRANSACTION',
          })) || [];
        return data.map((i) => {
          return { value: i.key, label: i.name };
        });
      },
    },
    changeCallback: (widget, value) => {
      widget.props.defaultValue = undefined;
    },
  },
  // 默认值
  {
    component: 'select-editor',
    name: 'defaultValue',
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    hidden(widget: Transaction) {
      return widget.props.bindFieldKey || widget.props.readonly || widget.props.fieldReadonly;
    },
    formField: true,
    _config: {
      supportGlobData: true,
      options: async (widget) => {
        const data =
          (await getDesignerCommonTableEntityModelList({
            type: 'TRANSACTION',
          })) || [];
        if (widget.props.isCustomField) {
          const filter = data.filter((item) => {
            return widget.props.customFieldFilter.includes(item.key);
          });
          return filter.map((i) => {
            return { value: i.key, label: i.name };
          });
        }
        return data.map((i) => {
          return { value: i.key, label: i.name };
        });

        // const defaultOpt = !widget.props.multiple ? [{ value: '', label: 'sys.none' }] : [];
      },
      valueType: 'string',
    },
  },

  ...commonFieldEditorConfig.validatorEditor,
  ...commonFieldEditorConfig.explainEditor,
  ...editor,
  ...commonFieldEditorConfig.submitInHideEditor,
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
    params: ['value', 'row'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
    params: ['clearValue', 'clearRow'],
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
  {
    component: 'font-editor',
    name: 'contentFont',
    label: 'sys.content',
    group: StyleGroup.STYLE,
    _config: {
      hiddenColor: true, //隐藏颜色
    },
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

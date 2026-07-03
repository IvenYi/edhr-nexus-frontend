import {
  PropGroup,
  FormComponents,
  BindCmpStyleEnum,
  StyleGroup,
  TagTypeEnum,
  Platform,
} from '/@page-designer/enum';
import { Printer } from '/@page-designer/types/web';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

import { FIELD_TYPE } from '@/enums/appEnum';
import { formItemProps } from '../../common-config/formItem-editor-config';
import { displayEditor as editor } from '../../common-config/display-editor-config';
import commonFieldEditorConfig from '../../common-config/common-field-editor-config';
import { getPrintPrintDropdownList } from '/@/apis/gct-apaas/PrintController';
import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
import { MaterialEnum } from '/@/enums/appEnum';

//以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
export const widget: PartialByKeys<Printer, 'platform'> = {
  id: '',
  platform: undefined,
  name: '',
  alias: '',
  type: FormComponents.Printer,
  icon: 'icon-dayinanniu',
  props: {
    clearable: true,
    defaultValue: undefined,
    placeholder: '${sys.chooseText}',
    required: false,
    fieldRequired: false,
    bindModelKey: '',
    multiple: false,
    ...formItemProps,
    bindCompStyleType: BindCmpStyleEnum.CMP_TREE_SELECTION,
    fieldType: undefined,
    selectOption: [],
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
    component: 'printer-select-option-editor',
    name: { defaultValue: 'defaultValue', selectOption: 'selectOption' },
    label: 'sys.pageDesigner.defaultValue',
    group: PropGroup.FIELD_CONFIG,
    formField: true,
    hidden: (widget) => {
      return !widget.props.modelKey || widget.props.readonly;
    },
    _config: {
      defaultExpandAll: true,
      clearable: true,
      tagName: 'sys.default',
      supportGlobData: true,
      showTagFunc: (row) => row.defaultPrint === '是',
      options: async (widget) => {
        if (!widget.props.modelKey) return [];
        const data: any[] = (await getPrintPrintDropdownList()) || [];
        return data.map((i) => {
          const dftInfo =
            (i.printChildNode && i.printChildNode.filter((e) => e.defaultPrint === '是')[0]) ||
            undefined;
          return {
            ...i,
            value: i.printKey,
            label: i.name,
            disabled: i.type === PrintResourceEnum.INTERNET_PRINT,
            dftPrintInfo:
              i.type === PrintResourceEnum.CLIENT_PRINT && dftInfo
                ? { ...dftInfo, value: dftInfo.printKey, label: dftInfo.name }
                : undefined,
            children: i.printChildNode
              ? i.printChildNode.map((e) => {
                  return {
                    ...e,
                    value: e.printKey,
                    label: e.name,
                  };
                })
              : [],
          };
        });
      },
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
    params: ['value', 'valueData', 'formData'],
    hidden: (widget) => {
      return (
        widget.materialType === MaterialEnum.MaterialTableField && widget.platform !== Platform.WEB
      );
    },
  },
  {
    name: 'afterClear',
    title: 'sys.pageDesigner.afterClear',
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

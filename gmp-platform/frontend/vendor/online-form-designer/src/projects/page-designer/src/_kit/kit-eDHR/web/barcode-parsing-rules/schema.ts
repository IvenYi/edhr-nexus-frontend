import {
  CreateType,
  DisplayEnums,
  IDesignerProvider,
  LowCodeWidget,
  MaterialEnum,
  Platform,
  PropGroup,
  StyleGroup,
} from '@gct/runtime';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../../enums';
import {
  displayEditor,
  displayProps,
} from '/@page-designer/schema/common-config/display-editor-config';
import commonFieldEditorConfig from '/@page-designer/schema/common-config/common-field-editor-config';

export interface LabelParsingRulesProps extends LowCodeWidget.WidgetProps {
  label: string;
  readonly: boolean;
  required: boolean;
  disabled: boolean;
  /** 显示标题 */
  displayLabelText: boolean;
  field: string;
}
export interface ILabelParsingRules extends LowCodeWidget.BasicSchema {
  props: LabelParsingRulesProps;
}

export default class LabelParsingRules implements IDesignerProvider {
  component: Component = defineAsyncComponent(() => import('./label-parsing-rules-designer.vue'));

  kit: string[] = ['eDHR'];
  schema: ILabelParsingRules = {
    id: '',
    platform: Platform.WEB,
    name: '标签解析规则',
    alias: '',
    type: KitType.LABEL_PARSING_RULES,
    display: DisplayEnums.BLOCK,
    icon: '',
    isField: true,
    materialType: MaterialEnum.MaterialFormField,
    props: {
      label: '${sys.edhr.labelParsingRules}',
      required: false,
      readonly: false,
      disabled: false,
      displayLabelText: true,
      field: '',
      ...displayProps,
    },
    style: {},
    events: {},
    formItem: false,
    i18n: {},
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'root:name',
      label: 'sys.pageDesigner.widgetName',
      group: PropGroup.BASIC,
      _config: {
        i18n: true,
        showCount: true,
        maxlength: 32,
      },
    },
    {
      component: 'text-editor',
      name: 'label',
      label: 'sys.pageDesigner.title',
      group: PropGroup.FIELD_CONFIG,
      _config: {
        i18n: true,
        showCount: true,
      },
    },
    {
      component: 'field-editor',
      name: 'field',
      label: 'sys.pageDesigner.field',
      group: PropGroup.FIELD_CONFIG,
      required: true,
      _config: {
        tips: '绑定当前表单对应模型中的相关关联字段',
        modelKey: 'refFormModel',
        filterTypes: [CreateType.USER_DEFINED, CreateType.BUILTIN],
      },
    },
    {
      component: 'checkbox-editor',
      name: 'displayLabelText',
      label: 'sys.pageDesigner.displayLabelText',
      group: PropGroup.FIELD_CONFIG,
    },
    ...commonFieldEditorConfig.getInputAttrEditor(['readonly', 'required']),
    ...commonFieldEditorConfig.placeholderEditor,
    ...commonFieldEditorConfig.validatorEditor,
    ...commonFieldEditorConfig.explainEditor,
    ...(displayEditor as any),
  ];
  events?: LowCodeWidget.EventsType[] = [];
  styleEditors: LowCodeWidget.StyleEditor[] = [
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
}
